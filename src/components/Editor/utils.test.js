import { describe, expect, it } from "vitest"
import { calculateFrequency } from "./utils"

describe("calculateFrequency", () => {
  describe("ratio mode (mode=0)", () => {
    it("returns f = 0.5 for coarse=0", () => {
      expect(calculateFrequency(0, 0, 0, 0)).toBe("f = 0.5")
    })

    it("returns f = integer for coarse 1-31", () => {
      expect(calculateFrequency(0, 1, 0, 0)).toBe("f = 1")
      expect(calculateFrequency(0, 10, 0, 0)).toBe("f = 10")
      expect(calculateFrequency(0, 31, 0, 0)).toBe("f = 31")
    })

    it("includes fine value as decimal", () => {
      expect(calculateFrequency(0, 1, 50, 0)).toBe("f = 1.50")
      expect(calculateFrequency(0, 2, 25, 0)).toBe("f = 2.25")
    })

    it("adds positive detune indicator", () => {
      expect(calculateFrequency(0, 1, 0, 3)).toBe("f = 1 + 3")
      expect(calculateFrequency(0, 1, 0, 7)).toBe("f = 1 + 7")
    })

    it("adds negative detune indicator", () => {
      expect(calculateFrequency(0, 1, 0, -3)).toBe("f = 1 - 3")
      expect(calculateFrequency(0, 1, 0, -7)).toBe("f = 1 - 7")
    })

    it("handles all combinations", () => {
      // Coarse 0, fine 50 = 0.5 + 0.5 = 1.00, with detune +3
      expect(calculateFrequency(0, 0, 50, 3)).toBe("f = 1.00 + 3")
      // Coarse 10 + fine 25 = 10.25, with detune -5
      expect(calculateFrequency(0, 10, 25, -5)).toBe("f = 10.25 - 5")
    })
  })

  describe("fixed mode (mode=1)", () => {
    it("returns Hz for coarse 0 (1Hz base)", () => {
      expect(calculateFrequency(1, 0, 0, 0)).toBe("1 Hz")
    })

    it("returns Hz for coarse 1 (10Hz base)", () => {
      expect(calculateFrequency(1, 1, 0, 0)).toBe("10 Hz")
    })

    it("returns Hz for coarse 2 (100Hz base)", () => {
      expect(calculateFrequency(1, 2, 0, 0)).toBe("100 Hz")
    })

    it("returns Hz for coarse 3 (1000Hz base)", () => {
      expect(calculateFrequency(1, 3, 0, 0)).toBe("1000 Hz")
    })

    it("cycles through frequencies (coarse 4 = 1Hz)", () => {
      expect(calculateFrequency(1, 4, 0, 0)).toBe("1 Hz")
      expect(calculateFrequency(1, 5, 0, 0)).toBe("10 Hz")
    })

    it("formats high frequencies with 2 decimals", () => {
      const result = calculateFrequency(1, 3, 50, 0)
      expect(result).toMatch(/^\d+\.\d{2} Hz$/)
    })

    it("formats medium frequencies with 3 decimals", () => {
      const result = calculateFrequency(1, 1, 50, 0)
      expect(result).toMatch(/^\d+\.\d{3} Hz$/)
    })

    it("formats low frequencies with 5 decimals", () => {
      const result = calculateFrequency(1, 0, 50, 0)
      expect(result).toMatch(/^\d+\.\d{5} Hz$/)
    })

    it("includes detune indicator", () => {
      expect(calculateFrequency(1, 0, 0, 5)).toMatch(/\+ 5$/)
      expect(calculateFrequency(1, 0, 0, -5)).toMatch(/- 5$/)
    })
  })
})
