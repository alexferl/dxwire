import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearBanks, loadBanks, saveBanks } from "./storage"

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
        "dx7-banks",
        JSON.stringify([{ name: "Test Bank", voices: [] }]),
      )
    })

    it("handles multiple banks", () => {
      const banks = [
        {
          name: "Bank 1",
          bank: {
            toJSON: () => ({ name: "Bank 1", voices: [{ name: "Voice 1" }] }),
          },
        },
        {
          name: "Bank 2",
          bank: {
            toJSON: () => ({ name: "Bank 2", voices: [{ name: "Voice 2" }] }),
          },
        },
      ]

      // @ts-expect-error - mock bank type doesn't match DX7Bank
      saveBanks(banks)

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
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

    it("returns null for invalid JSON", () => {
      localStorageMock.getItem.mockReturnValue("invalid json")

      const result = loadBanks()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })

    it("returns null for non-array data", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ notAnArray: true }))

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
    it("removes banks from localStorage", () => {
      clearBanks()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("dx7-banks")
    })

    it("handles localStorage errors gracefully", () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      clearBanks()

      expect(console.error).toHaveBeenCalled()
    })
  })
})
