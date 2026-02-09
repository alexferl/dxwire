import { DX7Bank } from "midiwire"

const STORAGE_KEY = "dx7-banks"
const SETTINGS_KEY = "dx7-settings"

/**
 * Saves banks array to local storage.
 * @param {Array<{name: string, bank: DX7Bank}>} banks - Banks to save
 */
export function saveBanks(banks) {
  try {
    const serializable = banks.map((entry) => {
      const bankData = /** @type {{ voices: unknown }} */ (/** @type {object} */ (entry.bank.toJSON()))
      return {
        name: entry.name,
        voices: bankData.voices,
      }
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch (err) {
    console.error("Failed to save banks to localStorage:", err)
  }
}

/**
 * Loads banks from local storage.
 * @returns {Array<{name: string, bank: DX7Bank}>|null} Loaded banks or null if none stored
 */
export function loadBanks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return null

    return parsed.map((entry) => ({
      name: entry.name,
      bank: DX7Bank.fromJSON({ name: entry.name, voices: entry.voices }),
    }))
  } catch (err) {
    console.error("Failed to load banks from localStorage:", err)
    return null
  }
}

/**
 * Clears saved banks from local storage.
 */
export function clearBanks() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error("Failed to clear banks from localStorage:", err)
  }
}

/**
 * @typedef {Object} Settings
 * @property {boolean} showADSR - Show ADSR visualization in envelope graphs
 */

/** @type {Settings} */
const DEFAULT_SETTINGS = {
  showADSR: true,
  showValueInputs: true,
}

/**
 * Loads settings from local storage.
 * @returns {Settings} Loaded settings or defaults if none stored
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS

    const parsed = JSON.parse(stored)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch (err) {
    console.error("Failed to load settings from localStorage:", err)
    return DEFAULT_SETTINGS
  }
}

/**
 * Saves settings to local storage.
 * @param {Partial<Settings>} settings - Settings to save
 * @returns {Settings} Updated settings
 */
export function saveSettings(settings) {
  try {
    const current = loadSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error("Failed to save settings to localStorage:", err)
    return loadSettings()
  }
}

/**
 * Clears saved settings from local storage.
 */
export function clearSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch (err) {
    console.error("Failed to clear settings from localStorage:", err)
  }
}
