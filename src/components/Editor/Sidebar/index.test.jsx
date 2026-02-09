import { render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing Sidebar
vi.mock("../VoiceContext.jsx", () => ({
  useVoice: () => ({
    global: { algorithm: { value: 1 }, transpose: { value: 24 } },
    pitchEG: {
      level1: { value: 50 },
      level2: { value: 50 },
      level3: { value: 50 },
      level4: { value: 50 },
      rate1: { value: 99 },
      rate2: { value: 99 },
      rate3: { value: 99 },
      rate4: { value: 99 },
    },
    lfo: {
      wave: { value: 0 },
      speed: { value: 35 },
      delay: { value: 0 },
      pmDepth: { value: 0 },
      amDepth: { value: 0 },
      pmSens: { value: 3 },
      keySync: { value: 1 },
    },
    banks: { value: [] },
    currentBank: { value: 0 },
  }),
}))

// Mock child components
vi.mock("./Algorithm.jsx", () => ({
  Algorithm: () => <div data-testid="algorithm">Algorithm</div>,
}))

vi.mock("./General.jsx", () => ({
  General: () => <div data-testid="general">General</div>,
}))

vi.mock("./WaveformDisplay.jsx", () => ({
  WaveformDisplay: () => <div data-testid="waveform-display">WaveformDisplay</div>,
}))

vi.mock("./PitchEG.jsx", () => ({
  PitchEG: () => <div data-testid="pitch-eg">PitchEG</div>,
}))

vi.mock("./LFO.jsx", () => ({
  LFO: () => <div data-testid="lfo">LFO</div>,
}))

import { Sidebar } from "./index"

describe("Sidebar", () => {
  it("renders the sidebar container", () => {
    render(<Sidebar />)

    expect(document.querySelector(".left-column")).toBeInTheDocument()
  })

  it("renders Algorithm component", () => {
    render(<Sidebar />)

    expect(screen.getByTestId("algorithm")).toBeInTheDocument()
  })

  it("renders General component", () => {
    render(<Sidebar />)

    expect(screen.getByTestId("general")).toBeInTheDocument()
  })

  it("renders WaveformDisplay component", () => {
    render(<Sidebar />)

    expect(screen.getByTestId("waveform-display")).toBeInTheDocument()
  })

  it("renders PitchEG component", () => {
    render(<Sidebar />)

    expect(screen.getByTestId("pitch-eg")).toBeInTheDocument()
  })

  it("renders LFO component", () => {
    render(<Sidebar />)

    expect(screen.getByTestId("lfo")).toBeInTheDocument()
  })

  it("renders all components in correct order", () => {
    render(<Sidebar />)

    const container = document.querySelector(".left-column")
    const children = container.children

    expect(children[0]).toHaveAttribute("data-testid", "algorithm")
    expect(children[1]).toHaveAttribute("data-testid", "general")
    expect(children[2]).toHaveAttribute("data-testid", "waveform-display")
    expect(children[3]).toHaveAttribute("data-testid", "pitch-eg")
    expect(children[4]).toHaveAttribute("data-testid", "lfo")
  })
})
