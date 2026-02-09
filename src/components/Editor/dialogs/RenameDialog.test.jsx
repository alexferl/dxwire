import { fireEvent, render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { RenameDialog } from "./RenameDialog"

describe("RenameDialog", () => {
  it("renders with title", () => {
    render(<RenameDialog title="Rename Bank" currentName="My Bank" onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.getByText("Rename Bank")).toBeInTheDocument()
  })

  it("renders with current name in input", () => {
    render(<RenameDialog title="Rename Voice" currentName="Init Voice" onConfirm={() => {}} onCancel={() => {}} />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("Init Voice")
  })

  it("calls onCancel when overlay is clicked", () => {
    const onCancel = vi.fn()
    render(<RenameDialog title="Rename" currentName="Test" onConfirm={() => {}} onCancel={onCancel} />)

    const overlay = document.querySelector(".slot-dialog-overlay")
    fireEvent.click(overlay)

    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = vi.fn()
    render(<RenameDialog title="Rename" currentName="Test" onConfirm={() => {}} onCancel={onCancel} />)

    fireEvent.click(screen.getByText("Cancel"))

    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onConfirm with new name when Rename button is clicked", () => {
    const onConfirm = vi.fn()
    render(<RenameDialog title="Rename" currentName="Old Name" onConfirm={onConfirm} onCancel={() => {}} />)

    const input = screen.getByRole("textbox")
    fireEvent.input(input, { target: { value: "New Name" } })
    fireEvent.click(document.querySelector(".rename-confirm"))

    expect(onConfirm).toHaveBeenCalledWith("New Name")
  })

  it("does not call onConfirm if name is empty", () => {
    const onConfirm = vi.fn()
    render(<RenameDialog title="Rename" currentName="Old Name" onConfirm={onConfirm} onCancel={() => {}} />)

    const input = screen.getByRole("textbox")
    fireEvent.input(input, { target: { value: "   " } })
    fireEvent.click(document.querySelector(".rename-confirm"))

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("calls onCancel on Escape key", () => {
    const onCancel = vi.fn()
    render(<RenameDialog title="Rename" currentName="Test" onConfirm={() => {}} onCancel={onCancel} />)

    const overlay = document.querySelector(".slot-dialog-overlay")
    fireEvent.keyDown(overlay, { key: "Escape" })

    expect(onCancel).toHaveBeenCalled()
  })

  it("has maxLength on input", () => {
    render(<RenameDialog title="Rename" currentName="Test" onConfirm={() => {}} onCancel={() => {}} />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("maxLength", "10")
  })

  it("is an accessible dialog", () => {
    render(<RenameDialog title="Rename" currentName="Test" onConfirm={() => {}} onCancel={() => {}} />)

    const overlay = document.querySelector(".slot-dialog-overlay")
    expect(overlay).toHaveAttribute("role", "dialog")
    expect(overlay).toHaveAttribute("aria-modal", "true")
  })

  it("does not propagate click from dialog to overlay", () => {
    const onCancel = vi.fn()
    render(<RenameDialog title="Rename" currentName="Test" onConfirm={() => {}} onCancel={onCancel} />)

    const dialog = document.querySelector(".slot-dialog")
    fireEvent.click(dialog)

    expect(onCancel).not.toHaveBeenCalled()
  })
})
