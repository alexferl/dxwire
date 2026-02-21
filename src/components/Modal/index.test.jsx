import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Modal } from "./index"

describe("Modal", () => {
  afterEach(() => {
    cleanup()
    // Reset body overflow after each test
    document.body.style.overflow = ""
  })

  it("renders with title", () => {
    render(() => (
      <Modal title="Test Title" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    ))
    expect(screen.getByText("Test Title")).toBeInTheDocument()
  })

  it("renders without title when not provided", () => {
    render(() => (
      <Modal onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    ))
    expect(document.querySelector(".modal-header")).not.toBeInTheDocument()
  })

  it("renders children content", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    ))
    expect(screen.getByText("Modal content")).toBeInTheDocument()
  })

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn()
    render(() => (
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    ))

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn()
    render(() => (
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    ))

    const closeButton = screen.getByLabelText("Close")
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn()
    render(() => (
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    ))

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.keyDown(overlay, { key: "Escape" })

    expect(onClose).toHaveBeenCalled()
  })

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn()
    render(() => (
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    ))

    const content = document.querySelector(".modal-content")
    fireEvent.click(content)

    expect(onClose).not.toHaveBeenCalled()
  })

  it("has correct ARIA attributes", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    ))

    const overlay = document.querySelector(".modal-overlay")
    expect(overlay).toHaveAttribute("role", "dialog")
    expect(overlay).toHaveAttribute("aria-modal", "true")
    expect(overlay).toHaveAttribute("tabIndex", "-1")
  })

  it("applies small size class", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}} size="small">
        <p>Content</p>
      </Modal>
    ))

    const content = document.querySelector(".modal-content")
    expect(content).toHaveClass("modal-content--small")
  })

  it("applies medium size class by default", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    ))

    const content = document.querySelector(".modal-content")
    expect(content).toHaveClass("modal-content--medium")
  })

  it("applies large size class", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}} size="large">
        <p>Content</p>
      </Modal>
    ))

    const content = document.querySelector(".modal-content")
    expect(content).toHaveClass("modal-content--large")
  })

  it("hides body overflow on mount", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    ))

    expect(document.body.style.overflow).toBe("hidden")
  })

  it("restores body overflow on unmount", () => {
    document.body.style.overflow = "auto"
    const { unmount } = render(() => (
      <Modal title="Test" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    ))

    unmount()
    expect(document.body.style.overflow).toBe("auto")
  })

  it("renders modal header with title and close button", () => {
    render(() => (
      <Modal title="My Modal" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    ))

    const header = document.querySelector(".modal-header")
    expect(header).toBeInTheDocument()
    expect(screen.getByText("My Modal")).toBeInTheDocument()
    expect(screen.getByLabelText("Close")).toBeInTheDocument()
  })

  it("renders modal body with content", () => {
    render(() => (
      <Modal title="Test" onClose={() => {}}>
        <div data-testid="modal-content">Custom Content</div>
      </Modal>
    ))

    const body = document.querySelector(".modal-body")
    expect(body).toBeInTheDocument()
    expect(screen.getByTestId("modal-content")).toBeInTheDocument()
  })

  it("does not call onClose when keys other than Escape are pressed", () => {
    const onClose = vi.fn()
    render(() => (
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    ))

    const overlay = document.querySelector(".modal-overlay")
    // Only Escape should trigger close
    fireEvent.keyDown(overlay, { key: "Enter" })
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(overlay, { key: "ArrowDown" })
    expect(onClose).not.toHaveBeenCalled()
  })
})
