import { For } from "solid-js"
import { useVoice } from "../index"

// Algorithm visualization based on Dexed:
// https://github.com/asb2m10/dexed/blob/master/Source/AlgoDisplay.cpp

/**
 * @typedef {Object} OperatorLayout
 * @property {number} op - Operator number (1-6)
 * @property {number} x - Grid column (0-5)
 * @property {number} y - Grid row (0-3)
 * @property {number} link - Connection type: 0=down, 1=right, 2=right-join, 3=right+down, 4=right+left+down, 6=long-right, 7=left
 * @property {number} fb - Feedback type: 0=none, 1=short, 2=long, 3=medium, 4=left-loop
 * @property {number} type - 0=modulator, 1=carrier
 */

/** @type {Record<number, OperatorLayout[]>} */
const ALGORITHMS = {
  1: [
    { op: 6, x: 3, y: 0, link: 0, fb: 1, type: 0 },
    { op: 5, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  2: [
    { op: 6, x: 3, y: 0, link: 0, fb: 0, type: 0 },
    { op: 5, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 1, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  3: [
    { op: 6, x: 3, y: 1, link: 0, fb: 1, type: 0 },
    { op: 5, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 4, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 3, x: 2, y: 1, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  4: [
    { op: 6, x: 3, y: 1, link: 0, fb: 2, type: 0 },
    { op: 5, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 4, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 3, x: 2, y: 1, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  5: [
    { op: 6, x: 4, y: 2, link: 0, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  6: [
    { op: 6, x: 4, y: 2, link: 0, fb: 3, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  7: [
    { op: 6, x: 4, y: 1, link: 0, fb: 1, type: 0 },
    { op: 5, x: 4, y: 2, link: 7, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  8: [
    { op: 6, x: 4, y: 1, link: 0, fb: 0, type: 0 },
    { op: 5, x: 4, y: 2, link: 7, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 4, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  9: [
    { op: 6, x: 4, y: 1, link: 0, fb: 0, type: 0 },
    { op: 5, x: 4, y: 2, link: 7, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 1, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  10: [
    { op: 6, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 5, x: 1, y: 2, link: 1, fb: 0, type: 0 },
    { op: 4, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 3, y: 1, link: 0, fb: 1, type: 0 },
    { op: 2, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 3, y: 3, link: 2, fb: 0, type: 1 },
  ],
  11: [
    { op: 6, x: 2, y: 2, link: 0, fb: 1, type: 0 },
    { op: 5, x: 1, y: 2, link: 1, fb: 0, type: 0 },
    { op: 4, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 2, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 3, y: 3, link: 2, fb: 0, type: 1 },
  ],
  12: [
    { op: 6, x: 3, y: 2, link: 7, fb: 0, type: 0 },
    { op: 5, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 4, x: 1, y: 2, link: 1, fb: 0, type: 0 },
    { op: 3, x: 2, y: 3, link: 6, fb: 0, type: 1 },
    { op: 2, x: 4, y: 2, link: 0, fb: 1, type: 0 },
    { op: 1, x: 4, y: 3, link: 2, fb: 0, type: 1 },
  ],
  13: [
    { op: 6, x: 3, y: 2, link: 7, fb: 1, type: 0 },
    { op: 5, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 4, x: 1, y: 2, link: 1, fb: 0, type: 0 },
    { op: 3, x: 2, y: 3, link: 6, fb: 0, type: 1 },
    { op: 2, x: 4, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 4, y: 3, link: 2, fb: 0, type: 1 },
  ],
  14: [
    { op: 6, x: 4, y: 1, link: 7, fb: 1, type: 0 },
    { op: 5, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  15: [
    { op: 6, x: 4, y: 1, link: 7, fb: 0, type: 0 },
    { op: 5, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 2, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 4, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  16: [
    { op: 6, x: 4, y: 1, link: 0, fb: 1, type: 0 },
    { op: 5, x: 4, y: 2, link: 7, fb: 0, type: 0 },
    { op: 4, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 2, link: 1, fb: 0, type: 0 },
    { op: 1, x: 3, y: 3, link: 0, fb: 0, type: 1 },
  ],
  17: [
    { op: 6, x: 4, y: 1, link: 0, fb: 0, type: 0 },
    { op: 5, x: 4, y: 2, link: 7, fb: 0, type: 0 },
    { op: 4, x: 3, y: 1, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 2, link: 1, fb: 4, type: 0 },
    { op: 1, x: 3, y: 3, link: 0, fb: 0, type: 1 },
  ],
  18: [
    { op: 6, x: 4, y: 0, link: 0, fb: 0, type: 0 },
    { op: 5, x: 4, y: 1, link: 0, fb: 0, type: 0 },
    { op: 4, x: 4, y: 2, link: 7, fb: 0, type: 0 },
    { op: 3, x: 3, y: 2, link: 0, fb: 4, type: 0 },
    { op: 2, x: 2, y: 2, link: 1, fb: 0, type: 0 },
    { op: 1, x: 3, y: 3, link: 0, fb: 0, type: 1 },
  ],
  19: [
    { op: 6, x: 3, y: 2, link: 3, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 1, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  20: [
    { op: 6, x: 4, y: 2, link: 0, fb: 0, type: 0 },
    { op: 5, x: 3, y: 2, link: 1, fb: 0, type: 0 },
    { op: 4, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 3, x: 1, y: 2, link: 3, fb: 1, type: 0 },
    { op: 2, x: 2, y: 3, link: 6, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  21: [
    { op: 6, x: 3, y: 2, link: 3, fb: 0, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 1, y: 2, link: 3, fb: 1, type: 0 },
    { op: 2, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  22: [
    { op: 6, x: 3, y: 2, link: 4, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 1, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  23: [
    { op: 6, x: 3, y: 2, link: 3, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  24: [
    { op: 6, x: 3, y: 2, link: 4, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 1, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 0, y: 3, link: 1, fb: 0, type: 1 },
  ],
  25: [
    { op: 6, x: 3, y: 2, link: 3, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 1, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 0, y: 3, link: 1, fb: 0, type: 1 },
  ],
  26: [
    { op: 6, x: 4, y: 2, link: 0, fb: 1, type: 0 },
    { op: 5, x: 3, y: 2, link: 1, fb: 0, type: 0 },
    { op: 4, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 3, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 2, x: 2, y: 3, link: 6, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  27: [
    { op: 6, x: 4, y: 2, link: 0, fb: 0, type: 0 },
    { op: 5, x: 3, y: 2, link: 1, fb: 0, type: 0 },
    { op: 4, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 3, x: 2, y: 2, link: 0, fb: 1, type: 0 },
    { op: 2, x: 2, y: 3, link: 6, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  28: [
    { op: 6, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 5, x: 3, y: 1, link: 0, fb: 1, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 2, y: 2, link: 0, fb: 0, type: 0 },
    { op: 1, x: 2, y: 3, link: 1, fb: 0, type: 1 },
  ],
  29: [
    { op: 6, x: 4, y: 2, link: 0, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  30: [
    { op: 6, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 5, x: 3, y: 1, link: 0, fb: 1, type: 0 },
    { op: 4, x: 3, y: 2, link: 0, fb: 0, type: 0 },
    { op: 3, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 1, y: 3, link: 1, fb: 0, type: 1 },
  ],
  31: [
    { op: 6, x: 4, y: 2, link: 0, fb: 1, type: 0 },
    { op: 5, x: 4, y: 3, link: 2, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 1, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 0, y: 3, link: 1, fb: 0, type: 1 },
  ],
  32: [
    { op: 6, x: 5, y: 3, link: 2, fb: 1, type: 1 },
    { op: 5, x: 4, y: 3, link: 1, fb: 0, type: 1 },
    { op: 4, x: 3, y: 3, link: 1, fb: 0, type: 1 },
    { op: 3, x: 2, y: 3, link: 1, fb: 0, type: 1 },
    { op: 2, x: 1, y: 3, link: 1, fb: 0, type: 1 },
    { op: 1, x: 0, y: 3, link: 1, fb: 0, type: 1 },
  ],
}

/**
 * Generates SVG path data for operator connection lines.
 * @param {OperatorLayout} op - Operator layout data
 * @param {number} [gridCellSize] - Size of each grid cell (default: 100/6)
 * @returns {string[]} Array of SVG path strings
 */
function drawLink(op, gridCellSize = 100 / 6) {
  const { x, y, link } = op
  const cellW = gridCellSize
  const cellH = 100 / 4

  const cx = (x + 0.5) * cellW
  const cy = (y + 0.4) * cellH
  const bottom = (y + 1.2) * cellH
  const right = (x + 1) * cellW

  const paths = []

  switch (link) {
    case 0: // Line Down
      paths.push(`M ${cx} ${cy - 1} L ${cx} ${bottom}`)
      break
    case 1: // Arrow to Right
      paths.push(`M ${cx} ${cy - 6} L ${cx} ${cy + 9}`)
      paths.push(`M ${cx} ${cy + 9} L ${right + cellW * 0.5} ${cy + 9}`)
      break
    case 2: // Arrow to Right join
      paths.push(`M ${cx} ${cy - 6} L ${cx} ${cy + 9.5}`)
      break
    case 3: // Arrow to Right and Down
      paths.push(`M ${cx} ${cy - 6} L ${cx} ${bottom}`)
      paths.push(`M ${cx} ${cy + 9} L ${right + cellW * 0.5} ${cy + 9}`)
      paths.push(`M ${right + cellW * 0.5} ${cy + 8.5} L ${right + cellW * 0.5} ${bottom}`)
      break
    case 4: // Arrow to Right+Left and Down
      paths.push(`M ${cx} ${cy - 6} L ${cx} ${bottom}`)
      paths.push(`M ${cx} ${cy + 9} L ${right + cellW * 0.5} ${cy + 9}`)
      paths.push(`M ${right + cellW * 0.5} ${cy + 8.5} L ${right + cellW * 0.5} ${bottom}`)
      paths.push(`M ${cx - cellW} ${cy + 9} L ${cx} ${cy + 9}`)
      paths.push(`M ${cx - cellW} ${cy + 8.5} L ${cx - cellW} ${bottom}`)
      break
    case 6: // Long Arrow to Right (2 cells)
      paths.push(`M ${cx} ${cy - 6} L ${cx} ${cy + 9}`)
      paths.push(`M ${cx} ${cy + 9} L ${right + cellW * 1.5} ${cy + 9}`)
      break
    case 7: // Arrow to Left
      paths.push(`M ${cx} ${cy - 6} L ${cx} ${cy + 9.5}`)
      paths.push(`M ${cx - cellW} ${cy + 9} L ${cx + 0.5} ${cy + 9}`)
      break
  }

  return paths
}

/**
 * Generates SVG path data for feedback loops.
 * @param {OperatorLayout} op - Operator layout data
 * @param {number} [gridCellSize] - Size of each grid cell (default: 100/6)
 * @returns {string[]} Array of SVG path strings
 */
function drawFeedback(op, gridCellSize = 100 / 6) {
  const { x, y, fb } = op
  if (fb === 0) return []

  const cellW = gridCellSize
  const cellH = 100 / 4

  const cx = (x + 0.5) * cellW
  const cy = (y + 0.5) * cellH
  const top = y * cellH
  const loopTop = Math.max(2, top - 4.0)

  const paths = []

  switch (fb) {
    case 1: // Short loop
      paths.push(`
        M ${cx} ${top + 7.0}
        L ${cx} ${loopTop}
        L ${cx + 8.5} ${loopTop}
        L ${cx + 8.5} ${cy - 2.0}
        L ${cx} ${cy - 2.0}
      `)
      break
    case 2: // Long loop (3 cells down)
      paths.push(`
        M ${cx} ${top + 6.0}
        L ${cx} ${top - 3.5}
        L ${cx + 9} ${top - 3.5}
        L ${cx + 9} ${top + cellH * 2.5}
        L ${cx} ${top + cellH * 2.5}
      `)
      break
    case 3: // Medium loop (2 cells down)
      paths.push(`
        M ${cx} ${top + 3.0}
        L ${cx} ${top - 5.5}
        L ${cx + 9} ${top - 5.5}
        L ${cx + 9} ${top + cellH * 1.5}
        L ${cx} ${top + cellH * 1.5}
      `)
      break
    case 4: // Left loop
      paths.push(`
        M ${cx} ${top + 3.0}
        L ${cx} ${top - 5.0}
        L ${cx - 8} ${top - 5.0}
        L ${cx - 8} ${cy - 2.0}
        L ${cx} ${cy - 2.0}
      `)
      break
  }

  return paths
}

/**
 * Algorithm visualization component showing the 32 DX7 FM algorithms.
 * Displays operators in their configured positions with connection lines.
 * @returns {import("solid-js").JSX.Element}
 */
export function Algorithm() {
  const voice = useVoice()
  const algorithmId = () => voice.global.algorithm[0]()
  const layout = () => ALGORITHMS[algorithmId()] || ALGORITHMS[1]

  /**
   * Checks if an operator is enabled.
   * @param {number} opNum - Operator number (1-6)
   * @returns {boolean}
   */
  const isOperatorEnabled = (opNum) => {
    const opIndex = opNum - 1
    return voice.operators[opIndex]?.enabled?.[0]?.() ?? true
  }

  return (
    <div class="algo-container">
      <div class="algo-number">{algorithmId()}</div>
      <div class="algorithm-grid">
        <For each={layout()}>
          {(op) => (
            <div
              class={`algorithm-grid-item ${op.type === 1 ? "carrier" : "modulator"} ${!isOperatorEnabled(op.op) ? "disabled" : ""}`}
              style={{
                "grid-column": op.x + 1,
                "grid-row": op.y + 1,
              }}
            >
              {op.op}
            </div>
          )}
        </For>
      </div>

      <svg
        class="connections-overlay"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Algorithm connections"
      >
        <title>Algorithm connections</title>
        <defs>
          <marker id="arrowhead" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto">
            <polygon points="0 0, 3 1.5, 0 3" fill="#4dd0e1" />
          </marker>
        </defs>

        <For each={layout()}>
          {(op) => (
            <>
              <For each={drawLink(op)}>
                {(path) => (
                  <path
                    d={path}
                    stroke={isOperatorEnabled(op.op) ? "#4dd0e1" : "#666"}
                    stroke-width="1.5"
                    fill="none"
                    opacity="0.8"
                  />
                )}
              </For>

              <For each={drawFeedback(op)}>
                {(path) => (
                  <path
                    d={path}
                    stroke={isOperatorEnabled(op.op) ? "#4dd0e1" : "#666"}
                    stroke-width="1.5"
                    fill="none"
                    opacity="0.8"
                  />
                )}
              </For>
            </>
          )}
        </For>
      </svg>
    </div>
  )
}
