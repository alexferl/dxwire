import { render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { useVoice, VoiceContext, voiceInstance } from "./VoiceContext.jsx"

// Mock createVoice to avoid localStorage and DX7Bank dependencies
vi.mock("../Voice.js", () => ({
  createVoice: vi.fn(() => ({
    operators: Array(6).fill({
      enabled: { value: true },
      mode: { value: 0 },
      coarse: { value: 1 },
      fine: { value: 0 },
      detune: { value: 7 },
      outputLevel: { value: 99 },
      egRate1: { value: 99 },
      egRate2: { value: 99 },
      egRate3: { value: 99 },
      egRate4: { value: 99 },
      egLevel1: { value: 99 },
      egLevel2: { value: 99 },
      egLevel3: { value: 99 },
      egLevel4: { value: 0 },
    }),
    pitchEG: {
      rate1: { value: 99 },
      rate2: { value: 99 },
      rate3: { value: 99 },
      rate4: { value: 99 },
      level1: { value: 50 },
      level2: { value: 50 },
      level3: { value: 50 },
      level4: { value: 50 },
    },
    lfo: {
      speed: { value: 35 },
      delay: { value: 0 },
      pmDepth: { value: 0 },
      amDepth: { value: 0 },
      keySync: { value: 1 },
      wave: { value: 0 },
      pmSens: { value: 3 },
    },
    global: {
      algorithm: { value: 1 },
      feedback: { value: 0 },
      oscSync: { value: 1 },
      transpose: { value: 24 },
      name: { value: "Test Voice" },
    },
    banks: { value: [{ name: "Test Bank" }] },
    currentBank: { value: 0 },
    currentVoiceIndex: { value: 0 },
  })),
}))

describe("VoiceContext", () => {
  it("exports voiceInstance", () => {
    expect(voiceInstance).toBeDefined()
    expect(voiceInstance).toHaveProperty("operators")
    expect(voiceInstance).toHaveProperty("pitchEG")
    expect(voiceInstance).toHaveProperty("lfo")
    expect(voiceInstance).toHaveProperty("global")
  })

  it("provides voice context to children", () => {
    function TestComponent() {
      const voice = useVoice()
      return <div data-testid="voice-name">{voice.global.name.value}</div>
    }

    render(
      <VoiceContext.Provider value={voiceInstance}>
        <TestComponent />
      </VoiceContext.Provider>,
    )

    expect(screen.getByTestId("voice-name")).toHaveTextContent("Test Voice")
  })

  it("throws error when useVoice is used outside provider", () => {
    function TestComponent() {
      try {
        useVoice()
        return <div>No error</div>
      } catch (err) {
        return <div data-testid="error">{err.message}</div>
      }
    }

    render(<TestComponent />)
    expect(screen.getByTestId("error")).toHaveTextContent("useVoice must be used within an Editor component")
  })

  it("has 6 operators", () => {
    expect(voiceInstance.operators).toHaveLength(6)
  })

  it("operators have required properties", () => {
    const op = voiceInstance.operators[0]
    expect(op).toHaveProperty("enabled")
    expect(op).toHaveProperty("mode")
    expect(op).toHaveProperty("coarse")
    expect(op).toHaveProperty("fine")
    expect(op).toHaveProperty("detune")
    expect(op).toHaveProperty("outputLevel")
    expect(op).toHaveProperty("egRate1")
    expect(op).toHaveProperty("egLevel1")
  })

  it("pitchEG has rate and level properties", () => {
    expect(voiceInstance.pitchEG).toHaveProperty("rate1")
    expect(voiceInstance.pitchEG).toHaveProperty("rate2")
    expect(voiceInstance.pitchEG).toHaveProperty("rate3")
    expect(voiceInstance.pitchEG).toHaveProperty("rate4")
    expect(voiceInstance.pitchEG).toHaveProperty("level1")
    expect(voiceInstance.pitchEG).toHaveProperty("level2")
    expect(voiceInstance.pitchEG).toHaveProperty("level3")
    expect(voiceInstance.pitchEG).toHaveProperty("level4")
  })

  it("lfo has required properties", () => {
    expect(voiceInstance.lfo).toHaveProperty("speed")
    expect(voiceInstance.lfo).toHaveProperty("delay")
    expect(voiceInstance.lfo).toHaveProperty("pmDepth")
    expect(voiceInstance.lfo).toHaveProperty("amDepth")
    expect(voiceInstance.lfo).toHaveProperty("keySync")
    expect(voiceInstance.lfo).toHaveProperty("wave")
    expect(voiceInstance.lfo).toHaveProperty("pmSens")
  })

  it("global has required properties", () => {
    expect(voiceInstance.global).toHaveProperty("algorithm")
    expect(voiceInstance.global).toHaveProperty("feedback")
    expect(voiceInstance.global).toHaveProperty("oscSync")
    expect(voiceInstance.global).toHaveProperty("transpose")
    expect(voiceInstance.global).toHaveProperty("name")
  })
})
