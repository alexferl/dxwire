import { signal } from "@preact/signals"
import { DX7Bank, DX7Voice, noteNameToNumber, noteNumberToName } from "midiwire"
import { loadBanks, saveBanks } from "./storage.js"

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
 * Manages operators, pitch EG, LFO, global settings, and bank data using Preact signals.
 * @returns {Object} Voice state manager with signals and methods
 */
export function createVoice() {
  const operators = Array(6)
    .fill(null)
    .map(() => ({
      egRate1: signal(99),
      egRate2: signal(99),
      egRate3: signal(99),
      egRate4: signal(99),
      egLevel1: signal(99),
      egLevel2: signal(99),
      egLevel3: signal(99),
      egLevel4: signal(0),

      breakPoint: signal(0),
      leftDepth: signal(0),
      rightDepth: signal(0),
      leftCurve: signal(0),
      rightCurve: signal(0),
      rateScaling: signal(0),

      ampModSens: signal(0),
      keyVelocity: signal(0),
      outputLevel: signal(99),

      mode: signal(0), // 0=ratio, 1=fixed
      coarse: signal(1),
      fine: signal(0),
      detune: signal(7), // 0-14, center at 7
      oscDetune: signal(0),

      // UI-only
      enabled: signal(true),
    }))

  const pitchEG = {
    rate1: signal(99),
    rate2: signal(99),
    rate3: signal(99),
    rate4: signal(99),
    level1: signal(50),
    level2: signal(50),
    level3: signal(50),
    level4: signal(50),
  }

  const lfo = {
    speed: signal(35),
    delay: signal(0),
    pmDepth: signal(0),
    amDepth: signal(0),
    keySync: signal(1),
    wave: signal(0),
    pmSens: signal(3),
  }

  const global = {
    algorithm: signal(1), // 1-32
    feedback: signal(0), // 0-7
    oscSync: signal(1),
    transpose: signal(24), // 0-48 (-24 to +24)
    ampModSens: signal(0),
    egBiasSens: signal(0),
    name: signal("Init Voice"),
  }

  const savedBanks = loadBanks()
  const banks = signal(savedBanks || [{ name: "Init Bank", bank: new DX7Bank() }])
  const currentBank = signal(0)
  const currentVoiceIndex = signal(0)

  loadFromVoice(banks.value[0].bank.getVoice(0))

  /**
   * Converts the current voice state to JSON format.
   * @returns {Object} Voice data in JSON format
   */
  function toJSON() {
    return {
      name: global.name.value,
      operators: operators.map((op, i) => ({
        id: i + 1,
        osc: {
          detune: op.oscDetune.value,
          freq: {
            coarse: op.coarse.value,
            fine: op.fine.value,
            mode: op.mode.value === 1 ? "FIXED" : "RATIO",
          },
        },
        eg: {
          rates: [op.egRate1.value, op.egRate2.value, op.egRate3.value, op.egRate4.value],
          levels: [op.egLevel1.value, op.egLevel2.value, op.egLevel3.value, op.egLevel4.value],
        },
        key: {
          velocity: op.keyVelocity.value,
          scaling: op.rateScaling.value,
          breakPoint: noteNumberToName(op.breakPoint.value + 9),
        },
        output: {
          level: op.outputLevel.value,
          ampModSens: op.ampModSens.value,
        },
        scale: {
          left: {
            depth: op.leftDepth.value,
            curve: CURVES[op.leftCurve.value] || "-LN",
          },
          right: {
            depth: op.rightDepth.value,
            curve: CURVES[op.rightCurve.value] || "-LN",
          },
        },
      })),
      pitchEG: {
        rates: [pitchEG.rate1.value, pitchEG.rate2.value, pitchEG.rate3.value, pitchEG.rate4.value],
        levels: [pitchEG.level1.value, pitchEG.level2.value, pitchEG.level3.value, pitchEG.level4.value],
      },
      lfo: {
        speed: lfo.speed.value,
        delay: lfo.delay.value,
        pmDepth: lfo.pmDepth.value,
        amDepth: lfo.amDepth.value,
        keySync: lfo.keySync.value === 1,
        wave: WAVES[lfo.wave.value] || "TRIANGLE",
      },
      global: {
        algorithm: global.algorithm.value,
        feedback: global.feedback.value,
        oscKeySync: global.oscSync.value === 1,
        pitchModSens: lfo.pmSens.value,
        transpose: global.transpose.value - 24,
        ampModSens: global.ampModSens.value,
        egBiasSens: global.egBiasSens.value,
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
    a.download = filename || `${global.name.value.replace(/\s+/g, "_")}.syx`
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
      global.name.value = json.name || "Loaded Voice"
      global.algorithm.value = json.global.algorithm || 1
      global.feedback.value = json.global.feedback || 0
      global.oscSync.value = json.global.oscKeySync ? 1 : 0
      global.transpose.value = (json.global.transpose || 0) + 24
      global.ampModSens.value = json.global.ampModSens || 0
      global.egBiasSens.value = json.global.egBiasSens || 0
    }

    if (json.lfo) {
      lfo.speed.value = json.lfo.speed || 35
      lfo.delay.value = json.lfo.delay || 0
      lfo.pmDepth.value = json.lfo.pmDepth || 0
      lfo.amDepth.value = json.lfo.amDepth || 0
      lfo.keySync.value = json.lfo.keySync ? 1 : 0
      lfo.wave.value = WAVE_MAP[json.lfo.wave] || 0
      lfo.pmSens.value = json.global?.pitchModSens || 3
    }

    if (json.pitchEG) {
      pitchEG.rate1.value = json.pitchEG.rates?.[0] ?? 99
      pitchEG.rate2.value = json.pitchEG.rates?.[1] ?? 99
      pitchEG.rate3.value = json.pitchEG.rates?.[2] ?? 99
      pitchEG.rate4.value = json.pitchEG.rates?.[3] ?? 99
      pitchEG.level1.value = json.pitchEG.levels?.[0] ?? 50
      pitchEG.level2.value = json.pitchEG.levels?.[1] ?? 50
      pitchEG.level3.value = json.pitchEG.levels?.[2] ?? 50
      pitchEG.level4.value = json.pitchEG.levels?.[3] ?? 50
    }

    if (json.operators && Array.isArray(json.operators)) {
      json.operators.forEach((opData, i) => {
        if (i >= 6) return
        const op = operators[i]

        op.egRate1.value = opData.eg?.rates?.[0] ?? 99
        op.egRate2.value = opData.eg?.rates?.[1] ?? 99
        op.egRate3.value = opData.eg?.rates?.[2] ?? 99
        op.egRate4.value = opData.eg?.rates?.[3] ?? 99
        op.egLevel1.value = opData.eg?.levels?.[0] ?? 99
        op.egLevel2.value = opData.eg?.levels?.[1] ?? 99
        op.egLevel3.value = opData.eg?.levels?.[2] ?? 99
        op.egLevel4.value = opData.eg?.levels?.[3] ?? 0

        op.mode.value = opData.osc?.freq?.mode === "FIXED" ? 1 : 0
        op.coarse.value = opData.osc?.freq?.coarse ?? 1
        op.fine.value = opData.osc?.freq?.fine ?? 0
        op.detune.value = (opData.osc?.detune ?? 0) + 7
        op.oscDetune.value = opData.osc?.detune ?? 0

        const bpName = opData.key?.breakPoint || "A-1"
        try {
          op.breakPoint.value = noteNameToNumber(bpName) - 9
        } catch {
          op.breakPoint.value = 0
        }
        op.rateScaling.value = opData.key?.scaling ?? 0
        op.keyVelocity.value = opData.key?.velocity ?? 0

        op.leftDepth.value = opData.scale?.left?.depth ?? 0
        op.rightDepth.value = opData.scale?.right?.depth ?? 0
        op.leftCurve.value = CURVE_MAP[opData.scale?.left?.curve] ?? 0
        op.rightCurve.value = CURVE_MAP[opData.scale?.right?.curve] ?? 0

        op.outputLevel.value = opData.output?.level ?? 99
        op.ampModSens.value = opData.output?.ampModSens ?? 0
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
    const bankEntry = banks.value[currentBank.value]
    if (!bankEntry || !bankEntry.bank) return
    const bank = bankEntry.bank
    if (index < 0 || index >= bank.voices.length) {
      throw new Error(`Invalid voice index: ${index}`)
    }
    currentVoiceIndex.value = index
    loadFromVoice(bank.voices[index])
  }

  /**
   * Switches to a different bank by index.
   * @param {number} bankIndex - Index of the bank to switch to
   * @throws {Error} If bankIndex is out of range
   */
  function switchBank(bankIndex) {
    if (bankIndex < 0 || bankIndex >= banks.value.length) {
      throw new Error(`Invalid bank index: ${bankIndex}`)
    }
    currentBank.value = bankIndex
    const bank = banks.value[bankIndex].bank
    if (bank && bank.voices.length > 0) {
      currentVoiceIndex.value = 0
      loadFromVoice(bank.voices[0])
    }
  }

  /**
   * Gets the names of all voices in the current bank.
   * @returns {string[]} Array of voice names
   */
  function getBankVoiceNames() {
    const bankEntry = banks.value[currentBank.value]
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
    return banks.value.map((entry, i) => entry.name || `Bank ${i + 1}`)
  }

  /**
   * Replaces a voice in the current bank at the specified index.
   * @param {number} index - Voice index to replace (0-31)
   * @throws {Error} If no bank is loaded
   */
  function replaceVoiceInBank(index) {
    const bankEntry = banks.value[currentBank.value]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const json = toJSON()
    const voice = DX7Voice.fromJSON(json)
    bankEntry.bank.replaceVoice(index, voice)
    saveBanks(banks.value)
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
        banks.value = [...banks.value, bankWrapper]
        currentBank.value = banks.value.length - 1
        currentVoiceIndex.value = 0
        loadFromJSON(json.voices[0])
        saveBanks(banks.value)
        return { isBank: true, voiceCount: json.voices.length, fileType: "json" }
      } else {
        loadFromJSON(json)
        return { isBank: false, voiceCount: 1, fileType: "json" }
      }
    } else if (ext === "syx") {
      const bank = await DX7Bank.fromFile(file)
      banks.value = [...banks.value, { name: bankName, bank }]
      currentBank.value = banks.value.length - 1
      currentVoiceIndex.value = 0
      loadFromVoice(bank.voices[0])
      saveBanks(banks.value)
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
    if (banks.value.length <= 1) {
      throw new Error("Cannot delete the last bank")
    }
    const newBanks = banks.value.filter((_, i) => i !== bankIndex)
    banks.value = newBanks
    if (currentBank.value >= newBanks.length) {
      currentBank.value = newBanks.length - 1
    }
    saveBanks(banks.value)
    loadFromVoice(banks.value[currentBank.value].bank.getVoice(0))
  }

  /**
   * Renames a bank.
   * @param {number} bankIndex - Index of bank to rename
   * @param {string} newName - New name for the bank
   */
  function renameBank(bankIndex, newName) {
    if (bankIndex < 0 || bankIndex >= banks.value.length) return
    banks.value = banks.value.map((entry, i) => (i === bankIndex ? { ...entry, name: newName } : entry))
    saveBanks(banks.value)
  }

  /**
   * Resets to initial state with just the default bank.
   */
  function resetBanks() {
    banks.value = [{ name: "Init Bank", bank: new DX7Bank() }]
    currentBank.value = 0
    currentVoiceIndex.value = 0
    loadFromVoice(banks.value[0].bank.getVoice(0))
    saveBanks(banks.value)
  }

  /**
   * Initializes/clears a voice slot to a default initialized voice.
   * @param {number} index - Voice index to initialize (0-31)
   * @throws {Error} If no bank is loaded
   */
  function initVoice(index) {
    const bankEntry = banks.value[currentBank.value]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const defaultVoice = DX7Voice.createDefault(index)
    bankEntry.bank.replaceVoice(index, defaultVoice)
    // Trigger reactivity by creating new array reference
    banks.value = [...banks.value]
    saveBanks(banks.value)
    // Reload current voice if we initialized the currently selected one
    if (index === currentVoiceIndex.value) {
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
    const bankEntry = banks.value[currentBank.value]
    if (!bankEntry || !bankEntry.bank) {
      throw new Error("No bank loaded")
    }
    const sourceVoice = bankEntry.bank.getVoice(fromIndex)
    const voiceCopy = DX7Voice.fromJSON(sourceVoice.toJSON())
    bankEntry.bank.replaceVoice(toIndex, voiceCopy)
    // Trigger reactivity by creating new array reference
    banks.value = [...banks.value]
    saveBanks(banks.value)
    // Reload current voice if we copied to the currently selected slot
    if (toIndex === currentVoiceIndex.value) {
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
    const bankEntry = banks.value[currentBank.value]
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
    banks.value = banks.value.map((entry, i) => (i === currentBank.value ? { ...entry, bank: newBank } : entry))
    saveBanks(banks.value)
    // Update current voice name if we renamed the currently selected voice
    if (index === currentVoiceIndex.value) {
      global.name.value = newName
    }
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
    /** @type {import("@preact/signals").Signal<Array<Object>>} Loaded banks signal */
    banks,
    /** @type {import("@preact/signals").Signal<number>} Current bank index signal */
    currentBank,
    /** @type {import("@preact/signals").Signal<number>} Current voice index signal */
    currentVoiceIndex,
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
  }
}
