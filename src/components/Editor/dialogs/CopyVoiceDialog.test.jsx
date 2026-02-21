import { fireEvent, render, screen } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"
import { CopyVoiceDialog } from "./CopyVoiceDialog.jsx"

describe("CopyVoiceDialog", () => {
  const mockVoiceNames = Array(32)
    .fill("")
    .map((_, i) => `Voice ${i + 1}`)

  it("renders with title", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={() => {}} />
    ))
    expect(screen.getByText("Copy Voice to Slot")).toBeInTheDocument()
  })

  it("renders 32 slot buttons", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={() => {}} />
    ))
    const buttons = document.querySelectorAll(".slot-button")
    expect(buttons.length).toBe(32)
  })

  it("renders slot numbers 1-32", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={() => {}} />
    ))
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("32")).toBeInTheDocument()
  })

  it("calls onCancel when overlay is clicked", () => {
    const onCancel = vi.fn()
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={onCancel} />
    ))

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.click(overlay)

    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = vi.fn()
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={onCancel} />
    ))

    fireEvent.click(screen.getByText("Cancel"))

    expect(onCancel).toHaveBeenCalled()
  })

  it("selects a slot when clicked", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={() => {}} />
    ))

    const buttons = document.querySelectorAll(".slot-button")
    fireEvent.click(buttons[5]) // Click slot 6

    expect(buttons[5]).toHaveClass("current")
  })

  it("calls onConfirm with selected slot index", () => {
    const onConfirm = vi.fn()
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={onConfirm} onCancel={() => {}} />
    ))

    const buttons = document.querySelectorAll(".slot-button")
    fireEvent.click(buttons[10]) // Select slot 11
    fireEvent.click(screen.getByText("Copy"))

    expect(onConfirm).toHaveBeenCalledWith(10)
  })

  it("disables Copy button when same slot is selected", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={5} onConfirm={() => {}} onCancel={() => {}} />
    ))

    const buttons = document.querySelectorAll(".slot-button")
    fireEvent.click(buttons[5]) // Click same as currentIndex

    const copyButton = document.querySelector(".copy-confirm")
    expect(copyButton).toBeDisabled()
  })

  it("marks current slot as source", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={7} onConfirm={() => {}} onCancel={() => {}} />
    ))

    const buttons = document.querySelectorAll(".slot-button")
    expect(buttons[7]).toHaveClass("source")
  })

  it("calls onCancel on Escape key", () => {
    const onCancel = vi.fn()
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={onCancel} />
    ))

    const overlay = document.querySelector(".modal-overlay")
    fireEvent.keyDown(overlay, { key: "Escape" })

    expect(onCancel).toHaveBeenCalled()
  })

  it("is an accessible dialog", () => {
    render(() => (
      <CopyVoiceDialog voiceNames={mockVoiceNames} currentIndex={0} onConfirm={() => {}} onCancel={() => {}} />
    ))

    const overlay = document.querySelector(".modal-overlay")
    expect(overlay).toHaveAttribute("role", "dialog")
    expect(overlay).toHaveAttribute("aria-modal", "true")
  })

  it("shows voice names in tooltips", () => {
    const names = Array(32)
      .fill("")
      .map((_, i) => `Voice Name ${i + 1}`)
    render(() => <CopyVoiceDialog voiceNames={names} currentIndex={0} onConfirm={() => {}} onCancel={() => {}} />)

    const buttons = document.querySelectorAll(".slot-button")
    expect(buttons[0]).toHaveAttribute("title", "Voice Name 1")
    expect(buttons[31]).toHaveAttribute("title", "Voice Name 32")
  })
})
