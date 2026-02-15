import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"
import { useVoice, VoiceContext, voiceInstance } from "./VoiceContext.jsx"

// Mock createVoice to avoid localStorage and DX7Bank dependencies
// Note: vi.mock is hoisted, so createSignalMock must be defined inside the factory
vi.mock("../Voice.js", () => {
  // Helper to create SolidJS signal mocks - defined inside factory to avoid hoisting issues
  const createSignalMock = (initialValue) => {
    let value = initialValue
    const getter = () => value
    const setter = (newValue) => {
      value = newValue
    }
    return [getter, setter]
  }

  return {
    createVoice: vi.fn(() => ({
      operators: Array(6).fill({
        enabled: createSignalMock(true),
        mode: createSignalMock(0),
        coarse: createSignalMock(1),
        fine: createSignalMock(0),
        detune: createSignalMock(7),
        outputLevel: createSignalMock(99),
        egRate1: createSignalMock(99),
        egRate2: createSignalMock(99),
        egRate3: createSignalMock(99),
        egRate4: createSignalMock(99),
        egLevel1: createSignalMock(99),
        egLevel2: createSignalMock(99),
        egLevel3: createSignalMock(99),
        egLevel4: createSignalMock(0),
      }),
      pitchEG: {
        rate1: createSignalMock(99),
        rate2: createSignalMock(99),
        rate3: createSignalMock(99),
        rate4: createSignalMock(99),
        level1: createSignalMock(50),
        level2: createSignalMock(50),
        level3: createSignalMock(50),
        level4: createSignalMock(50),
      },
      lfo: {
        speed: createSignalMock(35),
        delay: createSignalMock(0),
        pmDepth: createSignalMock(0),
        amDepth: createSignalMock(0),
        keySync: createSignalMock(1),
        wave: createSignalMock(0),
        pmSens: createSignalMock(3),
      },
      global: {
        algorithm: createSignalMock(1),
        feedback: createSignalMock(0),
        oscSync: createSignalMock(1),
        transpose: createSignalMock(24),
        name: createSignalMock("Test Voice"),
      },
      banks: createSignalMock([{ name: "Test Bank" }]),
      currentBank: createSignalMock(0),
      currentVoiceIndex: createSignalMock(0),
    })),
  }
})

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
      return <div data-testid="voice-name">{voice.global.name[0]()}</div>
    }

    render(() => (
      <VoiceContext.Provider value={voiceInstance}>
        <TestComponent />
      </VoiceContext.Provider>
    ))

    expect(screen.getByTestId("voice-name")).toHaveTextContent("Test Voice")
  })

  it("throws error when useVoice is used outside provider", () => {
    // Test that useVoice throws when called outside provider
    // We call it directly outside of component render to avoid SolidJS rendering issues
    let thrownError = null
    try {
      useVoice()
    } catch (err) {
      thrownError = err
    }

    expect(thrownError).not.toBeNull()
    expect(thrownError.message).toBe("useVoice must be used within an Editor component")
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
