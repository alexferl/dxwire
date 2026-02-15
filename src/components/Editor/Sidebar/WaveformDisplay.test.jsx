import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { WaveformDisplay } from "./WaveformDisplay"

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
    settings: createSignalMock({ showADSR: true }),
  }
}

describe("WaveformDisplay", () => {
  it("renders envelope graph", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <WaveformDisplay />
      </VoiceContext.Provider>
    ))

    expect(screen.getByRole("img")).toBeInTheDocument()
  })

  it("has correct CSS class", () => {
    const mockVoice = createMockVoice()
    render(() => (
      <VoiceContext.Provider value={mockVoice}>
        <WaveformDisplay />
      </VoiceContext.Provider>
    ))

    expect(document.querySelector(".waveform-display")).toBeInTheDocument()
  })
})
