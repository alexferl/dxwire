import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing Sidebar
vi.mock("../VoiceContext.jsx", () => ({
  useVoice: vi.fn(),
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
    render(() => <Sidebar />)

    expect(document.querySelector(".left-column")).toBeInTheDocument()
  })

  it("renders Algorithm component", () => {
    render(() => <Sidebar />)

    expect(screen.getByTestId("algorithm")).toBeInTheDocument()
  })

  it("renders General component", () => {
    render(() => <Sidebar />)

    expect(screen.getByTestId("general")).toBeInTheDocument()
  })

  it("renders WaveformDisplay component", () => {
    render(() => <Sidebar />)

    expect(screen.getByTestId("waveform-display")).toBeInTheDocument()
  })

  it("renders PitchEG component", () => {
    render(() => <Sidebar />)

    expect(screen.getByTestId("pitch-eg")).toBeInTheDocument()
  })

  it("renders LFO component", () => {
    render(() => <Sidebar />)

    expect(screen.getByTestId("lfo")).toBeInTheDocument()
  })

  it("renders all components in correct order", () => {
    render(() => <Sidebar />)

    const container = document.querySelector(".left-column")
    const children = container.children

    expect(children[0]).toHaveAttribute("data-testid", "algorithm")
    expect(children[1]).toHaveAttribute("data-testid", "general")
    expect(children[2]).toHaveAttribute("data-testid", "waveform-display")
    expect(children[3]).toHaveAttribute("data-testid", "pitch-eg")
    expect(children[4]).toHaveAttribute("data-testid", "lfo")
  })
})
