import { fireEvent, render, screen } from "@testing-library/preact"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing components that use it
const mockUseVoice = vi.fn()
vi.mock("../context/VoiceContext", () => ({
  VoiceContext: {
    Provider: ({ children }) => children,
  },
  useVoice: () => mockUseVoice(),
}))

import { ExportMenu } from "./ExportMenu"

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:url")
global.URL.revokeObjectURL = vi.fn()

// Track anchor element clicks
let anchorClickSpy = null

// Mock voice context with bank
function createMockVoiceWithBank() {
  return {
    banks: {
      value: [
        {
          name: "Test Bank",
          bank: {
            toSysEx: () => new Uint8Array([0xf0, 0x43, 0x00, 0x09, 0xf7]),
            toJSON: () => ({ name: "Test Bank", voices: [] }),
          },
        },
      ],
    },
    currentBank: { value: 0 },
  }
}

// Mock voice context without bank
function createMockVoiceWithoutBank() {
  return {
    banks: {
      value: [{ name: "Test Bank", bank: null }],
    },
    currentBank: { value: 0 },
  }
}

describe("ExportMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Create a spy on the anchor element's click method
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = (tag) => {
      const el = originalCreateElement(tag)
      if (tag === "a") {
        anchorClickSpy = vi.spyOn(el, "click").mockImplementation(() => {})
      }
      return el
    }
  })

  it("renders export menu button", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithBank())
    render(<ExportMenu />)

    expect(document.querySelector(".menu-button")).toBeInTheDocument()
  })

  it("opens dropdown when clicked", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithBank())
    render(<ExportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    expect(screen.getByText("Export Bank (.syx)")).toBeInTheDocument()
    expect(screen.getByText("Export Bank (.json)")).toBeInTheDocument()
  })

  it("has disabled menu items when no bank is loaded", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithoutBank())
    render(<ExportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const syxItem = screen.getByText("Export Bank (.syx)")
    const jsonItem = screen.getByText("Export Bank (.json)")

    expect(syxItem).toBeDisabled()
    expect(jsonItem).toBeDisabled()
  })

  it("has enabled menu items when bank is loaded", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithBank())
    render(<ExportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const syxItem = screen.getByText("Export Bank (.syx)")
    const jsonItem = screen.getByText("Export Bank (.json)")

    expect(syxItem).not.toBeDisabled()
    expect(jsonItem).not.toBeDisabled()
  })

  it("triggers SysEx export when menu item clicked", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithBank())
    render(<ExportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const syxItem = screen.getByText("Export Bank (.syx)")
    fireEvent.click(syxItem)

    expect(anchorClickSpy).toHaveBeenCalled()
  })

  it("triggers JSON export when menu item clicked", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithBank())
    render(<ExportMenu />)

    const button = document.querySelector(".menu-button")
    fireEvent.click(button)

    const jsonItem = screen.getByText("Export Bank (.json)")
    fireEvent.click(jsonItem)

    expect(anchorClickSpy).toHaveBeenCalled()
  })

  it("has aria-label for export icon", () => {
    mockUseVoice.mockReturnValue(createMockVoiceWithBank())
    render(<ExportMenu />)

    expect(screen.getByLabelText("Export icon")).toBeInTheDocument()
  })
})
