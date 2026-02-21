import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library"
import { afterEach, describe, expect, it, vi } from "vitest"
import { UnsavedChangesDialog } from "./UnsavedChangesDialog"

describe("UnsavedChangesDialog", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the dialog", () => {
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={() => {}} />)
    expect(screen.getByText("Unsaved Changes")).toBeInTheDocument()
  })

  it("displays warning message", () => {
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={() => {}} />)
    expect(screen.getByText("You have unsaved changes to the current voice.")).toBeInTheDocument()
  })

  it("calls onSave when save button clicked", () => {
    const onSave = vi.fn()
    render(() => <UnsavedChangesDialog onSave={onSave} onDiscard={() => {}} onCancel={() => {}} />)

    const saveButton = screen.getByText("Save to Current Slot")
    fireEvent.click(saveButton)

    expect(onSave).toHaveBeenCalled()
  })

  it("calls onDiscard when discard button clicked", () => {
    const onDiscard = vi.fn()
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={onDiscard} onCancel={() => {}} />)

    const discardButton = screen.getByText("Discard Changes")
    fireEvent.click(discardButton)

    expect(onDiscard).toHaveBeenCalled()
  })

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn()
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={onCancel} />)

    const cancelButton = screen.getByText("Cancel")
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onCancel when close button clicked", () => {
    const onCancel = vi.fn()
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={onCancel} />)

    const closeButton = screen.getByLabelText("Close")
    fireEvent.click(closeButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onCancel when overlay clicked", () => {
    const onCancel = vi.fn()
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={onCancel} />)

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.click(overlay)

    expect(onCancel).toHaveBeenCalled()
  })

  it("does not call onCancel when dialog content clicked", () => {
    const onCancel = vi.fn()
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={onCancel} />)

    const content = document.querySelector(".modal-content")
    fireEvent.click(content)

    expect(onCancel).not.toHaveBeenCalled()
  })

  it("has three action buttons", () => {
    render(() => <UnsavedChangesDialog onSave={() => {}} onDiscard={() => {}} onCancel={() => {}} />)

    expect(screen.getByText("Save to Current Slot")).toBeInTheDocument()
    expect(screen.getByText("Discard Changes")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })
})
