import { cleanup } from "@solidjs/testing-library"
import * as matchers from "@testing-library/jest-dom/matchers"
import { afterEach, expect, vi } from "vitest"

expect.extend(matchers)

// Filter out SolidJS "computations created outside a `createRoot`" warnings in tests
// These warnings occur because vi.mock hoists imports and some Solid primitives
// are initialized before the test's render() creates a root context
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  const message = args[0]?.toString() || ""
  if (message.includes("computations created outside a `createRoot`")) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

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
