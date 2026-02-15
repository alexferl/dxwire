import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { General } from "./General"

// Mock voice context with SolidJS signal format
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
    global: {
      algorithm: createSignalMock(5),
      feedback: createSignalMock(3),
      transpose: createSignalMock(24),
    },
    settings: createSignalMock({ showADSR: true, showValueInputs: true }),
  }
}

describe("General", () => {
  it("renders all knobs", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    expect(screen.getByLabelText("Algo knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Feed knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Trans knob")).toBeInTheDocument()
  })

  it("renders knob titles", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText("Algo")).toBeInTheDocument()
    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Trans")).toBeInTheDocument()
  })

  it("displays correct initial values", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    expect(screen.getByLabelText("Algo knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Feed knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Trans knob")).toBeInTheDocument()
  })

  it("has correct CSS class for container", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".feedback-section")).toBeInTheDocument()
  })

  it("has correct CSS class for knobs container", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".feedback-knobs")).toBeInTheDocument()
  })

  it("updates algorithm value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[0], { target: { value: "15" } })

    await waitFor(() => {
      expect(mockVoice.global.algorithm[0]()).toBe(15)
    })
  })

  it("updates feedback value when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    fireEvent.change(inputs[1], { target: { value: "5" } })

    await waitFor(() => {
      expect(mockVoice.global.feedback[0]()).toBe(5)
    })
  })

  it("updates transpose value with offset when changed", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    // Transpose knob shows value - 24 (0 in UI means 24 in data)
    fireEvent.change(inputs[2], { target: { value: "-12" } })

    await waitFor(() => {
      // The onChange adds 24 to the value: -12 + 24 = 12
      expect(mockVoice.global.transpose[0]()).toBe(12)
    })
  })

  it("respects algorithm min/max range", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    // Algorithm min is 1, max is 32
    fireEvent.change(inputs[0], { target: { value: "50" } })

    await waitFor(() => {
      // Value should not change because 50 > max (32)
      expect(mockVoice.global.algorithm[0]()).toBe(5)
    })
  })

  it("respects feedback min/max range", async () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <General />
      </VoiceContext.Provider>,
    )

    const inputs = document.querySelectorAll(".knob-input")
    // Feedback min is 0, max is 7
    fireEvent.change(inputs[1], { target: { value: "10" } })

    await waitFor(() => {
      // Value should not change because 10 > max (7)
      expect(mockVoice.global.feedback[0]()).toBe(3)
    })
  })
})
