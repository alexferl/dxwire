import { fireEvent, render, screen, waitFor } from "@testing-library/preact"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { PitchEG } from "./PitchEG"

// Mock voice context
function createMockVoice() {
  return {
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
  }
}

describe("PitchEG", () => {
  it("renders all level knobs", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    expect(screen.getByLabelText("L1 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("L2 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("L3 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("L4 knob")).toBeInTheDocument()
  })

  it("renders all rate knobs", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    expect(screen.getByLabelText("R1 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R2 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R3 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R4 knob")).toBeInTheDocument()
  })

  it("displays correct initial values", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    expect(screen.getByLabelText("L1 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R1 knob")).toBeInTheDocument()
  })

  it("has correct CSS classes for sections", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".pitch-eg-section")).toBeInTheDocument()
    expect(document.querySelector(".pitch-eg-knobs-level")).toBeInTheDocument()
    expect(document.querySelector(".pitch-eg-knobs-rate")).toBeInTheDocument()
  })

  it("updates level1 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[0], { target: { value: "75" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.level1.value).toBe(75)
    })
  })

  it("updates level2 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[1], { target: { value: "60" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.level2.value).toBe(60)
    })
  })

  it("updates level3 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[2], { target: { value: "45" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.level3.value).toBe(45)
    })
  })

  it("updates level4 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[3], { target: { value: "30" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.level4.value).toBe(30)
    })
  })

  it("updates rate1 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[4], { target: { value: "80" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.rate1.value).toBe(80)
    })
  })

  it("updates rate2 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[5], { target: { value: "70" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.rate2.value).toBe(70)
    })
  })

  it("updates rate3 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[6], { target: { value: "60" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.rate3.value).toBe(60)
    })
  })

  it("updates rate4 value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <PitchEG />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[7], { target: { value: "50" } })

    await waitFor(() => {
      expect(mockVoice.pitchEG.rate4.value).toBe(50)
    })
  })
})
