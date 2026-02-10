import { DX7Bank } from "midiwire"

const STORAGE_KEY = "dxwire"

/**
 * @typedef {Object} StorageData
 * @property {Array<{name: string, voices: unknown}>} [banks]
 * @property {Partial<Settings>} [settings]
 */

/**
 * @typedef {Object} Settings
 * @property {boolean} showADSR - Show ADSR visualization in envelope graphs
 * @property {boolean} showValueInputs - Show numeric input fields for parameter values
 */

/** @type {Settings} */
const DEFAULT_SETTINGS = {
  showADSR: true,
  showValueInputs: true,
}

/**
 * Loads the full storage data.
 * @returns {StorageData}
 */
function loadStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (err) {
    console.error("Failed to load from localStorage:", err)
    return {}
  }
}

/**
 * Saves the full storage data.
 * @param {StorageData} data
 */
function saveStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error("Failed to save to localStorage:", err)
  }
}

/**
 * Saves banks array to local storage.
 * @param {Array<{name: string, bank: DX7Bank}>} banks - Banks to save
 */
export function saveBanks(banks) {
  const serializable = banks.map((entry) => {
    const bankData = /** @type {{ voices: unknown }} */ (/** @type {object} */ (entry.bank.toJSON()))
    return {
      name: entry.name,
      voices: bankData.voices,
    }
  })
  const data = loadStorage()
  data.banks = serializable
  saveStorage(data)
}

/**
 * Loads banks from local storage.
 * @returns {Array<{name: string, bank: DX7Bank}>|null} Loaded banks or null if none stored
 */
export function loadBanks() {
  const data = loadStorage()
  if (!data.banks || !Array.isArray(data.banks)) return null

  return data.banks.map((entry) => ({
    name: entry.name,
    bank: DX7Bank.fromJSON({ name: entry.name, voices: entry.voices }),
  }))
}

/**
 * Clears saved banks from local storage.
 */
export function clearBanks() {
  const data = loadStorage()
  delete data.banks
  saveStorage(data)
}

/**
 * Loads settings from local storage.
 * @returns {Settings} Loaded settings or defaults if none stored
 */
export function loadSettings() {
  const data = loadStorage()
  return { ...DEFAULT_SETTINGS, ...data.settings }
}

/**
 * Saves settings to local storage.
 * @param {Partial<Settings>} settings - Settings to save
 * @returns {Settings} Updated settings
 */
export function saveSettings(settings) {
  const data = loadStorage()
  const updated = { ...DEFAULT_SETTINGS, ...data.settings, ...settings }
  data.settings = updated
  saveStorage(data)
  return updated
}

/**
 * Clears saved settings from local storage.
 */
export function clearSettings() {
  const data = loadStorage()
  delete data.settings
  saveStorage(data)
}
