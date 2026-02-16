import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { Algorithm } from "./Algorithm"

function createSignalMock(initialValue) {
  let value = initialValue
  const getter = () => value
  const setter = (newValue) => {
    value = newValue
  }
  return [getter, setter]
}

function createMockVoice(algorithmValue = 5, enabledStates = [true, true, true, true, true, true]) {
  return {
    global: {
      algorithm: createSignalMock(algorithmValue),
    },
    operators: enabledStates.map((enabled) => ({
      enabled: createSignalMock(enabled),
    })),
  }
}

describe("Algorithm", () => {
  it("renders operator numbers for algorithm 1", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    // Check operator numbers are in grid cells
    const gridItems = document.querySelectorAll(".algorithm-grid-item")
    expect(gridItems.length).toBe(6)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThanOrEqual(1)
    }
  })

  it("renders operator numbers for algorithm 32", () => {
    const mockVoice = createMockVoice(32)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument()
    }
  })

  it("applies carrier class to carrier operators", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const carriers = document.querySelectorAll(".carrier")
    expect(carriers.length).toBeGreaterThan(0)
  })

  it("applies modulator class to modulator operators", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const modulators = document.querySelectorAll(".modulator")
    expect(modulators.length).toBeGreaterThan(0)
  })

  it("applies disabled class to disabled operators", () => {
    const mockVoice = createMockVoice(1, [false, true, true, true, true, true])
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const disabled = document.querySelectorAll(".disabled")
    expect(disabled.length).toBe(1)
  })

  it("renders SVG connections overlay", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    expect(document.querySelector(".connections-overlay")).toBeInTheDocument()
  })

  it("renders connection paths in SVG", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const paths = document.querySelectorAll(".connections-overlay path")
    expect(paths.length).toBeGreaterThan(0)
  })

  it("renders grid container", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    expect(document.querySelector(".algo-container")).toBeInTheDocument()
    expect(document.querySelector(".algorithm-grid")).toBeInTheDocument()
  })

  it("has correct aria-label on SVG", () => {
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const svg = document.querySelector(".connections-overlay")
    expect(svg).toHaveAttribute("aria-label", "Algorithm connections")
  })

  it("renders algorithm number", () => {
    const mockVoice = createMockVoice(17)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const algoNumber = document.querySelector(".algo-number")
    expect(algoNumber).toBeInTheDocument()
    expect(algoNumber).toHaveTextContent("17")
  })

  it("renders different layouts for different algorithms", () => {
    const mockVoice1 = createMockVoice(1)
    const { container: container1 } = render(() => (
      <VoiceContext.Provider value={mockVoice1}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const mockVoice32 = createMockVoice(32)
    const { container: container2 } = render(() => (
      <VoiceContext.Provider value={mockVoice32}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    // Algorithm 1 and 32 have different layouts, so grid positions should differ
    const gridItems1 = container1.querySelectorAll(".algorithm-grid-item")
    const gridItems2 = container2.querySelectorAll(".algorithm-grid-item")

    // Both should have 6 operators
    expect(gridItems1.length).toBe(6)
    expect(gridItems2.length).toBe(6)

    // But they should have different positions (styles)
    const style1 = gridItems1[0].getAttribute("style")
    const style2 = gridItems2[0].getAttribute("style")
    expect(style1).not.toBe(style2)
  })

  it("renders feedback loops for algorithms with feedback", () => {
    // Algorithm 1 has op 6 with feedback
    const mockVoice = createMockVoice(1)
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>
    ))

    const paths = document.querySelectorAll(".connections-overlay path")
    // Should have connection paths + feedback paths
    expect(paths.length).toBeGreaterThan(1)
  })
})
