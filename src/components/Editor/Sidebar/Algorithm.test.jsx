import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { Algorithm } from "./Algorithm"

// Mock voice context with SolidJS signal format
function createSignalMock(initialValue) {
  let value = initialValue
  const getter = () => value
  const setter = (newValue) => {
    value = newValue
  }
  return [getter, setter]
}

function createMockVoice(algorithmValue = 5) {
  return {
    global: {
      algorithm: createSignalMock(algorithmValue),
    },
  }
}

describe("Algorithm", () => {
  it("renders algorithm number", () => {
    const mockVoice = createMockVoice(12)
    render(
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>,
    )
    expect(screen.getByText("12")).toBeInTheDocument()
  })

  it("renders ALGORITHM label", () => {
    const mockVoice = createMockVoice(1)
    render(
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>,
    )
    expect(screen.getByText("ALGORITHM")).toBeInTheDocument()
  })

  it("has correct CSS class for container", () => {
    const mockVoice = createMockVoice(1)
    render(
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>,
    )
    expect(document.querySelector(".algo-section")).toBeInTheDocument()
  })

  it("has correct CSS class for number", () => {
    const mockVoice = createMockVoice(32)
    render(
      <VoiceContext.Provider value={mockVoice}>
        <Algorithm />
      </VoiceContext.Provider>,
    )
    expect(document.querySelector(".algo-number")).toHaveTextContent("32")
  })
})
