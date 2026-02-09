import { fireEvent, render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { RidgedSwitch } from "./index"

describe("RidgedSwitch", () => {
  it("renders with default props", () => {
    render(<RidgedSwitch value={false} onChange={() => {}} />)
    const switchEl = screen.getByRole("switch")
    expect(switchEl).toBeInTheDocument()
    expect(switchEl).toHaveAttribute("aria-checked", "false")
  })

  it("renders in 'on' state when value is true", () => {
    render(<RidgedSwitch value={true} onChange={() => {}} />)
    const switchEl = screen.getByRole("switch")
    expect(switchEl).toHaveAttribute("aria-checked", "true")
    expect(switchEl).toHaveClass("on")
  })

  it("renders in 'off' state when value is false", () => {
    render(<RidgedSwitch value={false} onChange={() => {}} />)
    const switchEl = screen.getByRole("switch")
    expect(switchEl).toHaveAttribute("aria-checked", "false")
    expect(switchEl).toHaveClass("off")
  })

  it("calls onChange with toggled value when clicked", () => {
    const onChange = vi.fn()
    render(<RidgedSwitch value={false} onChange={onChange} />)
    const switchEl = screen.getByRole("switch")

    fireEvent.click(switchEl)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("calls onChange with false when clicked while on", () => {
    const onChange = vi.fn()
    render(<RidgedSwitch value={true} onChange={onChange} />)
    const switchEl = screen.getByRole("switch")

    fireEvent.click(switchEl)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it("toggles on Enter key press", () => {
    const onChange = vi.fn()
    render(<RidgedSwitch value={false} onChange={onChange} />)
    const switchEl = screen.getByRole("switch")

    fireEvent.keyDown(switchEl, { key: "Enter" })
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("toggles on Space key press", () => {
    const onChange = vi.fn()
    render(<RidgedSwitch value={false} onChange={onChange} />)
    const switchEl = screen.getByRole("switch")

    fireEvent.keyDown(switchEl, { key: " " })
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("toggles on ArrowRight key press", () => {
    const onChange = vi.fn()
    render(<RidgedSwitch value={false} onChange={onChange} />)
    const switchEl = screen.getByRole("switch")

    fireEvent.keyDown(switchEl, { key: "ArrowRight" })
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("toggles on ArrowLeft key press", () => {
    const onChange = vi.fn()
    render(<RidgedSwitch value={true} onChange={onChange} />)
    const switchEl = screen.getByRole("switch")

    fireEvent.keyDown(switchEl, { key: "ArrowLeft" })
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it("applies size classes correctly", () => {
    const { rerender } = render(<RidgedSwitch value={false} onChange={() => {}} size="sm" />)
    expect(screen.getByRole("switch")).toHaveClass("ridged-sm")

    rerender(<RidgedSwitch value={false} onChange={() => {}} size="md" />)
    expect(screen.getByRole("switch")).toHaveClass("ridged-md")

    rerender(<RidgedSwitch value={false} onChange={() => {}} size="lg" />)
    expect(screen.getByRole("switch")).toHaveClass("ridged-lg")

    rerender(<RidgedSwitch value={false} onChange={() => {}} size="xl" />)
    expect(screen.getByRole("switch")).toHaveClass("ridged-xl")
  })

  it("uses default 'md' size when size prop is not provided", () => {
    render(<RidgedSwitch value={false} onChange={() => {}} />)
    expect(screen.getByRole("switch")).toHaveClass("ridged-md")
  })

  it("sets aria-label from description prop", () => {
    render(<RidgedSwitch value={false} onChange={() => {}} description="Test switch description" />)
    expect(screen.getByRole("switch")).toHaveAttribute("aria-label", "Test switch description")
  })

  it("is focusable via tabIndex", () => {
    render(<RidgedSwitch value={false} onChange={() => {}} />)
    expect(screen.getByRole("switch")).toHaveAttribute("tabIndex", "0")
  })
})
