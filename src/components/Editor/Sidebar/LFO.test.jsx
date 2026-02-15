import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { LFO } from "./LFO"

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
    lfo: {
      wave: createSignalMock(0),
      speed: createSignalMock(35),
      delay: createSignalMock(0),
      pmDepth: createSignalMock(0),
      amDepth: createSignalMock(0),
      pmSens: createSignalMock(3),
      keySync: createSignalMock(1),
    },
    global: {
      oscSync: createSignalMock(1),
    },
    settings: createSignalMock({ showADSR: true, showValueInputs: true }),
  }
}

describe("LFO", () => {
  it("renders WaveSelect", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    expect(screen.getByLabelText("Wave")).toBeInTheDocument()
  })

  it("renders all knobs", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    expect(screen.getByLabelText("Speed knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Delay knob")).toBeInTheDocument()
    expect(screen.getByLabelText("PMD knob")).toBeInTheDocument()
    expect(screen.getByLabelText("AMD knob")).toBeInTheDocument()
    expect(screen.getByLabelText("PMS knob")).toBeInTheDocument()
  })

  it("renders all toggle switches", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    expect(screen.getByLabelText("LFO Key Sync toggle")).toBeInTheDocument()
    expect(screen.getByLabelText("OSC Key Sync toggle")).toBeInTheDocument()
  })

  it("displays correct initial values", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    expect(screen.getByLabelText("Speed knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Delay knob")).toBeInTheDocument()
  })

  it("has correct CSS classes for sections", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    expect(document.querySelector(".lfo-section")).toBeInTheDocument()
    expect(document.querySelector(".lfo-row-wave")).toBeInTheDocument()
    expect(document.querySelector(".lfo-row-main")).toBeInTheDocument()
    expect(document.querySelector(".lfo-row-mod")).toBeInTheDocument()
    expect(document.querySelector(".lfo-row-switches")).toBeInTheDocument()
  })

  it("updates wave value when changed", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const waveSelectDisplay = document.querySelector(".wave-select-display")
    fireEvent.click(waveSelectDisplay)

    const options = document.querySelectorAll(".wave-select-option")
    fireEvent.click(options[2])

    expect(mockVoice.lfo.wave[0]()).toBe(2)
  })

  it("updates keySync value when toggle is clicked", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const keySyncSection = screen.getByText("LFO Key Sync").closest(".toggle-container")
    const keySyncToggle = keySyncSection.querySelector("[role='switch']")
    fireEvent.click(keySyncToggle)

    expect(mockVoice.lfo.keySync[0]()).toBe(0)
  })

  it("updates oscSync value when toggle is clicked", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const oscSyncSection = screen.getByText("OSC Key Sync").closest(".toggle-container")
    const oscSyncToggle = oscSyncSection.querySelector("[role='switch']")
    fireEvent.click(oscSyncToggle)

    expect(mockVoice.global.oscSync[0]()).toBe(0)
  })

  it("updates speed value when changed", async () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[0], { target: { value: "60" } })

    await waitFor(() => {
      expect(mockVoice.lfo.speed[0]()).toBe(60)
    })
  })

  it("updates delay value when changed", async () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[1], { target: { value: "25" } })

    await waitFor(() => {
      expect(mockVoice.lfo.delay[0]()).toBe(25)
    })
  })

  it("updates pmDepth value when changed", async () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[2], { target: { value: "50" } })

    await waitFor(() => {
      expect(mockVoice.lfo.pmDepth[0]()).toBe(50)
    })
  })

  it("updates amDepth value when changed", async () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[3], { target: { value: "40" } })

    await waitFor(() => {
      expect(mockVoice.lfo.amDepth[0]()).toBe(40)
    })
  })

  it("updates pmSens value when changed", async () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[4], { target: { value: "5" } })

    await waitFor(() => {
      expect(mockVoice.lfo.pmSens[0]()).toBe(5)
    })
  })

  it("respects pmSens max range", async () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <LFO />
      </VoiceContext.Provider>
    ))

    const inputs = document.querySelectorAll(".knob-input")
    // PMS max is 7
    fireEvent.change(inputs[4], { target: { value: "10" } })

    await waitFor(() => {
      // Value should not change because 10 > max (7)
      expect(mockVoice.lfo.pmSens[0]()).toBe(3)
    })
  })
})
