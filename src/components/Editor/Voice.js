import { DX7Bank, DX7Voice, noteNameToNumber, noteNumberToName } from "midiwire"
import { createSignal } from "solid-js"
import { loadBanks, loadSettings, saveBanks, saveSettings } from "./storage.js"

/** @type {string[]} */
const CURVES = ["-LN", "-EX", "+EX", "+LN"]

/** @type {string[]} */
const WAVES = ["TRIANGLE", "SAW DOWN", "SAW UP", "SQUARE", "SINE", "SAMPLE & HOLD"]

/** @type {Record<string, number>} */
const CURVE_MAP = { "-LN": 0, "-EX": 1, "+EX": 2, "+LN": 3 }

/** @type {Record<string, number>} */
const WAVE_MAP = { TRIANGLE: 0, "SAW DOWN": 1, "SAW UP": 2, SQUARE: 3, SINE: 4, "SAMPLE & HOLD": 5 }

/**
 * Creates a voice state manager for the DX7 editor.
 * Manages operators, pitch EG, LFO, global settings, and bank data using Solid signals.
 * @returns {Object} Voice state manager with signals and methods
 */
export function createVoice() {
  const operators = Array(6)
    .fill(null)
    .map(() => ({
      egRate1: createSignal(99),
      egRate2: createSignal(99),
      egRate3: createSignal(99),
      egRate4: createSignal(99),
      egLevel1: createSignal(99),
      egLevel2: createSignal(99),
      egLevel3: createSignal(99),
      egLevel4: createSignal(0),

      breakPoint: createSignal(0),
      leftDepth: createSignal(0),
      rightDepth: createSignal(0),
      leftCurve: createSignal(0),
      rightCurve: createSignal(0),
      rateScaling: createSignal(0),

      ampModSens: createSignal(0),
      keyVelocity: createSignal(0),
      outputLevel: createSignal(99),

      mode: createSignal(0), // 0=ratio, 1=fixed
      coarse: createSignal(1),
      fine: createSignal(0),
      detune: createSignal(7), // 0-14, center at 7
      oscDetune: createSignal(0),

      // UI-only
      enabled: createSignal(true),
    }))

  const pitchEG = {
    rate1: createSignal(99),
    rate2: createSignal(99),
    rate3: createSignal(99),
    rate4: createSignal(99),
    level1: createSignal(50),
    level2: createSignal(50),
    level3: createSignal(50),
    level4: createSignal(50),
  }

  const lfo = {
    speed: createSignal(35),
    delay: createSignal(0),
    pmDepth: createSignal(0),
    amDepth: createSignal(0),
    keySync: createSignal(1),
    wave: createSignal(0),
    pmSens: createSignal(3),
  }

  const global = {
    algorithm: createSignal(1), // 1-32
    feedback: createSignal(0), // 0-7
    oscSync: createSignal(1),
    transpose: createSignal(24), // 0-48 (-24 to +24)
    ampModSens: createSignal(0),
    egBiasSens: createSignal(0),
    name: createSignal("Init Voice"),
  }

  const savedBanks = loadBanks()
  const [banks, setBanks] = createSignal(savedBanks || [{ name: "Init Bank", bank: new DX7Bank() }])
  const [currentBank, setCurrentBank] = createSignal(0)
  const [currentVoiceIndex, setCurrentVoiceIndex] = createSignal(0)
  const [settings, setSettings] = createSignal(loadSettings())

  loadFromVoice(banks()[0].bank.getVoice(0))

  /**
   * Converts the current voice state to JSON format.
   * @returns {Object} Voice data in JSON format
   */
  function toJSON() {
    return {
      name: global.name[0](),
      operators: operators.map((op, i) => ({
        id: i + 1,
        osc: {
          detune: op.oscDetune[0](),
          freq: {
            coarse: op.coarse[0](),
            fine: op.fine[0](),
            mode: op.mode[0]() === 1 ? "FIXED" : "RATIO",
          },
        },
        eg: {
          rates: [op.egRate1[0](), op.egRate2[0](), op.egRate3[0](), op.egRate4[0]()],
          levels: [op.egLevel1[0](), op.egLevel2[0](), op.egLevel3[0](), op.egLevel4[0]()],
        },
        key: {
          velocity: op.keyVelocity[0](),
          scaling: op.rateScaling[0](),
          breakPoint: noteNumberToName(op.breakPoint[0]() + 9),
        },
        output: {
          level: op.outputLevel[0](),
          ampModSens: op.ampModSens[0](),
        },
        scale: {
          left: {
            depth: op.leftDepth[0](),
            curve: CURVES[op.leftCurve[0]()] || "-LN",
          },
          right: {
            depth: op.rightDepth[0](),
            curve: CURVES[op.rightCurve[0]()] || "-LN",
          },
        },
      })),
      pitchEG: {
        rates: [pitchEG.rate1[0](), pitchEG.rate2[0](), pitchEG.rate3[0](), pitchEG.rate4[0]()],
        levels: [pitchEG.level1[0](), pitchEG.level2[0](), pitchEG.level3[0](), pitchEG.level4[0]()],
      },
      lfo: {
        speed: lfo.speed[0](),
        delay: lfo.delay[0](),
        pmDepth: lfo.pmDepth[0](),
        amDepth: lfo.amDepth[0](),
        keySync: lfo.keySync[0]() === 1,
        wave: WAVES[lfo.wave[0]()] || "TRIANGLE",
      },
      global: {
        algorithm: global.algorithm[0](),
        feedback: global.feedback[0](),
        oscKeySync: global.oscSync[0]() === 1,
        pitchModSens: lfo.pmSens[0](),
        transpose: global.transpose[0]() - 24,
        ampModSens: global.ampModSens[0](),
        egBiasSens: global.egBiasSens[0](),
      },
    }
  }

  /**
   * Converts the current voice state to System Exclusive (SysEx) format.
   * @returns {Uint8Array} Voice data as SysEx bytes
   */
  function toSysEx() {
    const json = toJSON()
    const voice = DX7Voice.fromJSON(json)
    return voice.toSysEx()
  }

  /**
   * Downloads the current voice as a .syx file.
   * @param {string} [filename] - Optional filename (defaults to voice name)
   */
  function downloadSyx(filename = null) {
    const sysex = toSysEx()
    const blob = new Blob([sysex], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename || `${global.name[0]().replace(/\s+/g, "_")}.syx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Loads voice data from a JSON object.
   * @param {Object} json - Voice data in JSON format
   * @throws {Error} If json is not a valid object
   */
  function loadFromJSON(json) {
    if (!json || typeof json !== "object") {
      throw new Error("Invalid JSON: expected object")
    }

    if (json.global) {
      global.name[1](json.name || "Loaded Voice")
      global.algorithm[1](json.global.algorithm || 1)
      global.feedback[1](json.global.feedback || 0)
      global.oscSync[1](json.global.oscKeySync ? 1 : 0)
      global.transpose[1]((json.global.transpose || 0) + 24)
      global.ampModSens[1](json.global.ampModSens || 0)
      global.egBiasSens[1](json.global.egBiasSens || 0)
    }

    if (json.lfo) {
      lfo.speed[1](json.lfo.speed || 35)
      lfo.delay[1](json.lfo.delay || 0)
      lfo.pmDepth[1](json.lfo.pmDepth || 0)
      lfo.amDepth[1](json.lfo.amDepth || 0)
      lfo.keySync[1](json.lfo.keySync ? 1 : 0)
      lfo.wave[1](WAVE_MAP[json.lfo.wave] || 0)
      lfo.pmSens[1](json.global?.pitchModSens || 3)
    }

    if (json.pitchEG) {
      pitchEG.rate1[1](json.pitchEG.rates?.[0] ?? 99)
      pitchEG.rate2[1](json.pitchEG.rates?.[1] ?? 99)
      pitchEG.rate3[1](json.pitchEG.rates?.[2] ?? 99)
      pitchEG.rate4[1](json.pitchEG.rates?.[3] ?? 99)
      pitchEG.level1[1](json.pitchEG.levels?.[0] ?? 50)
      pitchEG.level2[1](json.pitchEG.levels?.[1] ?? 50)
      pitchEG.level3[1](json.pitchEG.levels?.[2] ?? 50)
      pitchEG.level4[1](json.pitchEG.levels?.[3] ?? 50)
    }

    if (json.operators && Array.isArray(json.operators)) {
      json.operators.forEach((opData, i) => {
        if (i >= 6) return
        const op = operators[i]

        op.egRate1[1](opData.eg?.rates?.[0] ?? 99)
        op.egRate2[1](opData.eg?.rates?.[1] ?? 99)
        op.egRate3[1](opData.eg?.rates?.[2] ?? 99)
        op.egRate4[1](opData.eg?.rates?.[3] ?? 99)
        op.egLevel1[1](opData.eg?.levels?.[0] ?? 99)
        op.egLevel2[1](opData.eg?.levels?.[1] ?? 99)
        op.egLevel3[1](opData.eg?.levels?.[2] ?? 99)
        op.egLevel4[1](opData.eg?.levels?.[3] ?? 0)

        op.mode[1](opData.osc?.freq?.mode === "FIXED" ? 1 : 0)
        op.coarse[1](opData.osc?.freq?.coarse ?? 1)
        op.fine[1](opData.osc?.freq?.fine ?? 0)
        op.detune[1]((opData.osc?.detune ?? 0) + 7)
        op.oscDetune[1](opData.osc?.detune ?? 0)

        const bpName = opData.key?.breakPoint || "A-1"
        try {
          op.breakPoint[1](noteNameToNumber(bpName) - 9)
        } catch {
          op.breakPoint[1](0)
        }
        op.rateScaling[1](opData.key?.scaling ?? 0)
        op.keyVelocity[1](opData.key?.velocity ?? 0)

        op.leftDepth[1](opData.scale?.left?.depth ?? 0)
        op.rightDepth[1](opData.scale?.right?.depth ?? 0)
        op.leftCurve[1](CURVE_MAP[opData.scale?.left?.curve] ?? 0)
        op.rightCurve[1](CURVE_MAP[opData.scale?.right?.curve] ?? 0)

        op.outputLevel[1](opData.output?.level ?? 99)
        op.ampModSens[1](opData.output?.ampModSens ?? 0)
      })
    }
  }

  /**
   * Loads voice data from a DX7Voice instance.
   * @param {DX7Voice} voice - DX7Voice instance to load from
   */
  function loadFromVoice(voice) {
    const json = typeof voice.toJSON === "function" ? voice.toJSON() : voice
    loadFromJSON(json)
  }

  /**
   * Loads a voice from the current bank by index.
   * @param {number} index - Voice index in the bank (0-31)
   * @throws {Error} If index is out of range
   */
  function loadFromVoiceIndex(index) {
    const bankEntry = banks()[currentBank()]
    if (!bankEntry || !bankEntry.bank) return
    const bank = bankEntry.bank
    if (index < 0 || index >= bank.voices.length) {
      throw new Error(`Invalid voice index: ${index}`)
    }
    setCurrentVoiceIndex(index)
    loadFromVoice(bank.voices[index])
  }

  /**
   * Switches to a different bank by index.
   * @param {number} bankIndex - Index of the bank to switch to
   * @throws {Error} If bankIndex is out of range
   */
  function switchBank(bankIndex) {
    if (bankIndex < 0 || bankIndex >= banks().length) {
      throw new Error(`Invalid bank index: ${bankIndex}`)
    }
    setCurrentBank(bankIndex)
    const bank = banks()[bankIndex].bank
    if (bank && bank.voices.length > 0) {
      setCurrentVoiceIndex(0)
      loadFromVoice(bank.voices[0])
    }
  }

  /**
   * Gets the names of all voices in the current bank.
   * @returns {string[]} Array of voice names
   */
  function getBankVoiceNames() {
    const bankEntry = banks()[currentBank()]
    if (!bankEntry || !bankEntry.bank) return []
    const bank = bankEntry.bank
    if (typeof bank.getVoiceNames === "function") {
      return bank.getVoiceNames()
    }
    return (bank.voices || []).map((v, i) => v.name || `Voice ${i + 1}`)
  }

  /**
   * Gets the names of all loaded banks.
   * @returns {string[]} Array of bank names
   */
  function getBankNames() {
    return banks().map((entry, i) => entry.name || `Bank ${i + 1}`)
  }

  /**
   * Replaces a voice in the current bank at the specified index.
   * @param {number} index - Voice index to replace (0-31)
   * @throws {Error} If no bank is loaded
   */
  function replaceVoiceInBank(index) {
    const bankEntry = banks()[currentBank()]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const json = toJSON()
    const voice = DX7Voice.fromJSON(json)
    bankEntry.bank.replaceVoice(index, voice)
    saveBanks(banks())
  }

  /**
   * Loads voice data from a file (.syx or .json).
   * @param {File} file - File to load
   * @returns {Promise<{isBank: boolean, voiceCount: number, fileType: string}>} Result info
   * @throws {Error} If file type is unsupported or parsing fails
   */
  async function loadFromFile(file) {
    const ext = file.name.toLowerCase().split(".").pop()
    const bankName = file.name.replace(/\.[^/.]+$/, "")

    if (ext === "json") {
      const text = await file.text()
      const json = JSON.parse(text)

      if (json.voices && Array.isArray(json.voices)) {
        const name = json.name || bankName
        const bank = DX7Bank.fromJSON(json)
        const bankWrapper = { name, bank }
        const newBanks = [...banks(), bankWrapper]
        setBanks(newBanks)
        setCurrentBank(newBanks.length - 1)
        setCurrentVoiceIndex(0)
        loadFromJSON(json.voices[0])
        saveBanks(newBanks)
        return { isBank: true, voiceCount: json.voices.length, fileType: "json" }
      } else {
        loadFromJSON(json)
        return { isBank: false, voiceCount: 1, fileType: "json" }
      }
    } else if (ext === "syx") {
      const bank = await DX7Bank.fromFile(file)
      const newBanks = [...banks(), { name: bankName, bank }]
      setBanks(newBanks)
      setCurrentBank(newBanks.length - 1)
      setCurrentVoiceIndex(0)
      loadFromVoice(bank.voices[0])
      saveBanks(newBanks)
      return { isBank: true, voiceCount: bank.voices.length, fileType: "syx" }
    } else {
      throw new Error(`Unsupported file type: .${ext}. Use .syx or .json`)
    }
  }

  /**
   * Deletes a bank by index.
   * @param {number} bankIndex - Index of bank to delete
   * @throws {Error} If trying to delete the last bank
   */
  function deleteBank(bankIndex) {
    if (banks().length <= 1) {
      throw new Error("Cannot delete the last bank")
    }
    const newBanks = banks().filter((_, i) => i !== bankIndex)
    setBanks(newBanks)
    if (currentBank() >= newBanks.length) {
      setCurrentBank(newBanks.length - 1)
    }
    saveBanks(newBanks)
    loadFromVoice(newBanks[currentBank()].bank.getVoice(0))
  }

  /**
   * Renames a bank.
   * @param {number} bankIndex - Index of bank to rename
   * @param {string} newName - New name for the bank
   */
  function renameBank(bankIndex, newName) {
    if (bankIndex < 0 || bankIndex >= banks().length) return
    const updatedBanks = banks().map((entry, i) => (i === bankIndex ? { ...entry, name: newName } : entry))
    setBanks(updatedBanks)
    saveBanks(updatedBanks)
  }

  /**
   * Resets to initial state with just the default bank.
   */
  function resetBanks() {
    const initBanks = [{ name: "Init Bank", bank: new DX7Bank() }]
    setBanks(initBanks)
    setCurrentBank(0)
    setCurrentVoiceIndex(0)
    loadFromVoice(initBanks[0].bank.getVoice(0))
    saveBanks(initBanks)
  }

  /**
   * Initializes/clears a voice slot to a default initialized voice.
   * @param {number} index - Voice index to initialize (0-31)
   * @throws {Error} If no bank is loaded
   */
  function initVoice(index) {
    const bankEntry = banks()[currentBank()]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const defaultVoice = DX7Voice.createDefault(index)
    bankEntry.bank.replaceVoice(index, defaultVoice)
    // Trigger reactivity by creating new array reference
    setBanks([...banks()])
    saveBanks(banks())
    // Reload current voice if we initialized the currently selected one
    if (index === currentVoiceIndex()) {
      loadFromVoice(bankEntry.bank.getVoice(index))
    }
  }

  /**
   * Copies a voice from one slot to another.
   * @param {number} fromIndex - Source voice index (0-31)
   * @param {number} toIndex - Destination voice index (0-31)
   * @throws {Error} If no bank is loaded
   */
  function copyVoice(fromIndex, toIndex) {
    const bankEntry = banks()[currentBank()]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const sourceVoice = bankEntry.bank.getVoice(fromIndex)
    const voiceCopy = DX7Voice.fromJSON(sourceVoice.toJSON())
    bankEntry.bank.replaceVoice(toIndex, voiceCopy)
    // Trigger reactivity by creating new array reference
    setBanks([...banks()])
    saveBanks(banks())
    // Reload current voice if we copied to the currently selected slot
    if (toIndex === currentVoiceIndex()) {
      loadFromVoice(bankEntry.bank.getVoice(toIndex))
    }
  }

  /**
   * Renames a voice in the current bank.
   * @param {number} index - Voice index to rename (0-31)
   * @param {string} newName - New name for the voice
   * @throws {Error} If no bank is loaded
   */
  function renameVoice(index, newName) {
    const bankEntry = banks()[currentBank()]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const voice = bankEntry.bank.getVoice(index)
    voice.name = newName
    // Create a new bank with the updated voice to ensure reactivity
    const bankData = bankEntry.bank.toJSON()
    const updatedBank = /** @type {{ voices: Array<{ name: string }> }} */ (bankData)
    updatedBank.voices[index].name = newName
    const newBank = DX7Bank.fromJSON(updatedBank)
    // Create new banks array with the updated bank
    setBanks(banks().map((entry, i) => (i === currentBank() ? { ...entry, bank: newBank } : entry)))
    saveBanks(banks())
    // Update current voice name if we renamed the currently selected voice
    if (index === currentVoiceIndex()) {
      global.name[1](newName)
    }
  }

  /**
   * Updates a setting and persists it to localStorage.
   * @param {string} key - Setting key to update
   * @param {unknown} value - New value for the setting
   */
  function updateSetting(key, value) {
    const updated = { ...settings(), [key]: value }
    setSettings(updated)
    saveSettings({ [key]: value })
  }

  return {
    /** @type {Array<Object>} Array of 6 operator signal objects */
    operators,
    /** @type {Object} Pitch envelope generator signals */
    pitchEG,
    /** @type {Object} LFO signals */
    lfo,
    /** @type {Object} Global voice settings signals */
    global,
    /** @type {[() => Array<Object>, (v: Array<Object>) => void]} Banks signal getter/setter tuple */
    banks: [banks, setBanks],
    /** @type {[() => number, (v: number) => void]} Current bank index signal getter/setter tuple */
    currentBank: [currentBank, setCurrentBank],
    /** @type {[() => number, (v: number) => void]} Current voice index signal getter/setter tuple */
    currentVoiceIndex: [currentVoiceIndex, setCurrentVoiceIndex],
    /** @type {[() => Object, (v: Object) => void]} Settings signal getter/setter tuple */
    settings: [settings, setSettings],
    toJSON,
    toSysEx,
    downloadSyx,
    loadFromFile,
    loadFromVoiceIndex,
    getBankVoiceNames,
    getBankNames,
    switchBank,
    replaceVoiceInBank,
    deleteBank,
    renameBank,
    resetBanks,
    initVoice,
    copyVoice,
    renameVoice,
    updateSetting,
  }
}
