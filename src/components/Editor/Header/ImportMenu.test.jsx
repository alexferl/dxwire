import { fireEvent, render, screen } from "@solidjs/testing-library"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing components that use it
const mockUseVoice = vi.fn()
vi.mock("../context/VoiceContext", () => ({
  VoiceContext: {
    Provider: ({ children }) => children,
  },
  useVoice: () => mockUseVoice(),
}))

import { ImportMenu } from "./ImportMenu"

// Mock voice context
function createMockVoice() {
  return {
    loadFromFile: vi.fn().mockResolvedValue(undefined),
  }
}

describe("ImportMenu", () => {
  let originalCreateElement

  beforeEach(() => {
    vi.clearAllMocks()
    originalCreateElement = document.createElement
  })

  afterEach(() => {
    document.createElement = originalCreateElement
  })

  it("renders import menu button", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(() => <ImportMenu />)

    // Menu button should be rendered
    expect(document.querySelector(".menu-button")).toBeInTheDocument()
  })

  it("opens dropdown when clicked", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(() => <ImportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    expect(screen.getByText("Import Bank...")).toBeInTheDocument()
  })

  it("triggers file input when import menu item clicked", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    const clickSpy = vi.fn()

    document.createElement = vi.fn((tag) => {
      if (tag === "input") {
        const input = originalCreateElement.call(document, tag)
        input.click = clickSpy
        return input
      }
      return originalCreateElement.call(document, tag)
    })

    render(() => <ImportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const menuItem = screen.getByText("Import Bank...")
    fireEvent.click(menuItem)

    expect(document.createElement).toHaveBeenCalledWith("input")
    expect(clickSpy).toHaveBeenCalled()
  })

  it("loads file when file is selected", async () => {
    const mockVoice = createMockVoice()
    mockUseVoice.mockReturnValue(mockVoice)
    const mockFile = new File(["test"], "test.syx", { type: "application/octet-stream" })

    document.createElement = vi.fn((tag) => {
      if (tag === "input") {
        const input = originalCreateElement.call(document, tag)
        // Simulate file selection after click
        setTimeout(() => {
          if (input.onchange) {
            Object.defineProperty(input, "files", {
              value: [mockFile],
              writable: false,
            })
            input.onchange({ target: input })
          }
        }, 0)
        return input
      }
      return originalCreateElement.call(document, tag)
    })

    render(() => <ImportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const menuItem = screen.getByText("Import Bank...")
    fireEvent.click(menuItem)

    // Wait for async file loading
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockVoice.loadFromFile).toHaveBeenCalled()
  })

  it("shows alert when file import fails", async () => {
    const mockVoice = {
      loadFromFile: vi.fn().mockRejectedValue(new Error("Invalid file format")),
    }
    mockUseVoice.mockReturnValue(mockVoice)
    const mockFile = new File(["test"], "test.syx", { type: "application/octet-stream" })
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    document.createElement = vi.fn((tag) => {
      if (tag === "input") {
        const input = originalCreateElement.call(document, tag)
        setTimeout(() => {
          if (input.onchange) {
            Object.defineProperty(input, "files", {
              value: [mockFile],
              writable: false,
            })
            input.onchange({ target: input })
          }
        }, 0)
        return input
      }
      return originalCreateElement.call(document, tag)
    })

    render(() => <ImportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const menuItem = screen.getByText("Import Bank...")
    fireEvent.click(menuItem)

    // Wait for async file loading and alert
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(alertSpy).toHaveBeenCalledWith("Failed to import: Invalid file format")

    alertSpy.mockRestore()
  })

  it("does nothing when no file is selected", async () => {
    const mockVoice = createMockVoice()
    mockUseVoice.mockReturnValue(mockVoice)

    document.createElement = vi.fn((tag) => {
      if (tag === "input") {
        const input = originalCreateElement.call(document, tag)
        setTimeout(() => {
          if (input.onchange) {
            Object.defineProperty(input, "files", {
              value: [],
              writable: false,
            })
            input.onchange({ target: input })
          }
        }, 0)
        return input
      }
      return originalCreateElement.call(document, tag)
    })

    render(() => <ImportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const menuItem = screen.getByText("Import Bank...")
    fireEvent.click(menuItem)

    // Wait for async handling
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockVoice.loadFromFile).not.toHaveBeenCalled()
  })

  it("has aria-label for import icon", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(() => <ImportMenu />)

    expect(screen.getByLabelText("Import icon")).toBeInTheDocument()
  })
})
