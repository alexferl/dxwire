import { fireEvent, render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { HelpModal } from "./HelpModal"

describe("HelpModal", () => {
  it("renders help modal with title", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(screen.getByText("Help")).toBeInTheDocument()
  })

  it("renders all section headings", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(screen.getByText("Bank & Voice Management")).toBeInTheDocument()
    expect(screen.getByText("MIDI")).toBeInTheDocument()
    expect(screen.getByText("Import / Export")).toBeInTheDocument()
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument()
  })

  it("has modal overlay with correct role", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(document.querySelector(".modal-overlay")).toHaveAttribute("role", "dialog")
    expect(document.querySelector(".modal-overlay")).toHaveAttribute("aria-modal", "true")
  })

  it("has close button", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(document.querySelector(".modal-close")).toBeInTheDocument()
  })

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    const closeButton = document.querySelector(".modal-close")
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    const content = document.querySelector(".modal-content")
    fireEvent.click(content)

    expect(onClose).not.toHaveBeenCalled()
  })

  it("calls onClose when Escape key is pressed on overlay", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.keyDown(overlay, { key: "Escape" })

    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose when Escape key is pressed on content", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    const content = document.querySelector(".modal-content")
    fireEvent.keyDown(content, { key: "Escape" })

    expect(onClose).toHaveBeenCalled()
  })

  it("has correct CSS classes", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(document.querySelector(".modal-overlay")).toBeInTheDocument()
    expect(document.querySelector(".modal-content")).toBeInTheDocument()
    expect(document.querySelector(".modal-header")).toBeInTheDocument()
    expect(document.querySelector(".modal-body")).toBeInTheDocument()
  })

  it("displays keyboard shortcuts info", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(screen.getByText(/Navigate menu items/)).toBeInTheDocument()
    expect(screen.getByText(/Close menus and dialogs/)).toBeInTheDocument()
  })

  it("displays voice name limit info", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(screen.getByText(/10 characters/)).toBeInTheDocument()
  })

  it("sets body overflow to hidden when mounted", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(document.body.style.overflow).toBe("hidden")
  })

  it("resets body overflow when unmounted", () => {
    const onClose = vi.fn()
    const { unmount } = render(<HelpModal onClose={onClose} />)

    unmount()

    expect(document.body.style.overflow).toBe("")
  })

  it("renders MIDI section with device info", () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)

    expect(screen.getByText(/MIDI output device/)).toBeInTheDocument()
    expect(screen.getByText(/Receive Bank/)).toBeInTheDocument()
    expect(screen.getByText(/Send Bank/)).toBeInTheDocument()
    expect(screen.getByText(/Send Voice/)).toBeInTheDocument()
  })
})
