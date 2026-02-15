import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { PitchEG } from "./PitchEG"

// Mock voice context with SolidJS signal format [getter, setter]
function createSignalMock(initialValue) {
  let value = initialValue
  const getter = () => value
  const setter = (newValue) => {
    value = newValue
  }
  return [getter, setter]
}

function createMockVoice() {
  return {
    pitchEG: {
      level1: createSignalMock(50),
      level2: createSignalMock(50),
      level3: createSignalMock(50),
      level4: createSignalMock(50),
      rate1: createSignalMock(99),
      rate2: createSignalMock(99),
      rate3: createSignalMock(99),
      rate4: createSignalMock(99),
    },
    settings: createSignalMock({ showADSR: true, showValueInputs: true }),
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
      expect(mockVoice.pitchEG.level1[0]()).toBe(75)
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
      expect(mockVoice.pitchEG.level2[0]()).toBe(60)
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
      expect(mockVoice.pitchEG.level3[0]()).toBe(45)
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
      expect(mockVoice.pitchEG.level4[0]()).toBe(30)
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
      expect(mockVoice.pitchEG.rate1[0]()).toBe(80)
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
      expect(mockVoice.pitchEG.rate2[0]()).toBe(70)
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
      expect(mockVoice.pitchEG.rate3[0]()).toBe(60)
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
      expect(mockVoice.pitchEG.rate4[0]()).toBe(50)
    })
  })
})
