import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing components that use it
const mockUseVoice = vi.fn()
vi.mock("../context/VoiceContext", () => ({
  VoiceContext: {
    Provider: ({ children }) => children,
  },
  useVoice: () => mockUseVoice(),
}))

// Mock MIDIContext
const mockUseMIDI = vi.fn()
vi.mock("../context/MIDIContext.jsx", () => ({
  MIDIContextProvider: ({ children }) => children,
  useMIDI: () => mockUseMIDI(),
}))

import { Header } from "./index"

// Mock midiwire
vi.mock("midiwire", () => ({
  DX7Bank: {
    fromSysEx: (_data) => ({
      getVoice: (i) => ({ name: `Voice ${i + 1}` }),
    }),
  },
}))

// Mock sub-components
vi.mock("./ExportMenu", () => ({
  ExportMenu: () => <div data-testid="export-menu">ExportMenu</div>,
}))

vi.mock("./ImportMenu", () => ({
  ImportMenu: () => <div data-testid="import-menu">ImportMenu</div>,
}))

vi.mock("../../MIDIDeviceSelector", () => ({
  MIDIDeviceSelector: () => <div data-testid="midi-selector">MIDIDeviceSelector</div>,
}))

// Create mock voice context with SolidJS signal format [getter, setter]
function createSignalMock(initialValue) {
  let value = initialValue
  const getter = () => value
  const setter = (newValue) => {
    value = newValue
  }
  return [getter, setter]
}

function createMockVoice(overrides = {}) {
  return {
    banks: createSignalMock(overrides.banks ?? [{ name: "Init Bank", bank: { toSysEx: () => [] } }]),
    currentBank: createSignalMock(overrides.currentBank ?? 0),
    currentVoiceIndex: createSignalMock(overrides.currentVoiceIndex ?? 0),
    global: { name: createSignalMock(overrides.voiceName ?? "Init Voice") },
    getBankNames: vi.fn().mockReturnValue(overrides.bankNames ?? ["Init Bank"]),
    getBankVoiceNames: vi.fn().mockReturnValue(
      overrides.voiceNames ??
        Array(32)
          .fill(null)
          .map((_, i) => `Voice ${i + 1}`),
    ),
    switchBank: vi.fn(),
    loadFromVoiceIndex: vi.fn(),
    deleteBank: vi.fn(),
    renameBank: vi.fn(),
    resetBanks: vi.fn(),
    initVoice: vi.fn(),
    renameVoice: vi.fn(),
    copyVoice: vi.fn(),
    toSysEx: vi.fn().mockReturnValue(new Uint8Array([0xf0, 0x43, 0x00, 0x00, 0x01, 0x1b, 0xf7])),
  }
}

// Create mock MIDI context
function createMockMIDI(overrides = {}) {
  return {
    midi: () =>
      overrides.midi ?? {
        system: {
          sendEx: vi.fn(),
        },
        connection: {
          on: vi.fn(),
          off: vi.fn(),
        },
      },
    hasOutputDevice: () => overrides.hasOutputDevice ?? false,
    hasInputDevice: () => overrides.hasInputDevice ?? false,
  }
}

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMIDI.mockReturnValue(createMockMIDI())
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
  })

  it("renders header with logo", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".header")).toBeInTheDocument()
    })
    expect(document.querySelector(".header-logo")).toHaveTextContent("DX7")
  })

  it("renders bank selector", async () => {
    mockUseVoice.mockReturnValue(createMockVoice({ bankNames: ["Bank 1", "Bank 2"] }))
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".bank-select-header")).toBeInTheDocument()
    })
  })

  it("renders voice selector", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".voice-select-header")).toBeInTheDocument()
    })
  })

  it("renders MIDI device selector", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(screen.getByTestId("midi-selector")).toBeInTheDocument()
    })
  })

  it("renders import and export menus", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(screen.getByTestId("import-menu")).toBeInTheDocument()
      expect(screen.getByTestId("export-menu")).toBeInTheDocument()
    })
  })

  it("renders help button", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".help-button")).toBeInTheDocument()
    })
  })

  it("opens help modal when help button clicked", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".help-button")).toBeInTheDocument()
    })

    const helpButton = document.querySelector(".help-button")
    fireEvent.click(helpButton)

    expect(screen.getByText("Help")).toBeInTheDocument()
  })

  it("closes help modal when onClose is called", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".help-button")).toBeInTheDocument()
    })

    const helpButton = document.querySelector(".help-button")
    fireEvent.click(helpButton)

    expect(screen.getByText("Help")).toBeInTheDocument()

    // Click overlay to close
    const overlay = document.querySelector(".modal-overlay")
    fireEvent.click(overlay)

    await waitFor(() => {
      expect(screen.queryByText("Help")).not.toBeInTheDocument()
    })
  })

  it("renders send buttons", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      const buttons = document.querySelectorAll(".header-send-btn")
      expect(buttons.length).toBe(3)
    })
  })

  it("renders bank management menu button", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      const menuButtons = document.querySelectorAll(".menu-button")
      expect(menuButtons.length).toBeGreaterThan(0)
    })
  })

  it("switches bank when bank selector changed", async () => {
    const mockVoice = createMockVoice({ bankNames: ["Bank 1", "Bank 2"] })
    mockUseVoice.mockReturnValue(mockVoice)
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".bank-select-header")).toBeInTheDocument()
    })

    const bankSelect = document.querySelector(".bank-select-header")
    fireEvent.change(bankSelect, { target: { value: "1" } })

    expect(mockVoice.switchBank).toHaveBeenCalledWith(1)
  })

  it("switches voice when voice selector changed", async () => {
    const mockVoice = createMockVoice()
    mockUseVoice.mockReturnValue(mockVoice)
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".voice-select-header")).toBeInTheDocument()
    })

    const voiceSelect = document.querySelector(".voice-select-header")
    fireEvent.change(voiceSelect, { target: { value: "5" } })

    expect(mockVoice.loadFromVoiceIndex).toHaveBeenCalledWith(5)
  })

  it("has correct CSS classes for layout", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(document.querySelector(".header")).toBeInTheDocument()
      expect(document.querySelector(".header-left")).toBeInTheDocument()
      expect(document.querySelector(".header-right")).toBeInTheDocument()
      expect(document.querySelector(".header-midi")).toBeInTheDocument()
      expect(document.querySelector(".header-buttons")).toBeInTheDocument()
    })
  })

  it("has aria-label for help icon", async () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Header />)

    await waitFor(() => {
      expect(screen.getByLabelText("Help icon")).toBeInTheDocument()
    })
  })

  describe("Bank Management Menu", () => {
    it("opens bank management menu when clicked", async () => {
      mockUseVoice.mockReturnValue(createMockVoice())
      render(<Header />)

      // Find bank manage menu button (second menu button)
      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])

      expect(screen.getByText("Rename Bank...")).toBeInTheDocument()
      expect(screen.getByText("Delete Bank")).toBeInTheDocument()
      expect(screen.getByText("Reset All Banks")).toBeInTheDocument()
    })

    it("opens rename bank dialog when menu item clicked", async () => {
      mockUseVoice.mockReturnValue(createMockVoice({ bankNames: ["Test Bank"] }))
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])

      fireEvent.click(screen.getByText("Rename Bank..."))

      expect(screen.getByText("Rename Bank")).toBeInTheDocument()
    })

    it("calls renameBank when rename dialog confirmed", async () => {
      const mockVoice = createMockVoice({ bankNames: ["Test Bank"] })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])
      fireEvent.click(screen.getByText("Rename Bank..."))

      // Fill in the input and submit
      const input = document.querySelector(".rename-input")
      fireEvent.input(input, { target: { value: "New Bank Name" } })

      fireEvent.click(document.querySelector(".rename-confirm"))

      expect(mockVoice.renameBank).toHaveBeenCalledWith(0, "New Bank Name")
    })

    it("has delete bank option enabled when multiple banks exist", async () => {
      mockUseVoice.mockReturnValue(
        createMockVoice({
          bankNames: ["Bank 1", "Bank 2"],
          banks: [
            { name: "Bank 1", bank: { toSysEx: () => [] } },
            { name: "Bank 2", bank: { toSysEx: () => [] } },
          ],
        }),
      )
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])

      const deleteItem = screen.getByText("Delete Bank").closest("button")
      expect(deleteItem).not.toBeDisabled()
    })

    it("disables delete bank when only one bank exists", async () => {
      mockUseVoice.mockReturnValue(createMockVoice({ bankNames: ["Only Bank"] }))
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])

      const deleteItem = screen.getByText("Delete Bank").closest("button")
      expect(deleteItem).toBeDisabled()
    })

    it("calls resetBanks when reset menu item clicked and confirmed", async () => {
      const mockVoice = createMockVoice()
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])
      fireEvent.click(screen.getByText("Reset All Banks"))

      expect(global.confirm).toHaveBeenCalled()
      expect(mockVoice.resetBanks).toHaveBeenCalled()
    })

    it("displays reset banks confirmation prompt", async () => {
      const mockVoice = createMockVoice()
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(0)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[0])

      expect(screen.getByText("Reset All Banks")).toBeInTheDocument()
    })
  })

  describe("Voice Management Menu", () => {
    it("opens voice management menu when clicked", async () => {
      mockUseVoice.mockReturnValue(createMockVoice())
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])

      expect(screen.getByText("Initialize Voice")).toBeInTheDocument()
      expect(screen.getByText("Rename Voice...")).toBeInTheDocument()
      expect(screen.getByText("Copy to Slot...")).toBeInTheDocument()
    })

    it("displays initialize voice menu item", async () => {
      mockUseVoice.mockReturnValue(createMockVoice({ voiceName: "Test Voice" }))
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])

      expect(screen.getByText("Initialize Voice")).toBeInTheDocument()
    })

    it("opens rename voice dialog when menu item clicked", async () => {
      mockUseVoice.mockReturnValue(createMockVoice({ voiceName: "Test Voice" }))
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])
      fireEvent.click(screen.getByText("Rename Voice..."))

      expect(screen.getByText("Rename Voice")).toBeInTheDocument()
    })

    it("calls renameVoice when rename dialog confirmed", async () => {
      const mockVoice = createMockVoice({ voiceName: "Old Voice Name" })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])
      fireEvent.click(screen.getByText("Rename Voice..."))

      // Fill in the input and submit
      const input = document.querySelector(".rename-input")
      fireEvent.input(input, { target: { value: "New Voice Name" } })

      fireEvent.click(document.querySelector(".rename-confirm"))

      expect(mockVoice.renameVoice).toHaveBeenCalledWith(0, "New Voice Name")
    })

    it("opens copy voice dialog when menu item clicked", async () => {
      mockUseVoice.mockReturnValue(createMockVoice())
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])
      fireEvent.click(screen.getByText("Copy to Slot..."))

      expect(screen.getByText("Copy Voice to Slot")).toBeInTheDocument()
    })

    it("calls copyVoice when copy dialog confirmed", async () => {
      const mockVoice = createMockVoice()
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])
      fireEvent.click(screen.getByText("Copy to Slot..."))

      // Select a slot (slot 6, index 5)
      const slotButtons = document.querySelectorAll(".slot-button")
      fireEvent.click(slotButtons[5])

      fireEvent.click(document.querySelector(".copy-confirm"))

      expect(mockVoice.copyVoice).toHaveBeenCalledWith(0, 5)
    })

    it("has initialize voice option available", async () => {
      mockUseVoice.mockReturnValue(createMockVoice({ voiceName: "Test Voice" }))
      render(<Header />)

      await waitFor(() => {
        const menuButtons = document.querySelectorAll(".menu-button")
        expect(menuButtons.length).toBeGreaterThan(1)
      })

      const menuButtons = document.querySelectorAll(".menu-button")
      fireEvent.click(menuButtons[1])

      const initItem = screen.getByText("Initialize Voice").closest("button")
      expect(initItem).not.toBeDisabled()
    })
  })
})
