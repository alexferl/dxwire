import { render, screen } from "@testing-library/preact"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { WaveformDisplay } from "./WaveformDisplay"

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

describe("WaveformDisplay", () => {
  it("renders envelope graph", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <WaveformDisplay />
      </VoiceContext.Provider>,
    )

    expect(screen.getByRole("img")).toBeInTheDocument()
  })

  it("has correct CSS class", () => {
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <WaveformDisplay />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".waveform-display")).toBeInTheDocument()
  })
})
