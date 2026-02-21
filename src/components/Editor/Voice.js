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
 * Wraps a setter function to call a callback after setting.
 * @template T
 * @param {(v: T) => void} setter - Original setter
 * @param {() => void} callback - Callback to call after set
 * @returns {(v: T) => void} Wrapped setter
 */
function wrapSetter(setter, callback) {
  return (value) => {
    setter(value)
    callback()
  }
}

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = createSignal(false)
  const [justSaved, setJustSaved] = createSignal(false)
  let justSavedTimeout = null

  // Store the original voice snapshot for comparison
  let originalVoiceSnapshot = null

  /**
   * Creates a snapshot of the current voice state for comparison.
   * @returns {Object} Snapshot of current voice parameters
   */
  function createSnapshot() {
    return {
      global: {
        name: global.name[0](),
        algorithm: global.algorithm[0](),
        feedback: global.feedback[0](),
        oscSync: global.oscSync[0](),
        transpose: global.transpose[0](),
        ampModSens: global.ampModSens[0](),
        egBiasSens: global.egBiasSens[0](),
      },
      lfo: {
        speed: lfo.speed[0](),
        delay: lfo.delay[0](),
        pmDepth: lfo.pmDepth[0](),
        amDepth: lfo.amDepth[0](),
        keySync: lfo.keySync[0](),
        wave: lfo.wave[0](),
        pmSens: lfo.pmSens[0](),
      },
      pitchEG: {
        rate1: pitchEG.rate1[0](),
        rate2: pitchEG.rate2[0](),
        rate3: pitchEG.rate3[0](),
        rate4: pitchEG.rate4[0](),
        level1: pitchEG.level1[0](),
        level2: pitchEG.level2[0](),
        level3: pitchEG.level3[0](),
        level4: pitchEG.level4[0](),
      },
      operators: operators.map((op) => ({
        egRate1: op.egRate1[0](),
        egRate2: op.egRate2[0](),
        egRate3: op.egRate3[0](),
        egRate4: op.egRate4[0](),
        egLevel1: op.egLevel1[0](),
        egLevel2: op.egLevel2[0](),
        egLevel3: op.egLevel3[0](),
        egLevel4: op.egLevel4[0](),
        breakPoint: op.breakPoint[0](),
        leftDepth: op.leftDepth[0](),
        rightDepth: op.rightDepth[0](),
        leftCurve: op.leftCurve[0](),
        rightCurve: op.rightCurve[0](),
        rateScaling: op.rateScaling[0](),
        ampModSens: op.ampModSens[0](),
        keyVelocity: op.keyVelocity[0](),
        outputLevel: op.outputLevel[0](),
        mode: op.mode[0](),
        coarse: op.coarse[0](),
        fine: op.fine[0](),
        detune: op.detune[0](),
        oscDetune: op.oscDetune[0](),
      })),
    }
  }

  /**
   * Compares two voice snapshots for equality.
   * @param {Object} a - First snapshot
   * @param {Object} b - Second snapshot
   * @returns {boolean} True if snapshots are equal
   */
  function snapshotsEqual(a, b) {
    if (!a || !b) return false

    // Compare global params
    for (const key of Object.keys(a.global)) {
      if (a.global[key] !== b.global[key]) return false
    }

    // Compare LFO params
    for (const key of Object.keys(a.lfo)) {
      if (a.lfo[key] !== b.lfo[key]) return false
    }

    // Compare pitch EG params
    for (const key of Object.keys(a.pitchEG)) {
      if (a.pitchEG[key] !== b.pitchEG[key]) return false
    }

    // Compare operators
    for (let i = 0; i < a.operators.length; i++) {
      const opA = a.operators[i]
      const opB = b.operators[i]
      for (const key of Object.keys(opA)) {
        if (opA[key] !== opB[key]) return false
      }
    }

    return true
  }

  /**
   * Marks the current voice as having unsaved changes.
   * Called automatically when any parameter changes.
   */
  function markUnsaved() {
    if (!originalVoiceSnapshot) {
      originalVoiceSnapshot = createSnapshot()
    }
    const current = createSnapshot()
    const isEqual = snapshotsEqual(originalVoiceSnapshot, current)
    setHasUnsavedChanges(!isEqual)
  }

  /**
   * Marks the current voice as saved.
   * Called when voice is saved to bank, exported, or sent to device.
   * @param {boolean} [showIndicator=true] - Whether to show the "Saved" indicator
   */
  function markSaved(showIndicator = true) {
    originalVoiceSnapshot = createSnapshot()
    setHasUnsavedChanges(false)
    if (showIndicator) {
      setJustSaved(true)
      if (justSavedTimeout) {
        clearTimeout(justSavedTimeout)
      }
      justSavedTimeout = setTimeout(() => {
        setJustSaved(false)
      }, 2000)
    }
  }

  /**
   * Discards unsaved changes and resets to the original loaded state.
   */
  function discardChanges() {
    if (originalVoiceSnapshot) {
      // Reload from the original snapshot
      const snapshot = originalVoiceSnapshot
      global.name[1](snapshot.global.name)
      global.algorithm[1](snapshot.global.algorithm)
      global.feedback[1](snapshot.global.feedback)
      global.oscSync[1](snapshot.global.oscSync)
      global.transpose[1](snapshot.global.transpose)
      global.ampModSens[1](snapshot.global.ampModSens)
      global.egBiasSens[1](snapshot.global.egBiasSens)

      lfo.speed[1](snapshot.lfo.speed)
      lfo.delay[1](snapshot.lfo.delay)
      lfo.pmDepth[1](snapshot.lfo.pmDepth)
      lfo.amDepth[1](snapshot.lfo.amDepth)
      lfo.keySync[1](snapshot.lfo.keySync)
      lfo.wave[1](snapshot.lfo.wave)
      lfo.pmSens[1](snapshot.lfo.pmSens)

      pitchEG.rate1[1](snapshot.pitchEG.rate1)
      pitchEG.rate2[1](snapshot.pitchEG.rate2)
      pitchEG.rate3[1](snapshot.pitchEG.rate3)
      pitchEG.rate4[1](snapshot.pitchEG.rate4)
      pitchEG.level1[1](snapshot.pitchEG.level1)
      pitchEG.level2[1](snapshot.pitchEG.level2)
      pitchEG.level3[1](snapshot.pitchEG.level3)
      pitchEG.level4[1](snapshot.pitchEG.level4)

      snapshot.operators.forEach((opSnapshot, i) => {
        const op = operators[i]
        op.egRate1[1](opSnapshot.egRate1)
        op.egRate2[1](opSnapshot.egRate2)
        op.egRate3[1](opSnapshot.egRate3)
        op.egRate4[1](opSnapshot.egRate4)
        op.egLevel1[1](opSnapshot.egLevel1)
        op.egLevel2[1](opSnapshot.egLevel2)
        op.egLevel3[1](opSnapshot.egLevel3)
        op.egLevel4[1](opSnapshot.egLevel4)
        op.breakPoint[1](opSnapshot.breakPoint)
        op.leftDepth[1](opSnapshot.leftDepth)
        op.rightDepth[1](opSnapshot.rightDepth)
        op.leftCurve[1](opSnapshot.leftCurve)
        op.rightCurve[1](opSnapshot.rightCurve)
        op.rateScaling[1](opSnapshot.rateScaling)
        op.ampModSens[1](opSnapshot.ampModSens)
        op.keyVelocity[1](opSnapshot.keyVelocity)
        op.outputLevel[1](opSnapshot.outputLevel)
        op.mode[1](opSnapshot.mode)
        op.coarse[1](opSnapshot.coarse)
        op.fine[1](opSnapshot.fine)
        op.detune[1](opSnapshot.detune)
        op.oscDetune[1](opSnapshot.oscDetune)
      })
    }
    setHasUnsavedChanges(false)
  }

  loadFromVoice(banks()[0].bank.getVoice(0))
  markSaved(false) // Mark initial state as saved, don't show indicator

  // Wrap all setters to call markUnsaved when parameters change
  // Operators
  operators.forEach((op) => {
    op.egRate1[1] = wrapSetter(op.egRate1[1], markUnsaved)
    op.egRate2[1] = wrapSetter(op.egRate2[1], markUnsaved)
    op.egRate3[1] = wrapSetter(op.egRate3[1], markUnsaved)
    op.egRate4[1] = wrapSetter(op.egRate4[1], markUnsaved)
    op.egLevel1[1] = wrapSetter(op.egLevel1[1], markUnsaved)
    op.egLevel2[1] = wrapSetter(op.egLevel2[1], markUnsaved)
    op.egLevel3[1] = wrapSetter(op.egLevel3[1], markUnsaved)
    op.egLevel4[1] = wrapSetter(op.egLevel4[1], markUnsaved)
    op.breakPoint[1] = wrapSetter(op.breakPoint[1], markUnsaved)
    op.leftDepth[1] = wrapSetter(op.leftDepth[1], markUnsaved)
    op.rightDepth[1] = wrapSetter(op.rightDepth[1], markUnsaved)
    op.leftCurve[1] = wrapSetter(op.leftCurve[1], markUnsaved)
    op.rightCurve[1] = wrapSetter(op.rightCurve[1], markUnsaved)
    op.rateScaling[1] = wrapSetter(op.rateScaling[1], markUnsaved)
    op.ampModSens[1] = wrapSetter(op.ampModSens[1], markUnsaved)
    op.keyVelocity[1] = wrapSetter(op.keyVelocity[1], markUnsaved)
    op.outputLevel[1] = wrapSetter(op.outputLevel[1], markUnsaved)
    op.mode[1] = wrapSetter(op.mode[1], markUnsaved)
    op.coarse[1] = wrapSetter(op.coarse[1], markUnsaved)
    op.fine[1] = wrapSetter(op.fine[1], markUnsaved)
    op.detune[1] = wrapSetter(op.detune[1], markUnsaved)
    op.oscDetune[1] = wrapSetter(op.oscDetune[1], markUnsaved)
    op.enabled[1] = wrapSetter(op.enabled[1], markUnsaved)
  })

  // Pitch EG
  pitchEG.rate1[1] = wrapSetter(pitchEG.rate1[1], markUnsaved)
  pitchEG.rate2[1] = wrapSetter(pitchEG.rate2[1], markUnsaved)
  pitchEG.rate3[1] = wrapSetter(pitchEG.rate3[1], markUnsaved)
  pitchEG.rate4[1] = wrapSetter(pitchEG.rate4[1], markUnsaved)
  pitchEG.level1[1] = wrapSetter(pitchEG.level1[1], markUnsaved)
  pitchEG.level2[1] = wrapSetter(pitchEG.level2[1], markUnsaved)
  pitchEG.level3[1] = wrapSetter(pitchEG.level3[1], markUnsaved)
  pitchEG.level4[1] = wrapSetter(pitchEG.level4[1], markUnsaved)

  // LFO
  lfo.speed[1] = wrapSetter(lfo.speed[1], markUnsaved)
  lfo.delay[1] = wrapSetter(lfo.delay[1], markUnsaved)
  lfo.pmDepth[1] = wrapSetter(lfo.pmDepth[1], markUnsaved)
  lfo.amDepth[1] = wrapSetter(lfo.amDepth[1], markUnsaved)
  lfo.keySync[1] = wrapSetter(lfo.keySync[1], markUnsaved)
  lfo.wave[1] = wrapSetter(lfo.wave[1], markUnsaved)
  lfo.pmSens[1] = wrapSetter(lfo.pmSens[1], markUnsaved)

  // Global
  global.algorithm[1] = wrapSetter(global.algorithm[1], markUnsaved)
  global.feedback[1] = wrapSetter(global.feedback[1], markUnsaved)
  global.oscSync[1] = wrapSetter(global.oscSync[1], markUnsaved)
  global.transpose[1] = wrapSetter(global.transpose[1], markUnsaved)
  global.ampModSens[1] = wrapSetter(global.ampModSens[1], markUnsaved)
  global.egBiasSens[1] = wrapSetter(global.egBiasSens[1], markUnsaved)
  global.name[1] = wrapSetter(global.name[1], markUnsaved)

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
    markSaved(false) // Reset unsaved changes when loading a new voice, don't show indicator
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
    markSaved() // Voice is now saved to the bank
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
    /** @type {[() => boolean, (v: boolean) => void]} Unsaved changes signal getter/setter tuple */
    hasUnsavedChanges: [hasUnsavedChanges, setHasUnsavedChanges],
    /** @type {[() => boolean, (v: boolean) => void]} Just saved signal getter/setter tuple */
    justSaved: [justSaved, setJustSaved],
    toJSON,
    toSysEx,
    downloadSyx,
    loadFromFile,
    loadFromVoice,
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
    markUnsaved,
    markSaved,
    discardChanges,
  }
}
