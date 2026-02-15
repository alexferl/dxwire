import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"
import { Knob } from "./index"

describe("Knob", () => {
  it("renders with required props", () => {
    render(<Knob title="Volume" value={50} onChange={() => {}} />)
    expect(screen.getByLabelText("Volume knob")).toBeInTheDocument()
  })

  it("renders the title", () => {
    render(<Knob title="Volume" value={50} onChange={() => {}} />)
    expect(screen.getByText("Volume")).toBeInTheDocument()
  })

  it("has correct aria attributes", () => {
    render(<Knob title="Volume" value={50} onChange={() => {}} min={0} max={100} />)
    const knob = screen.getByRole("slider")
    expect(knob).toHaveAttribute("aria-valuemin", "0")
    expect(knob).toHaveAttribute("aria-valuemax", "100")
    expect(knob).toHaveAttribute("aria-valuenow", "50")
  })

  it("is focusable", () => {
    render(<Knob title="Volume" value={50} onChange={() => {}} />)
    expect(screen.getByRole("slider")).toHaveAttribute("tabIndex", "0")
  })

  describe("value input", () => {
    it("does not show value input by default", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} />)
      expect(document.querySelector(".knob-input")).not.toBeInTheDocument()
    })

    it("shows value input when showValueInput is true", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} showValueInput={true} />)
      expect(document.querySelector(".knob-input")).toBeInTheDocument()
    })

    it("displays formatted value when formatValue is provided", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} showValueInput={true} formatValue={(v) => `${v}%`} />)
      const input = document.querySelector(".knob-input")
      expect(input).toHaveValue("50%")
    })

    it("does not call onChange when parseValue returns null", () => {
      const onChange = vi.fn()
      render(<Knob title="Freq" value={1000} onChange={onChange} showValueInput={true} parseValue={() => null} />)
      const input = document.querySelector(".knob-input")
      fireEvent.input(input, { target: { value: "invalid" } })
      expect(onChange).not.toHaveBeenCalled()
    })

    it("does not call onChange when value is out of range", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} showValueInput={true} />)
      const input = document.querySelector(".knob-input")
      fireEvent.input(input, { target: { value: "150" } })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe("keyboard interaction", () => {
    it("increments value on ArrowUp", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowUp" })
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it("increments value on ArrowRight", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowRight" })
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it("decrements value on ArrowDown", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowDown" })
      expect(onChange).toHaveBeenCalledWith(49)
    })

    it("decrements value on ArrowLeft", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowLeft" })
      expect(onChange).toHaveBeenCalledWith(49)
    })

    it("does not exceed max value", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={100} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowUp" })
      expect(onChange).not.toHaveBeenCalled()
    })

    it("does not go below min value", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={0} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowDown" })
      expect(onChange).not.toHaveBeenCalled()
    })

    it("stops key repeat on keyUp", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.keyDown(knob, { key: "ArrowUp" })
      fireEvent.keyUp(knob, { key: "ArrowUp" })

      // Should only be called once, not repeatedly
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  describe("mouse drag interaction", () => {
    it("calls onChange when dragging up", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.mouseDown(knob, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 50 })

      expect(onChange).toHaveBeenCalled()
    })

    it("calls onChange when dragging down", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const knob = screen.getByRole("slider")

      fireEvent.mouseDown(knob, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 150 })

      expect(onChange).toHaveBeenCalled()
    })

    it("does not call onChange when mouse is not down", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} />)

      fireEvent.mouseMove(window, { clientY: 50 })

      expect(onChange).not.toHaveBeenCalled()
    })

    it("respects invert prop", () => {
      const onChange = vi.fn()
      render(<Knob title="Volume" value={50} onChange={onChange} min={0} max={100} invert={true} />)
      const knob = screen.getByRole("slider")

      // When inverted, dragging down should increase value
      fireEvent.mouseDown(knob, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 150 })

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe("hover popover", () => {
    it("shows popover on hover when showValueInput is false", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} />)
      const knob = screen.getByRole("slider")

      fireEvent.mouseEnter(knob)
      expect(document.querySelector(".knob-popover")).toBeInTheDocument()

      fireEvent.mouseLeave(knob)
      expect(document.querySelector(".knob-popover")).not.toBeInTheDocument()
    })

    it("does not show hover popover when showValueInput is true", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} showValueInput={true} />)
      const knob = screen.getByRole("slider")

      fireEvent.mouseEnter(knob)
      expect(document.querySelector(".knob-popover")).not.toBeInTheDocument()
    })

    it("shows formatted value in hover popover", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} formatValue={(v) => `${v}%`} />)
      const knob = screen.getByRole("slider")

      fireEvent.mouseEnter(knob)
      const popover = document.querySelector(".knob-popover")
      expect(popover).toHaveTextContent("50%")
    })
  })

  describe("size variants", () => {
    it("applies size classes correctly", () => {
      const { unmount } = render(<Knob title="Volume" value={50} onChange={() => {}} size="sm" />)
      expect(screen.getByRole("slider")).toHaveClass("knob-sm")
      unmount()

      render(<Knob title="Volume" value={50} onChange={() => {}} size="md" />)
      expect(screen.getByRole("slider")).toHaveClass("knob-md")
      cleanup()

      render(<Knob title="Volume" value={50} onChange={() => {}} size="lg" />)
      expect(screen.getByRole("slider")).toHaveClass("knob-lg")
      cleanup()

      render(<Knob title="Volume" value={50} onChange={() => {}} size="xl" />)
      expect(screen.getByRole("slider")).toHaveClass("knob-xl")
    })

    it("uses default 'md' size when not specified", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} />)
      expect(screen.getByRole("slider")).toHaveClass("knob-md")
    })
  })

  describe("indicatorOffAtMin", () => {
    it("applies 'off' class to indicator when value equals min", () => {
      render(<Knob title="Volume" value={0} onChange={() => {}} min={0} max={100} indicatorOffAtMin={true} />)
      const indicator = document.querySelector(".knob-indicator")
      expect(indicator).toHaveClass("off")
    })

    it("does not apply 'off' class when value is above min", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} min={0} max={100} indicatorOffAtMin={true} />)
      const indicator = document.querySelector(".knob-indicator")
      expect(indicator).not.toHaveClass("off")
    })
  })

  describe("description popover", () => {
    it("shows description on title hover", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} description="Master volume control" />)
      const title = screen.getByText("Volume")

      fireEvent.mouseEnter(title)
      expect(screen.getByText("Master volume control")).toBeInTheDocument()

      fireEvent.mouseLeave(title)
      expect(screen.queryByText("Master volume control")).not.toBeInTheDocument()
    })
  })

  describe("dragging class", () => {
    it("applies dragging class during mouse drag", () => {
      render(<Knob title="Volume" value={50} onChange={() => {}} />)
      const knob = screen.getByRole("slider")

      fireEvent.mouseDown(knob, { clientY: 100 })
      expect(knob).toHaveClass("dragging")

      fireEvent.mouseUp(window)
      expect(knob).not.toHaveClass("dragging")
    })
  })
})
