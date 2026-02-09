/**
 * Calculates frequency display value based on DX7/Dexed algorithm.
 * Format examples: "1" (default), "1 + 1" (with detune), "0.5" (coarse 0), "2.02 + 1" (with fine and detune)
 * @param {number} mode - Frequency mode (0=ratio, 1=fixed)
 * @param {number} coarse - Coarse frequency value (0-31)
 * @param {number} fine - Fine frequency value (0-99)
 * @param {number} detune - Detune value (-7 to +7)
 * @returns {string} Formatted frequency display string
 */
export function calculateFrequency(mode, coarse, fine, detune) {
  if (mode) {
    // Fixed frequency mode
    // Coarse 0 = 1Hz, 1 = 10Hz, 2 = 100Hz, 3 = 1000Hz
    // Then cycles: 4 = 1Hz, 5 = 10Hz, etc.
    const cycle = coarse % 4
    const baseFreq = 10 ** cycle // 1, 10, 100, or 1000

    // DX7 fine values are exponential
    // fine 0 = 1.0, fine 1 = 1.02329, fine 99 = 9.77237
    // Formula: 10^(fine / 100)
    const fineMultiplier = 10 ** (fine / 100)
    const totalFreq = baseFreq * fineMultiplier

    // Format based on magnitude - show integers if no fine applied
    let display
    if (fine === 0) {
      display = `${Math.round(totalFreq)} Hz`
    } else if (totalFreq >= 100) {
      display = `${totalFreq.toFixed(2)} Hz`
    } else if (totalFreq >= 10) {
      display = `${totalFreq.toFixed(3)} Hz`
    } else {
      display = `${totalFreq.toFixed(5)} Hz`
    }

    // Detune adds +/- indicator
    if (detune !== 0) {
      const sign = detune > 0 ? "+" : "-"
      return `${display} ${sign} ${Math.abs(detune)}`
    }

    return display
  } else {
    // Ratio mode
    // Coarse 0 = 0.5, 1-31 = integer ratio
    let ratio = coarse === 0 ? 0.5 : coarse

    // Fine adds fractional adjustment (0-99 adds 0.00 to 0.99)
    if (fine > 0) {
      ratio = ratio + fine / 100
    }

    // Format base ratio
    // Show 2 decimals if fine > 0, otherwise show as integer (or 0.5 for coarse 0)
    let baseStr
    if (fine > 0) {
      baseStr = ratio.toFixed(2)
    } else if (coarse === 0) {
      baseStr = "0.5"
    } else {
      baseStr = String(coarse)
    }

    // Add detune indicator if not zero
    if (detune !== 0) {
      const sign = detune > 0 ? "+" : "-"
      return `f = ${baseStr} ${sign} ${Math.abs(detune)}`
    }

    return `f = ${baseStr}`
  }
}
