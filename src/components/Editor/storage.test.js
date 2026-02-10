import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearBanks, clearSettings, loadBanks, loadSettings, saveBanks, saveSettings } from "./storage"

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

vi.stubGlobal("localStorage", localStorageMock)

// Mock DX7Bank
vi.mock("midiwire", () => ({
  DX7Bank: {
    fromJSON: vi.fn((data) => ({
      toJSON: () => data,
      voices: data.voices || [],
    })),
  },
}))

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("saveBanks", () => {
    it("saves banks to localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null)

      const banks = [
        {
          name: "Test Bank",
          bank: {
            toJSON: () => ({ name: "Test Bank", voices: [] }),
          },
        },
      ]

      // @ts-expect-error - mock bank type doesn't match DX7Bank
      saveBanks(banks)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dxwire",
        JSON.stringify({ banks: [{ name: "Test Bank", voices: [] }] }),
      )
    })

    it("merges with existing data", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ settings: { showADSR: false } }))

      const banks = [
        {
          name: "Bank 1",
          bank: {
            toJSON: () => ({ name: "Bank 1", voices: [{ name: "Voice 1" }] }),
          },
        },
      ]

      // @ts-expect-error - mock bank type doesn't match DX7Bank
      saveBanks(banks)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dxwire",
        JSON.stringify({
          settings: { showADSR: false },
          banks: [{ name: "Bank 1", voices: [{ name: "Voice 1" }] }],
        }),
      )
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage full")
      })

      /** @type {any[]} */
      const banks = [
        {
          name: "Test Bank",
          bank: {
            toJSON: () => ({ name: "Test Bank", voices: [] }),
          },
        },
      ]

      saveBanks(banks)

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe("loadBanks", () => {
    it("returns null when no banks stored", () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = loadBanks()

      expect(result).toBeNull()
    })

    it("returns null when data has no banks", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ settings: {} }))

      const result = loadBanks()

      expect(result).toBeNull()
    })

    it("returns null for invalid JSON", () => {
      localStorageMock.getItem.mockReturnValue("invalid json")

      const result = loadBanks()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })

    it("returns null for non-array banks", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ banks: { notAnArray: true } }))

      const result = loadBanks()

      expect(result).toBeNull()
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      const result = loadBanks()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe("clearBanks", () => {
    it("removes banks from localStorage while preserving other data", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ banks: [{ name: "Test", voices: [] }], settings: { showADSR: true } }),
      )

      clearBanks()

      expect(localStorageMock.setItem).toHaveBeenCalledWith("dxwire", JSON.stringify({ settings: { showADSR: true } }))
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue(null)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      clearBanks()

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe("loadSettings", () => {
    it("returns default settings when nothing stored", () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = loadSettings()

      expect(result).toEqual({
        showADSR: true,
        showValueInputs: true,
      })
    })

    it("returns merged settings from localStorage", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ settings: { showADSR: false } }))

      const result = loadSettings()

      expect(result.showADSR).toBe(false)
      expect(result.showValueInputs).toBe(true) // default preserved
    })

    it("returns defaults for invalid JSON", () => {
      localStorageMock.getItem.mockReturnValue("invalid json")

      const result = loadSettings()

      expect(result).toEqual({
        showADSR: true,
        showValueInputs: true,
      })
      expect(console.error).toHaveBeenCalled()
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      const result = loadSettings()

      expect(result).toEqual({
        showADSR: true,
        showValueInputs: true,
      })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe("saveSettings", () => {
    it("saves settings to localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null)

      saveSettings({ showADSR: false })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dxwire",
        JSON.stringify({ settings: { showADSR: false, showValueInputs: true } }),
      )
    })

    it("merges with existing settings and data", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ banks: [{ name: "Test", voices: [] }], settings: { showValueInputs: false } }),
      )

      saveSettings({ showADSR: false })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dxwire",
        JSON.stringify({
          banks: [{ name: "Test", voices: [] }],
          settings: { showADSR: false, showValueInputs: false },
        }),
      )
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue(null)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage full")
      })

      const result = saveSettings({ showADSR: false })

      expect(console.error).toHaveBeenCalled()
      // Returns the settings that were attempted to be saved
      expect(result).toEqual({
        showADSR: false,
        showValueInputs: true,
      })
    })
  })

  describe("clearSettings", () => {
    it("removes settings from localStorage while preserving other data", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ banks: [{ name: "Test", voices: [] }], settings: { showADSR: false } }),
      )

      clearSettings()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dxwire",
        JSON.stringify({ banks: [{ name: "Test", voices: [] }] }),
      )
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue(null)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      clearSettings()

      expect(console.error).toHaveBeenCalled()
    })
  })
})
