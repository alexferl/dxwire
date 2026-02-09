import { render, screen } from "@testing-library/preact"
import { describe, expect, it } from "vitest"
import { EnvelopeGraph } from "./index"

describe("EnvelopeGraph", () => {
  const defaultLevels = [99, 50, 30, 0]
  const defaultRates = [80, 40, 30, 50]

  it("renders with required props", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    expect(screen.getByRole("img")).toBeInTheDocument()
  })

  it("has correct aria-label", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    expect(screen.getByLabelText("Envelope graph")).toBeInTheDocument()
  })

  it("renders SVG with correct dimensions", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const svg = document.querySelector("svg")
    expect(svg).toHaveAttribute("width", "100%")
    expect(svg).toHaveAttribute("height", "100%")
  })

  it("renders envelope path", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const path = document.querySelector(".envelope-path")
    expect(path).toBeInTheDocument()
  })

  it("renders all 6 level markers", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const markers = document.querySelectorAll(".level-marker")
    expect(markers.length).toBe(6)
  })

  it("renders idle segment", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const idlePath = document.querySelector(".envelope-path-idle")
    expect(idlePath).toBeInTheDocument()
  })

  it("renders release segment", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const releasePath = document.querySelector(".envelope-path-release")
    expect(releasePath).toBeInTheDocument()
  })

  it("renders KEY ON marker", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const keyOnMarker = document.querySelector(".key-on-marker")
    const keyOnLabel = document.querySelector(".key-on-label")
    expect(keyOnMarker).toBeInTheDocument()
    expect(keyOnLabel).toBeInTheDocument()
  })

  it("renders KEY OFF marker", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const keyOffMarker = document.querySelector(".key-off-marker")
    const keyOffLabel = document.querySelector(".key-off-label")
    expect(keyOffMarker).toBeInTheDocument()
    expect(keyOffLabel).toBeInTheDocument()
  })

  it("renders parameter labels (L1-L4, R1-R4)", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const labels = document.querySelectorAll(".param-label")
    expect(labels.length).toBe(9) // L1, L2, L3, L4 (x2 for start/end), R1, R2, R3, R4
  })

  it("renders Y-axis label", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const yAxisLabel = document.querySelector(".y-axis-label")
    expect(yAxisLabel).toBeInTheDocument()
    expect(yAxisLabel).toHaveTextContent("LEVEL")
  })

  it("renders X-axis label", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const xAxisLabel = document.querySelector(".x-axis-label")
    expect(xAxisLabel).toBeInTheDocument()
    expect(xAxisLabel).toHaveTextContent("TIME")
  })

  it("does not render concert pitch line for amplitude type", () => {
    render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={defaultRates} />)
    const concertPitchLine = document.querySelector(".concert-pitch-line")
    expect(concertPitchLine).not.toBeInTheDocument()
  })

  it("renders concert pitch line for pitch type", () => {
    render(<EnvelopeGraph type="pitch" levels={[50, 50, 50, 50]} rates={defaultRates} />)
    const concertPitchLine = document.querySelector(".concert-pitch-line")
    expect(concertPitchLine).toBeInTheDocument()
  })

  describe("edge cases", () => {
    it("handles zero rates gracefully", () => {
      render(<EnvelopeGraph type="amplitude" levels={defaultLevels} rates={[0, 0, 0, 0]} />)
      const path = document.querySelector(".envelope-path")
      expect(path).toBeInTheDocument()
      expect(path).toHaveAttribute("d")
    })

    it("handles maximum values", () => {
      render(<EnvelopeGraph type="amplitude" levels={[99, 99, 99, 99]} rates={[99, 99, 99, 99]} />)
      const path = document.querySelector(".envelope-path")
      expect(path).toBeInTheDocument()
    })

    it("handles minimum values", () => {
      render(<EnvelopeGraph type="amplitude" levels={[0, 0, 0, 0]} rates={[0, 0, 0, 0]} />)
      const path = document.querySelector(".envelope-path")
      expect(path).toBeInTheDocument()
    })

    it("defaults to amplitude type when type is not specified", () => {
      render(<EnvelopeGraph levels={defaultLevels} rates={defaultRates} />)
      const svg = document.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })
  })
})
