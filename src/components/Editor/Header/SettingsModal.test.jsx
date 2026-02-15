import { fireEvent, render, screen } from "@solidjs/testing-library"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { VoiceContext } from "../context/VoiceContext"
import { SettingsModal } from "./SettingsModal"

// Reset body overflow before each test
beforeEach(() => {
  document.body.style.overflow = ""
})

// Mock voice context with SolidJS signal format
function createSignalMock(initialValue) {
  let value = initialValue
  const getter = () => value
  const setter = (newValue) => {
    value = newValue
  }
  return [getter, setter]
}

function createMockVoice(settings = { showADSR: true }) {
  return {
    settings: createSignalMock(settings),
    updateSetting: vi.fn(),
  }
}

describe("SettingsModal", () => {
  it("renders settings modal with title", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders envelope display section", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText("Envelope Display")).toBeInTheDocument()
  })

  it("renders input controls section", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText("Input Controls")).toBeInTheDocument()
  })

  it("renders ADSR checkbox label", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText(/Show ADSR visualization/)).toBeInTheDocument()
  })

  it("renders description text", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText(/When enabled, envelope graphs display/)).toBeInTheDocument()
  })

  it("renders value inputs checkbox label", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText(/Show value input fields on knobs and sliders/)).toBeInTheDocument()
  })

  it("renders value inputs description text", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(screen.getByText(/When enabled, knobs and sliders display numeric input fields/)).toBeInTheDocument()
  })

  it("has ADSR checkbox checked when showADSR is true", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice({ showADSR: true, showValueInputs: true })
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes[0]).toBeChecked()
  })

  it("has ADSR checkbox unchecked when showADSR is false", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice({ showADSR: false, showValueInputs: true })
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes[0]).not.toBeChecked()
  })

  it("calls updateSetting when ADSR checkbox is clicked", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice({ showADSR: true, showValueInputs: true })
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[0])

    expect(mockVoice.updateSetting).toHaveBeenCalledWith("showADSR", false)
  })

  it("has value inputs checkbox checked when showValueInputs is true", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice({ showADSR: true, showValueInputs: true })
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes[1]).toBeChecked()
  })

  it("has value inputs checkbox unchecked when showValueInputs is false", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice({ showADSR: true, showValueInputs: false })
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes[1]).not.toBeChecked()
  })

  it("calls updateSetting when value inputs checkbox is clicked", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice({ showADSR: true, showValueInputs: true })
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[1])

    expect(mockVoice.updateSetting).toHaveBeenCalledWith("showValueInputs", false)
  })

  it("has modal overlay with correct role", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".modal-overlay")).toHaveAttribute("role", "dialog")
    expect(document.querySelector(".modal-overlay")).toHaveAttribute("aria-modal", "true")
  })

  it("has close button", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".modal-close")).toBeInTheDocument()
  })

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const closeButton = document.querySelector(".modal-close")
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const content = document.querySelector(".modal-content")
    fireEvent.click(content)

    expect(onClose).not.toHaveBeenCalled()
  })

  it("calls onClose when Escape key is pressed on overlay", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.keyDown(overlay, { key: "Escape" })

    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose when Escape key is pressed on content", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    const content = document.querySelector(".modal-content")
    fireEvent.keyDown(content, { key: "Escape" })

    expect(onClose).toHaveBeenCalled()
  })

  it("has correct CSS classes", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(document.querySelector(".modal-overlay")).toBeInTheDocument()
    expect(document.querySelector(".modal-content")).toBeInTheDocument()
    expect(document.querySelector(".modal-header")).toBeInTheDocument()
    expect(document.querySelector(".modal-body")).toBeInTheDocument()
    expect(document.querySelector(".settings-section")).toBeInTheDocument()
    expect(document.querySelector(".settings-checkbox")).toBeInTheDocument()
  })

  it("sets body overflow to hidden when mounted", () => {
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    expect(document.body.style.overflow).toBe("hidden")
  })

  it("has body overflow set when mounted", () => {
    // Set a known initial value
    document.body.style.overflow = "scroll"
    const onClose = vi.fn()
    const mockVoice = createMockVoice()
    render(
      <VoiceContext.Provider value={mockVoice}>
        <SettingsModal onClose={onClose} />
      </VoiceContext.Provider>,
    )

    // Verify that the modal sets overflow to hidden when mounted
    expect(document.body.style.overflow).toBe("hidden")
  })
})
