import { beforeEach, describe, expect, it, vi } from "vitest"
import { createVoice } from "./Voice"

// Mock midiwire
vi.mock("midiwire", () => {
  class DX7Bank {
    /** @type {string} */
    name

    constructor() {
      this.name = ""
      this.voices = Array(32)
        .fill(null)
        .map((_, i) => ({
          name: `Init Voice ${i + 1}`,
          toJSON: () => ({ name: `Init Voice ${i + 1}` }),
        }))
    }
    static fromJSON(data) {
      const bank = new DX7Bank()
      bank.name = data.name
      return bank
    }
    getVoice(index) {
      return this.voices[index]
    }
    getVoiceNames() {
      return this.voices.map((v) => v.name)
    }
    replaceVoice(index, voice) {
      this.voices[index] = voice
    }
    toJSON() {
      return { name: this.name, voices: this.voices }
    }
    toSysEx() {
      return new Uint8Array([0xf0, 0x43, 0x00, 0x09, 0xf7])
    }
  }

  class DX7Voice {
    constructor() {
      this.name = "Init Voice"
    }
    static fromJSON(json) {
      const voice = new DX7Voice()
      voice.name = json.name || "Init Voice"
      return voice
    }
    static createDefault(_index) {
      return new DX7Voice()
    }
    toJSON() {
      return {
        name: this.name,
        global: {
          algorithm: 1,
          feedback: 0,
          oscKeySync: true,
          pitchModSens: 3,
          transpose: 0,
          ampModSens: 0,
          egBiasSens: 0,
        },
        lfo: {
          speed: 35,
          delay: 0,
          pmDepth: 0,
          amDepth: 0,
          keySync: true,
          wave: "TRIANGLE",
        },
        pitchEG: {
          rates: [99, 99, 99, 99],
          levels: [50, 50, 50, 50],
        },
        operators: Array(6)
          .fill(null)
          .map((_, i) => ({
            id: i + 1,
            osc: {
              detune: 0,
              freq: { coarse: 1, fine: 0, mode: "RATIO" },
            },
            eg: { rates: [99, 99, 99, 99], levels: [99, 99, 99, 0] },
            key: { velocity: 0, scaling: 0, breakPoint: "A-1" },
            output: { level: 99, ampModSens: 0 },
            scale: {
              left: { depth: 0, curve: "-LN" },
              right: { depth: 0, curve: "-LN" },
            },
          })),
      }
    }
    toSysEx() {
      return new Uint8Array([0xf0, 0x43, 0x00, 0x00, 0x01, 0x1b, 0xf7])
    }
  }

  return {
    DX7Bank,
    DX7Voice,
    noteNameToNumber: (name) => {
      const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
      const match = name.match(/^([A-G][#-]?)(-?\d+)$/)
      if (!match) return 0
      const note = match[1]
      const octave = parseInt(match[2], 10)
      const noteIndex = notes.indexOf(note)
      return (octave + 2) * 12 + noteIndex
    },
    noteNumberToName: (num) => {
      const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
      const noteIndex = num % 12
      const octave = Math.floor(num / 12) - 2
      return `${notes[noteIndex]}${octave}`
    },
  }
})

// Mock storage
vi.mock("./storage.js", () => ({
  loadBanks: vi.fn(() => null),
  saveBanks: vi.fn(),
}))

describe("createVoice", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a voice with 6 operators", () => {
    const voice = createVoice()
    expect(voice.operators).toHaveLength(6)
  })

  it("each operator has required properties", () => {
    const voice = createVoice()
    const op = voice.operators[0]

    expect(op).toHaveProperty("egRate1")
    expect(op).toHaveProperty("egRate2")
    expect(op).toHaveProperty("egRate3")
    expect(op).toHaveProperty("egRate4")
    expect(op).toHaveProperty("egLevel1")
    expect(op).toHaveProperty("egLevel2")
    expect(op).toHaveProperty("egLevel3")
    expect(op).toHaveProperty("egLevel4")
    expect(op).toHaveProperty("breakPoint")
    expect(op).toHaveProperty("leftDepth")
    expect(op).toHaveProperty("rightDepth")
    expect(op).toHaveProperty("leftCurve")
    expect(op).toHaveProperty("rightCurve")
    expect(op).toHaveProperty("rateScaling")
    expect(op).toHaveProperty("ampModSens")
    expect(op).toHaveProperty("keyVelocity")
    expect(op).toHaveProperty("outputLevel")
    expect(op).toHaveProperty("mode")
    expect(op).toHaveProperty("coarse")
    expect(op).toHaveProperty("fine")
    expect(op).toHaveProperty("detune")
    expect(op).toHaveProperty("enabled")
  })

  it("operator signals have initial values", () => {
    const voice = createVoice()
    const op = voice.operators[0]

    expect(op.egRate1.value).toBe(99)
    expect(op.egLevel1.value).toBe(99)
    expect(op.enabled.value).toBe(true)
    expect(op.mode.value).toBe(0)
    expect(op.coarse.value).toBe(1)
  })

  it("creates pitchEG with required properties", () => {
    const voice = createVoice()

    expect(voice.pitchEG).toHaveProperty("rate1")
    expect(voice.pitchEG).toHaveProperty("rate2")
    expect(voice.pitchEG).toHaveProperty("rate3")
    expect(voice.pitchEG).toHaveProperty("rate4")
    expect(voice.pitchEG).toHaveProperty("level1")
    expect(voice.pitchEG).toHaveProperty("level2")
    expect(voice.pitchEG).toHaveProperty("level3")
    expect(voice.pitchEG).toHaveProperty("level4")
  })

  it("pitchEG has initial values", () => {
    const voice = createVoice()

    expect(voice.pitchEG.rate1.value).toBe(99)
    expect(voice.pitchEG.level1.value).toBe(50)
  })

  it("creates lfo with required properties", () => {
    const voice = createVoice()

    expect(voice.lfo).toHaveProperty("speed")
    expect(voice.lfo).toHaveProperty("delay")
    expect(voice.lfo).toHaveProperty("pmDepth")
    expect(voice.lfo).toHaveProperty("amDepth")
    expect(voice.lfo).toHaveProperty("keySync")
    expect(voice.lfo).toHaveProperty("wave")
    expect(voice.lfo).toHaveProperty("pmSens")
  })

  it("lfo has initial values", () => {
    const voice = createVoice()

    expect(voice.lfo.speed.value).toBe(35)
    expect(voice.lfo.delay.value).toBe(0)
    expect(voice.lfo.wave.value).toBe(0)
    expect(voice.lfo.keySync.value).toBe(1)
  })

  it("creates global with required properties", () => {
    const voice = createVoice()

    expect(voice.global).toHaveProperty("algorithm")
    expect(voice.global).toHaveProperty("feedback")
    expect(voice.global).toHaveProperty("oscSync")
    expect(voice.global).toHaveProperty("transpose")
    expect(voice.global).toHaveProperty("ampModSens")
    expect(voice.global).toHaveProperty("egBiasSens")
    expect(voice.global).toHaveProperty("name")
  })

  it("global has initial values", () => {
    const voice = createVoice()

    expect(voice.global.algorithm.value).toBe(1)
    expect(voice.global.feedback.value).toBe(0)
    expect(voice.global.oscSync.value).toBe(1)
    expect(voice.global.transpose.value).toBe(24)
    expect(voice.global.name.value).toBe("Init Voice")
  })

  it("creates banks signal", () => {
    const voice = createVoice()

    expect(voice.banks.value).toBeInstanceOf(Array)
    expect(voice.banks.value.length).toBeGreaterThan(0)
  })

  it("creates currentBank signal", () => {
    const voice = createVoice()

    expect(voice.currentBank.value).toBe(0)
  })

  it("creates currentVoiceIndex signal", () => {
    const voice = createVoice()

    expect(voice.currentVoiceIndex.value).toBe(0)
  })

  describe("toJSON", () => {
    it("exports voice to JSON format", () => {
      const voice = createVoice()
      const json = voice.toJSON()

      expect(json).toHaveProperty("name")
      expect(json).toHaveProperty("operators")
      expect(json).toHaveProperty("pitchEG")
      expect(json).toHaveProperty("lfo")
      expect(json).toHaveProperty("global")
    })

    it("exports 6 operators", () => {
      const voice = createVoice()
      const json = voice.toJSON()

      expect(json.operators).toHaveLength(6)
    })

    it("exports operator with correct structure", () => {
      const voice = createVoice()
      const json = voice.toJSON()
      const op = json.operators[0]

      expect(op).toHaveProperty("id")
      expect(op).toHaveProperty("osc")
      expect(op).toHaveProperty("eg")
      expect(op).toHaveProperty("key")
      expect(op).toHaveProperty("output")
      expect(op).toHaveProperty("scale")
    })
  })

  describe("toSysEx", () => {
    it("exports voice to SysEx format", () => {
      const voice = createVoice()
      const sysex = voice.toSysEx()

      expect(sysex).toBeInstanceOf(Uint8Array)
    })
  })

  describe("downloadSyx", () => {
    it("triggers download with default filename", () => {
      const voice = createVoice()

      const mockAnchor = {
        click: vi.fn(),
      }
      // @ts-expect-error - mock type
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockAnchor)
      // @ts-expect-error - mock type
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => null)
      // @ts-expect-error - mock type
      const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => null)

      // @ts-expect-error - global URL
      global.URL.createObjectURL = vi.fn(() => "blob:url")
      // @ts-expect-error - global URL
      global.URL.revokeObjectURL = vi.fn()

      voice.downloadSyx()

      expect(createElementSpy).toHaveBeenCalledWith("a")
      expect(mockAnchor.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it("triggers download with custom filename", () => {
      const voice = createVoice()

      const mockAnchor = {
        click: vi.fn(),
      }
      // @ts-expect-error - mock type
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockAnchor)
      // @ts-expect-error - mock type
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => null)
      // @ts-expect-error - mock type
      const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => null)

      // @ts-expect-error - global URL
      global.URL.createObjectURL = vi.fn(() => "blob:url")
      // @ts-expect-error - global URL
      global.URL.revokeObjectURL = vi.fn()

      voice.downloadSyx("Custom_Name")

      expect(createElementSpy).toHaveBeenCalledWith("a")
      expect(mockAnchor.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe("getBankVoiceNames", () => {
    it("returns voice names from current bank", () => {
      const voice = createVoice()
      const names = voice.getBankVoiceNames()

      expect(names).toBeInstanceOf(Array)
      expect(names.length).toBe(32)
    })
  })

  describe("getBankNames", () => {
    it("returns names of all banks", () => {
      const voice = createVoice()
      const names = voice.getBankNames()

      expect(names).toBeInstanceOf(Array)
      expect(names.length).toBeGreaterThan(0)
    })
  })

  describe("switchBank", () => {
    it("switches to valid bank index", () => {
      const voice = createVoice()

      voice.switchBank(0)

      expect(voice.currentBank.value).toBe(0)
    })

    it("throws error for invalid bank index", () => {
      const voice = createVoice()

      expect(() => voice.switchBank(-1)).toThrow("Invalid bank index")
      expect(() => voice.switchBank(999)).toThrow("Invalid bank index")
    })
  })

  describe("loadFromVoiceIndex", () => {
    it("loads voice from valid index", () => {
      const voice = createVoice()

      voice.loadFromVoiceIndex(0)

      expect(voice.currentVoiceIndex.value).toBe(0)
    })

    it("throws error for invalid voice index", () => {
      const voice = createVoice()

      expect(() => voice.loadFromVoiceIndex(-1)).toThrow("Invalid voice index")
      expect(() => voice.loadFromVoiceIndex(999)).toThrow("Invalid voice index")
    })
  })

  describe("loadFromFile", () => {
    it("throws error for unsupported file type", async () => {
      const voice = createVoice()
      const invalidFile = new File(["content"], "test.txt", { type: "text/plain" })

      await expect(voice.loadFromFile(invalidFile)).rejects.toThrow("Unsupported file type")
    })
  })

  describe("deleteBank", () => {
    it("throws error when deleting last bank", () => {
      const voice = createVoice()
      voice.banks.value = [{ name: "Only Bank", bank: {} }]

      expect(() => voice.deleteBank(0)).toThrow("Cannot delete the last bank")
    })
  })

  describe("renameBank", () => {
    it("renames bank at valid index", () => {
      const voice = createVoice()
      voice.banks.value = [
        { name: "Old Name", bank: {} },
        { name: "Other Bank", bank: {} },
      ]

      voice.renameBank(0, "New Name")

      expect(voice.banks.value[0].name).toBe("New Name")
    })

    it("does nothing for invalid bank index", () => {
      const voice = createVoice()
      voice.banks.value = [{ name: "Bank", bank: {} }]

      voice.renameBank(-1, "New Name")

      expect(voice.banks.value[0].name).toBe("Bank")
    })
  })

  describe("resetBanks", () => {
    it("resets to default bank", () => {
      const voice = createVoice()
      voice.banks.value = [
        { name: "Bank 1", bank: {} },
        { name: "Bank 2", bank: {} },
        { name: "Bank 3", bank: {} },
      ]

      voice.resetBanks()

      expect(voice.banks.value.length).toBe(1)
      expect(voice.currentBank.value).toBe(0)
      expect(voice.currentVoiceIndex.value).toBe(0)
    })
  })

  describe("initVoice", () => {
    it("throws error when no bank loaded", () => {
      const voice = createVoice()
      voice.banks.value = []

      expect(() => voice.initVoice(0)).toThrow("No bank loaded")
    })
  })

  describe("copyVoice", () => {
    it("throws error when no bank loaded", () => {
      const voice = createVoice()
      voice.banks.value = []

      expect(() => voice.copyVoice(0, 1)).toThrow("No bank loaded")
    })
  })

  describe("renameVoice", () => {
    it("throws error when no bank loaded", () => {
      const voice = createVoice()
      voice.banks.value = []

      expect(() => voice.renameVoice(0, "New Name")).toThrow("No bank loaded")
    })
  })

  describe("replaceVoiceInBank", () => {
    it("throws error when no bank loaded", () => {
      const voice = createVoice()
      voice.banks.value = []

      expect(() => voice.replaceVoiceInBank(0)).toThrow("No bank loaded")
    })
  })
})
