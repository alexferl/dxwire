import { cleanup } from "@solidjs/testing-library"
import * as matchers from "@testing-library/jest-dom/matchers"
import { afterEach, expect, vi } from "vitest"

expect.extend(matchers)

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal("localStorage", localStorageMock)

// Cleanup after each test case
afterEach(async () => {
  await cleanup()
  vi.clearAllMocks()
})
