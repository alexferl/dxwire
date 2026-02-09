import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/preact"
import { afterEach, vi } from "vitest"

/**
 * Test setup file for Vitest.
 * Configures cleanup after each test case to prevent state leakage.
 */

/**
 * Mock localStorage for tests
 */
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal("localStorage", localStorageMock)

/**
 * Cleanup function that runs after each test.
 * Unmounts any rendered Preact components.
 */
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
