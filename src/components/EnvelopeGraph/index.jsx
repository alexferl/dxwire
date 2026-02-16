import { createMemo } from "solid-js"
import "./style.css"

/**
 * SVG visualization for DX7 Envelope Generators (EG and Pitch EG).
 *
 * Renders a 6-point envelope: L4 (idle) → L4 (KEY ON) → L1 → L2 → L3 (KEY OFF) → L4.
 * Segments are drawn with widths proportional to rate/distance ratios.
 *
 * @param {Object} props
 * @param {"amplitude" | "pitch"} [props.type="amplitude"] - Envelope type
 * @param {number[]} props.levels - [L1, L2, L3, L4] (0-99)
 * @param {number[]} props.rates - [R1, R2, R3, R4] (0-99)
 * @param {boolean} [props.showADSR=true] - Show ADSR visualization (colored fills, labels, etc.)
 * @returns {import("solid-js").JSX.Element}
 */
export function EnvelopeGraph(props) {
  const type = () => props.type ?? "amplitude"
  const showADSR = () => props.showADSR ?? true

  // Use viewBox for scaling - aspect ratio varies based on showADSR
  const viewBoxWidth = 280
  const viewBoxHeight = () => (showADSR() ? 160 : 140)
  const paddingLeft = viewBoxWidth * 0.12
  const paddingRight = viewBoxWidth * 0.04
  const paddingTop = () => viewBoxHeight() * 0.18
  const paddingBottom = () => (showADSR() ? viewBoxHeight() * 0.2 : viewBoxHeight() * 0.12)
  const graphWidth = () => viewBoxWidth - paddingLeft - paddingRight
  const graphHeight = () => viewBoxHeight() - paddingTop() - paddingBottom()

  // Convert level (0-99) to Y position (0 at bottom, 99 at top)
  const levelToY = (level) => {
    return paddingTop() + graphHeight() - (level / 99) * graphHeight()
  }

  // Base width calculation: rate 50 = neutral (1.0), rate 0 = slow (3.0), rate 99 = fast (0.2)
  const rateToWidthFactor = (rate) => {
    if (rate <= 0) return 3.0
    if (rate >= 99) return 0.2
    return 3.0 * ((100 - rate) / 100) ** 0.7 + 0.2
  }

  // Calculate relative segment widths
  const calculateSegmentWidth = (fromLevel, toLevel, rate) => {
    const distance = Math.abs(toLevel - fromLevel)
    const distanceFactor = Math.max(distance / 99, 0.3)
    const rateFactor = rateToWidthFactor(rate)
    return distanceFactor * rateFactor
  }

  // Reactive calculations based on props
  const envelopeData = createMemo(() => {
    const [l1, l2, l3, l4] = props.levels
    const [r1, r2, r3, r4] = props.rates

    const attackWidth = calculateSegmentWidth(l4, l1, r1)
    const decay1Width = calculateSegmentWidth(l1, l2, r2)
    const decay2Width = calculateSegmentWidth(l2, l3, r3)
    const releaseWidth = calculateSegmentWidth(l3, l4, r4)

    const totalActiveWidth = attackWidth + decay1Width + decay2Width + releaseWidth

    const idlePixelWidth = graphWidth() * 0.08
    const activePixelWidth = graphWidth() * 0.92

    const x1 = paddingLeft
    const x2 = x1 + idlePixelWidth
    const x3 = x2 + (attackWidth / totalActiveWidth) * activePixelWidth
    const x4 = x3 + (decay1Width / totalActiveWidth) * activePixelWidth
    const x5 = x4 + (decay2Width / totalActiveWidth) * activePixelWidth
    const x6 = x5 + (releaseWidth / totalActiveWidth) * activePixelWidth

    const y1 = levelToY(l4)
    const y2 = levelToY(l4)
    const y3 = levelToY(l1)
    const y4 = levelToY(l2)
    const y5 = levelToY(l3)
    const y6 = levelToY(l4)

    const bottomY = paddingTop() + graphHeight()

    return {
      x1,
      x2,
      x3,
      x4,
      x5,
      x6,
      y1,
      y2,
      y3,
      y4,
      y5,
      y6,
      bottomY,
    }
  })

  // Build path data
  const paths = () => {
    const d = envelopeData()
    return {
      idle: `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`,
      active: `M ${d.x2} ${d.y2} L ${d.x3} ${d.y3} L ${d.x4} ${d.y4} L ${d.x5} ${d.y5}`,
      release: `M ${d.x5} ${d.y5} L ${d.x6} ${d.y6}`,
      attackFill: `M ${d.x2} ${d.y2} L ${d.x3} ${d.y3} L ${d.x3} ${d.bottomY} L ${d.x2} ${d.bottomY} Z`,
      decayFill: `M ${d.x3} ${d.y3} L ${d.x4} ${d.y4} L ${d.x4} ${d.bottomY} L ${d.x3} ${d.bottomY} Z`,
      sustainFill: `M ${d.x4} ${d.y4} L ${d.x5} ${d.y5} L ${d.x5} ${d.bottomY} L ${d.x4} ${d.bottomY} Z`,
      releaseFill: `M ${d.x5} ${d.y5} L ${d.x6} ${d.y6} L ${d.x6} ${d.bottomY} L ${d.x5} ${d.bottomY} Z`,
    }
  }

  const yAxisLabel = "LEVEL"

  const aspectRatio = () => `${viewBoxWidth} / ${viewBoxHeight()}`

  return (
    <div class="envelope-graph" style={{ "aspect-ratio": aspectRatio() }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight()}`}
        role="img"
        aria-label="Envelope graph"
      >
        <title>Envelope graph</title>

        {/* Grid lines */}
        <g class="grid-lines">
          {/* Horizontal grid lines every 25 units */}
          <line
            x1={paddingLeft}
            y1={levelToY(25)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(25)}
            class="grid-line"
          />
          <line
            x1={paddingLeft}
            y1={levelToY(50)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(50)}
            class="grid-line"
          />
          <line
            x1={paddingLeft}
            y1={levelToY(75)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(75)}
            class="grid-line"
          />
          {/* Vertical grid at key points */}
          <line
            x1={envelopeData().x2}
            y1={paddingTop()}
            x2={envelopeData().x2}
            y2={paddingTop() + graphHeight()}
            class="grid-line grid-line-key"
          />
          <line
            x1={envelopeData().x5}
            y1={paddingTop()}
            x2={envelopeData().x5}
            y2={paddingTop() + graphHeight()}
            class="grid-line grid-line-key"
          />
        </g>

        {showADSR() && (
          <>
            {/* ADSR phase boundary markers (dotted lines from envelope peaks to time axis) */}
            <g class="adsr-markers">
              {/* Attack peak (L1) to time axis */}
              <line
                x1={envelopeData().x3}
                y1={paddingTop()}
                x2={envelopeData().x3}
                y2={paddingTop() + graphHeight()}
                class="adsr-marker"
              />
              {/* Decay end (L2) to time axis */}
              <line
                x1={envelopeData().x4}
                y1={paddingTop()}
                x2={envelopeData().x4}
                y2={paddingTop() + graphHeight()}
                class="adsr-marker"
              />
            </g>

            {/* ADSR phase labels */}
            <g class="adsr-labels">
              <text
                x={(envelopeData().x2 + envelopeData().x3) / 2}
                y={paddingTop() + graphHeight() + 12}
                text-anchor="middle"
                class="adsr-label asdr-label-attack"
              >
                A
              </text>
              <text
                x={(envelopeData().x3 + envelopeData().x4) / 2}
                y={paddingTop() + graphHeight() + 12}
                text-anchor="middle"
                class="adsr-label asdr-label-decay"
              >
                D
              </text>
              <text
                x={(envelopeData().x4 + envelopeData().x5) / 2}
                y={paddingTop() + graphHeight() + 12}
                text-anchor="middle"
                class="adsr-label asdr-label-sustain"
              >
                S
              </text>
              <text
                x={(envelopeData().x5 + envelopeData().x6) / 2}
                y={paddingTop() + graphHeight() + 12}
                text-anchor="middle"
                class="adsr-label asdr-label-release"
              >
                R
              </text>
            </g>
          </>
        )}

        {/* Concert pitch reference line (pitch mode only) */}
        {type() === "pitch" && (
          <line
            x1={paddingLeft}
            y1={levelToY(50)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(50)}
            class="concert-pitch-line"
          />
        )}

        {/* Fill areas under envelope */}
        {showADSR() ? (
          <>
            <path d={paths().attackFill} class="envelope-fill envelope-fill-attack" />
            <path d={paths().decayFill} class="envelope-fill envelope-fill-decay" />
            <path d={paths().sustainFill} class="envelope-fill envelope-fill-sustain" />
            <path d={paths().releaseFill} class="envelope-fill envelope-fill-release" />
          </>
        ) : (
          <path
            d={`${paths().active} L ${envelopeData().x6} ${envelopeData().y6} L ${envelopeData().x6} ${paddingTop() + graphHeight()} L ${envelopeData().x2} ${paddingTop() + graphHeight()} Z`}
            class="envelope-fill"
          />
        )}

        {/* Idle segment (light gray/dashed) */}
        <path d={paths().idle} class="envelope-path-idle" fill="none" />

        {/* Active segments (solid cyan) */}
        <path d={paths().active} class="envelope-path" fill="none" />

        {/* Release segment (dashed) */}
        <path d={paths().release} class="envelope-path-release" fill="none" />

        {/* KEY ON marker */}
        <line
          x1={envelopeData().x2}
          y1={paddingTop()}
          x2={envelopeData().x2}
          y2={paddingTop() + graphHeight()}
          class="key-marker key-on-marker"
        />
        <text
          x={envelopeData().x2 - 12}
          y={paddingTop() - 16}
          text-anchor="middle"
          class="key-marker-label key-on-label"
        >
          KEY ON
        </text>

        {/* KEY OFF marker */}
        <line
          x1={envelopeData().x5}
          y1={paddingTop()}
          x2={envelopeData().x5}
          y2={paddingTop() + graphHeight()}
          class="key-marker key-off-marker"
        />
        <text
          x={envelopeData().x5 - 14}
          y={paddingTop() - 16}
          text-anchor="middle"
          class="key-marker-label key-off-label"
        >
          KEY OFF
        </text>

        {/* Level markers (6 points) */}
        <circle cx={envelopeData().x1} cy={envelopeData().y1} r="3" class="level-marker level-marker-l4" />
        <circle cx={envelopeData().x2} cy={envelopeData().y2} r="3" class="level-marker level-marker-trigger" />
        <circle cx={envelopeData().x3} cy={envelopeData().y3} r="3" class="level-marker level-marker-l1" />
        <circle cx={envelopeData().x4} cy={envelopeData().y4} r="3" class="level-marker level-marker-l2" />
        <circle cx={envelopeData().x5} cy={envelopeData().y5} r="3" class="level-marker level-marker-l3" />
        <circle cx={envelopeData().x6} cy={envelopeData().y6} r="3" class="level-marker level-marker-l4-end" />

        {/* Parameter labels */}
        {/* L4 labels */}
        <text x={envelopeData().x1} y={envelopeData().y1 + 12} text-anchor="middle" class="param-label level-label">
          L4
        </text>
        <text x={envelopeData().x6 - 8} y={envelopeData().y6 + 12} text-anchor="middle" class="param-label level-label">
          L4
        </text>

        {/* L1 label */}
        <text x={envelopeData().x3} y={envelopeData().y3 - 6} text-anchor="middle" class="param-label level-label">
          L1
        </text>

        {/* L2 label */}
        <text x={envelopeData().x4} y={envelopeData().y4 - 6} text-anchor="middle" class="param-label level-label">
          L2
        </text>

        {/* L3 label */}
        <text x={envelopeData().x5} y={envelopeData().y5 - 6} text-anchor="middle" class="param-label level-label">
          L3
        </text>

        {/* Rate labels positioned along segments */}
        <text
          x={(envelopeData().x2 + envelopeData().x3) / 2}
          y={(envelopeData().y2 + envelopeData().y3) / 2 - 6}
          text-anchor="middle"
          class="param-label rate-label"
        >
          R1
        </text>
        <text
          x={(envelopeData().x3 + envelopeData().x4) / 2}
          y={(envelopeData().y3 + envelopeData().y4) / 2 - 6}
          text-anchor="middle"
          class="param-label rate-label"
        >
          R2
        </text>
        <text
          x={(envelopeData().x4 + envelopeData().x5) / 2}
          y={(envelopeData().y4 + envelopeData().y5) / 2 - 6}
          text-anchor="middle"
          class="param-label rate-label"
        >
          R3
        </text>
        <text
          x={(envelopeData().x5 + envelopeData().x6) / 2}
          y={(envelopeData().y5 + envelopeData().y6) / 2 - 6}
          text-anchor="middle"
          class="param-label rate-label"
        >
          R4
        </text>

        {/* Y-axis label */}
        <text
          x={14}
          y={levelToY(50) + 12}
          text-anchor="middle"
          transform={`rotate(-90, 14, ${levelToY(50) + 12})`}
          class="axis-label y-axis-label"
        >
          {yAxisLabel}
        </text>

        {/* X-axis label */}
        <text
          x={paddingLeft + graphWidth() / 2}
          y={paddingTop() + graphHeight() + (showADSR() ? 26 : 16)}
          text-anchor="middle"
          class="axis-label x-axis-label"
        >
          TIME
        </text>

        {/* Y-axis tick labels */}
        <text x={paddingLeft - 6} y={levelToY(0) + 3} text-anchor="end" class="tick-label">
          0
        </text>
        <text x={paddingLeft - 6} y={levelToY(50) + 3} text-anchor="end" class="tick-label">
          50
        </text>
        <text x={paddingLeft - 6} y={levelToY(99) + 3} text-anchor="end" class="tick-label">
          99
        </text>
      </svg>
    </div>
  )
}
