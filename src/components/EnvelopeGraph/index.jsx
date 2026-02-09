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
 * @returns {import("preact").VNode}
 */
export function EnvelopeGraph({ type = "amplitude", levels, rates, showADSR = true }) {
  const [l1, l2, l3, l4] = levels
  const [r1, r2, r3, r4] = rates

  // Use viewBox for scaling - aspect ratio varies based on showADSR
  const viewBoxWidth = 280
  const viewBoxHeight = showADSR ? 160 : 140
  const paddingLeft = viewBoxWidth * 0.12
  const paddingRight = viewBoxWidth * 0.04
  const paddingTop = viewBoxHeight * 0.18
  const paddingBottom = showADSR ? viewBoxHeight * 0.2 : viewBoxHeight * 0.12
  const graphWidth = viewBoxWidth - paddingLeft - paddingRight
  const graphHeight = viewBoxHeight - paddingTop - paddingBottom

  // Convert level (0-99) to Y position (0 at bottom, 99 at top)
  const levelToY = (level) => {
    return paddingTop + graphHeight - (level / 99) * graphHeight
  }

  // Calculate segment widths using normalized proportional scaling
  // This ensures the envelope fills the available width while maintaining
  // relative timing proportions between segments

  // Base width calculation: rate 50 = neutral (1.0), rate 0 = slow (3.0), rate 99 = fast (0.2)
  const rateToWidthFactor = (/** @type {number} */ rate) => {
    if (rate <= 0) return 3.0
    if (rate >= 99) return 0.2
    // Exponential: higher rate = smaller width
    return 3.0 * ((100 - rate) / 100) ** 0.7 + 0.2
  }

  // Calculate relative segment widths
  // Width = distance factor * rate factor, with minimum visibility
  const calculateSegmentWidth = (
    /** @type {number} */ fromLevel,
    /** @type {number} */ toLevel,
    /** @type {number} */ rate,
  ) => {
    const distance = Math.abs(toLevel - fromLevel)
    // Distance factor: 0-1 scale, minimum 0.3 ensures visibility even at same level
    const distanceFactor = Math.max(distance / 99, 0.3)
    const rateFactor = rateToWidthFactor(rate)
    return distanceFactor * rateFactor
  }

  // Calculate relative widths for each segment
  const attackWidth = calculateSegmentWidth(l4, l1, r1)
  const decay1Width = calculateSegmentWidth(l1, l2, r2)
  const decay2Width = calculateSegmentWidth(l2, l3, r3)
  const releaseWidth = calculateSegmentWidth(l3, l4, r4)

  // Total of active segment widths (excluding idle)
  const totalActiveWidth = attackWidth + decay1Width + decay2Width + releaseWidth

  // Available width for active segments (idle takes fixed portion)
  const idlePixelWidth = graphWidth * 0.08
  const activePixelWidth = graphWidth * 0.92

  // Calculate x positions
  const x1 = paddingLeft
  const x2 = x1 + idlePixelWidth
  const x3 = x2 + (attackWidth / totalActiveWidth) * activePixelWidth
  const x4 = x3 + (decay1Width / totalActiveWidth) * activePixelWidth
  const x5 = x4 + (decay2Width / totalActiveWidth) * activePixelWidth
  const x6 = x5 + (releaseWidth / totalActiveWidth) * activePixelWidth

  // Y positions for each point
  const y1 = levelToY(l4) // Point 1: L4 (idle start)
  const y2 = levelToY(l4) // Point 2: L4 (KEY ON)
  const y3 = levelToY(l1) // Point 3: L1 (after attack)
  const y4 = levelToY(l2) // Point 4: L2 (after decay 1)
  const y5 = levelToY(l3) // Point 5: L3 (sustain / KEY OFF)
  const y6 = levelToY(l4) // Point 6: L4 (after release)

  // Concert pitch Y (level 50) - for pitch mode
  const concertPitchY = levelToY(50)

  // Build path data
  const idlePath = `M ${x1} ${y1} L ${x2} ${y2}`
  const activePath = `M ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} L ${x5} ${y5}`
  const releasePath = `M ${x5} ${y5} L ${x6} ${y6}`

  // Individual fill paths for each ADSR phase
  const bottomY = paddingTop + graphHeight
  const attackFill = `M ${x2} ${y2} L ${x3} ${y3} L ${x3} ${bottomY} L ${x2} ${bottomY} Z`
  const decayFill = `M ${x3} ${y3} L ${x4} ${y4} L ${x4} ${bottomY} L ${x3} ${bottomY} Z`
  const sustainFill = `M ${x4} ${y4} L ${x5} ${y5} L ${x5} ${bottomY} L ${x4} ${bottomY} Z`
  const releaseFill = `M ${x5} ${y5} L ${x6} ${y6} L ${x6} ${bottomY} L ${x5} ${bottomY} Z`

  // Y-axis label
  const yAxisLabel = "LEVEL"

  // Calculate aspect ratio for CSS
  const aspectRatio = `${viewBoxWidth} / ${viewBoxHeight}`

  return (
    <div className="envelope-graph" style={{ aspectRatio }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        role="img"
        aria-label="Envelope graph"
      >
        <title>Envelope graph</title>

        {/* Grid lines */}
        <g className="grid-lines">
          {/* Horizontal grid lines every 25 units */}
          <line
            x1={paddingLeft}
            y1={levelToY(25)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(25)}
            className="grid-line"
          />
          <line
            x1={paddingLeft}
            y1={levelToY(50)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(50)}
            className="grid-line"
          />
          <line
            x1={paddingLeft}
            y1={levelToY(75)}
            x2={viewBoxWidth - paddingRight}
            y2={levelToY(75)}
            className="grid-line"
          />
          {/* Vertical grid at key points */}
          <line x1={x2} y1={paddingTop} x2={x2} y2={paddingTop + graphHeight} className="grid-line grid-line-key" />
          <line x1={x5} y1={paddingTop} x2={x5} y2={paddingTop + graphHeight} className="grid-line grid-line-key" />
        </g>

        {showADSR && (
          <>
            {/* ADSR phase boundary markers (dotted lines from envelope peaks to time axis) */}
            <g className="adsr-markers">
              {/* Attack peak (L1) to time axis */}
              <line x1={x3} y1={paddingTop} x2={x3} y2={paddingTop + graphHeight} className="adsr-marker" />
              {/* Decay end (L2) to time axis */}
              <line x1={x4} y1={paddingTop} x2={x4} y2={paddingTop + graphHeight} className="adsr-marker" />
            </g>

            {/* ADSR phase labels */}
            <g className="adsr-labels">
              <text
                x={(x2 + x3) / 2}
                y={paddingTop + graphHeight + 12}
                textAnchor="middle"
                className="adsr-label asdr-label-attack"
              >
                A
              </text>
              <text
                x={(x3 + x4) / 2}
                y={paddingTop + graphHeight + 12}
                textAnchor="middle"
                className="adsr-label asdr-label-decay"
              >
                D
              </text>
              <text
                x={(x4 + x5) / 2}
                y={paddingTop + graphHeight + 12}
                textAnchor="middle"
                className="adsr-label asdr-label-sustain"
              >
                S
              </text>
              <text
                x={(x5 + x6) / 2}
                y={paddingTop + graphHeight + 12}
                textAnchor="middle"
                className="adsr-label asdr-label-release"
              >
                R
              </text>
            </g>
          </>
        )}

        {/* Concert pitch reference line (pitch mode only) */}
        {type === "pitch" && (
          <line
            x1={paddingLeft}
            y1={concertPitchY}
            x2={viewBoxWidth - paddingRight}
            y2={concertPitchY}
            className="concert-pitch-line"
          />
        )}

        {/* Fill areas under envelope */}
        {showADSR ? (
          <>
            <path d={attackFill} className="envelope-fill envelope-fill-attack" />
            <path d={decayFill} className="envelope-fill envelope-fill-decay" />
            <path d={sustainFill} className="envelope-fill envelope-fill-sustain" />
            <path d={releaseFill} className="envelope-fill envelope-fill-release" />
          </>
        ) : (
          <path
            d={`${activePath} L ${x6} ${y6} L ${x6} ${paddingTop + graphHeight} L ${x2} ${paddingTop + graphHeight} Z`}
            className="envelope-fill"
          />
        )}

        {/* Idle segment (light gray/dashed) */}
        <path d={idlePath} className="envelope-path-idle" fill="none" />

        {/* Active segments (solid cyan) */}
        <path d={activePath} className="envelope-path" fill="none" />

        {/* Release segment (dashed) */}
        <path d={releasePath} className="envelope-path-release" fill="none" />

        {/* KEY ON marker */}
        <line x1={x2} y1={paddingTop} x2={x2} y2={paddingTop + graphHeight} className="key-marker key-on-marker" />
        <text x={x2 - 12} y={paddingTop - 16} textAnchor="middle" className="key-marker-label key-on-label">
          KEY ON
        </text>

        {/* KEY OFF marker */}
        <line x1={x5} y1={paddingTop} x2={x5} y2={paddingTop + graphHeight} className="key-marker key-off-marker" />
        <text x={x5 - 14} y={paddingTop - 16} textAnchor="middle" className="key-marker-label key-off-label">
          KEY OFF
        </text>

        {/* Level markers (6 points) */}
        <circle cx={x1} cy={y1} r="3" className="level-marker level-marker-l4" />
        <circle cx={x2} cy={y2} r="3" className="level-marker level-marker-trigger" />
        <circle cx={x3} cy={y3} r="3" className="level-marker level-marker-l1" />
        <circle cx={x4} cy={y4} r="3" className="level-marker level-marker-l2" />
        <circle cx={x5} cy={y5} r="3" className="level-marker level-marker-l3" />
        <circle cx={x6} cy={y6} r="3" className="level-marker level-marker-l4-end" />

        {/* Parameter labels */}
        {/* L4 labels */}
        <text x={x1} y={y1 + 12} textAnchor="middle" className="param-label level-label">
          L4
        </text>
        <text x={x6 - 8} y={y6 + 12} textAnchor="middle" className="param-label level-label">
          L4
        </text>

        {/* L1 label */}
        <text x={x3} y={y3 - 6} textAnchor="middle" className="param-label level-label">
          L1
        </text>

        {/* L2 label */}
        <text x={x4} y={y4 - 6} textAnchor="middle" className="param-label level-label">
          L2
        </text>

        {/* L3 label */}
        <text x={x5} y={y5 - 6} textAnchor="middle" className="param-label level-label">
          L3
        </text>

        {/* Rate labels positioned along segments */}
        <text x={(x2 + x3) / 2} y={(y2 + y3) / 2 - 6} textAnchor="middle" className="param-label rate-label">
          R1
        </text>
        <text x={(x3 + x4) / 2} y={(y3 + y4) / 2 - 6} textAnchor="middle" className="param-label rate-label">
          R2
        </text>
        <text x={(x4 + x5) / 2} y={(y4 + y5) / 2 - 6} textAnchor="middle" className="param-label rate-label">
          R3
        </text>
        <text x={(x5 + x6) / 2} y={(y5 + y6) / 2 - 6} textAnchor="middle" className="param-label rate-label">
          R4
        </text>

        {/* Y-axis label */}
        <text
          x={14}
          y={levelToY(50) + 12}
          textAnchor="middle"
          transform={`rotate(-90, 14, ${levelToY(50) + 12})`}
          className="axis-label y-axis-label"
        >
          {yAxisLabel}
        </text>

        {/* X-axis label */}
        <text
          x={paddingLeft + graphWidth / 2}
          y={paddingTop + graphHeight + (showADSR ? 26 : 16)}
          textAnchor="middle"
          className="axis-label x-axis-label"
        >
          TIME
        </text>

        {/* Y-axis tick labels - moved left to avoid overlap */}
        <text x={paddingLeft - 16} y={levelToY(0) + 3} textAnchor="end" className="tick-label">
          0
        </text>
        <text x={paddingLeft - 16} y={levelToY(50) + 3} textAnchor="end" className="tick-label">
          50
        </text>
        <text x={paddingLeft - 16} y={levelToY(99) + 3} textAnchor="end" className="tick-label">
          99
        </text>
      </svg>
    </div>
  )
}
