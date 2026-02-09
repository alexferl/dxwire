import { fireEvent, render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { Slider } from "./index"

describe("Slider", () => {
  it("renders with required props", () => {
    render(<Slider title="Volume" value={50} onChange={() => {}} />)
    expect(screen.getByLabelText("Volume slider")).toBeInTheDocument()
  })

  it("renders the title", () => {
    render(<Slider title="Volume" value={50} onChange={() => {}} />)
    expect(screen.getByText("Volume")).toBeInTheDocument()
  })

  it("has correct aria attributes", () => {
    render(<Slider title="Volume" value={50} onChange={() => {}} min={0} max={100} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("aria-valuemin", "0")
    expect(slider).toHaveAttribute("aria-valuemax", "100")
    expect(slider).toHaveAttribute("aria-valuenow", "50")
  })

  it("is focusable", () => {
    render(<Slider title="Volume" value={50} onChange={() => {}} />)
    expect(screen.getByRole("slider")).toHaveAttribute("tabIndex", "0")
  })

  describe("value input", () => {
    it("does not show value input by default", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} />)
      expect(document.querySelector(".slider-input")).not.toBeInTheDocument()
    })

    it("shows value input when showValueInput is true", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} showValueInput={true} />)
      expect(document.querySelector(".slider-input")).toBeInTheDocument()
    })

    it("displays formatted value when formatValue is provided", () => {
      render(
        <Slider title="Volume" value={50} onChange={() => {}} showValueInput={true} formatValue={(v) => `${v}%`} />,
      )
      const input = document.querySelector(".slider-input")
      expect(input).toHaveValue("50%")
    })

    it("does not call onChange when parseValue returns null", () => {
      const onChange = vi.fn()
      render(<Slider title="Freq" value={1000} onChange={onChange} showValueInput={true} parseValue={() => null} />)
      const input = document.querySelector(".slider-input")
      fireEvent.input(input, { target: { value: "invalid" } })
      expect(onChange).not.toHaveBeenCalled()
    })

    it("does not call onChange when value is out of range", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} showValueInput={true} />)
      const input = document.querySelector(".slider-input")
      fireEvent.input(input, { target: { value: "150" } })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe("keyboard interaction", () => {
    it("increments value on ArrowRight", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.keyDown(slider, { key: "ArrowRight" })
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it("decrements value on ArrowLeft", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.keyDown(slider, { key: "ArrowLeft" })
      expect(onChange).toHaveBeenCalledWith(49)
    })

    it("does not exceed max value", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={100} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.keyDown(slider, { key: "ArrowRight" })
      expect(onChange).not.toHaveBeenCalled()
    })

    it("does not go below min value", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={0} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.keyDown(slider, { key: "ArrowLeft" })
      expect(onChange).not.toHaveBeenCalled()
    })

    it("stops key repeat on keyUp", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.keyDown(slider, { key: "ArrowRight" })
      fireEvent.keyUp(slider, { key: "ArrowRight" })

      // Should only be called once, not repeatedly
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  describe("mouse drag interaction", () => {
    it("calls onChange when dragging right", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.mouseDown(slider, { clientX: 100 })
      fireEvent.mouseMove(window, { clientX: 150 })

      expect(onChange).toHaveBeenCalled()
    })

    it("calls onChange when dragging left", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} />)
      const slider = screen.getByRole("slider")

      fireEvent.mouseDown(slider, { clientX: 100 })
      fireEvent.mouseMove(window, { clientX: 50 })

      expect(onChange).toHaveBeenCalled()
    })

    it("does not call onChange when mouse is not down", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} />)

      fireEvent.mouseMove(window, { clientX: 150 })

      expect(onChange).not.toHaveBeenCalled()
    })

    it("respects invert prop", () => {
      const onChange = vi.fn()
      render(<Slider title="Volume" value={50} onChange={onChange} min={0} max={100} invert={true} />)
      const slider = screen.getByRole("slider")

      // When inverted, dragging left should increase value
      fireEvent.mouseDown(slider, { clientX: 100 })
      fireEvent.mouseMove(window, { clientX: 50 })

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe("hover popover", () => {
    it("shows popover on hover when showValueInput is false", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} />)
      const slider = screen.getByRole("slider")

      fireEvent.mouseEnter(slider)
      expect(document.querySelector(".slider-popover")).toBeInTheDocument()

      fireEvent.mouseLeave(slider)
      expect(document.querySelector(".slider-popover")).not.toBeInTheDocument()
    })

    it("does not show hover popover when showValueInput is true", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} showValueInput={true} />)
      const slider = screen.getByRole("slider")

      fireEvent.mouseEnter(slider)
      expect(document.querySelector(".slider-popover")).not.toBeInTheDocument()
    })

    it("shows formatted value in hover popover", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} formatValue={(v) => `${v}%`} />)
      const slider = screen.getByRole("slider")

      fireEvent.mouseEnter(slider)
      const popover = document.querySelector(".slider-popover")
      expect(popover).toHaveTextContent("50%")
    })
  })

  describe("size variants", () => {
    it("applies size classes correctly", () => {
      const { rerender } = render(<Slider title="Volume" value={50} onChange={() => {}} size="sm" />)
      expect(screen.getByRole("slider")).toHaveClass("slider-sm")

      rerender(<Slider title="Volume" value={50} onChange={() => {}} size="md" />)
      expect(screen.getByRole("slider")).toHaveClass("slider-md")

      rerender(<Slider title="Volume" value={50} onChange={() => {}} size="lg" />)
      expect(screen.getByRole("slider")).toHaveClass("slider-lg")

      rerender(<Slider title="Volume" value={50} onChange={() => {}} size="xl" />)
      expect(screen.getByRole("slider")).toHaveClass("slider-xl")
    })

    it("uses default 'md' size when not specified", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} />)
      expect(screen.getByRole("slider")).toHaveClass("slider-md")
    })
  })

  describe("indicatorOffAtMin", () => {
    it("applies 'off' class to fill when value equals min", () => {
      render(<Slider title="Volume" value={0} onChange={() => {}} min={0} max={100} indicatorOffAtMin={true} />)
      const fill = document.querySelector(".slider-fill")
      expect(fill).toHaveClass("off")
    })

    it("applies 'off' class to thumb when value equals min", () => {
      render(<Slider title="Volume" value={0} onChange={() => {}} min={0} max={100} indicatorOffAtMin={true} />)
      const thumb = document.querySelector(".slider-thumb")
      expect(thumb).toHaveClass("off")
    })

    it("does not apply 'off' class when value is above min", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} min={0} max={100} indicatorOffAtMin={true} />)
      const fill = document.querySelector(".slider-fill")
      expect(fill).not.toHaveClass("off")
    })
  })

  describe("description popover", () => {
    it("shows description on title hover", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} description="Master volume control" />)
      const title = screen.getByText("Volume")

      fireEvent.mouseEnter(title)
      expect(screen.getByText("Master volume control")).toBeInTheDocument()

      fireEvent.mouseLeave(title)
      expect(screen.queryByText("Master volume control")).not.toBeInTheDocument()
    })
  })

  describe("dragging class", () => {
    it("applies dragging class during mouse drag", () => {
      render(<Slider title="Volume" value={50} onChange={() => {}} />)
      const slider = screen.getByRole("slider")

      fireEvent.mouseDown(slider, { clientX: 100 })
      expect(slider).toHaveClass("dragging")

      fireEvent.mouseUp(window)
      expect(slider).not.toHaveClass("dragging")
    })
  })
})
