import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"
import { CurveSelect } from "./index.jsx"

describe("CurveSelect", () => {
  it("renders with required props", () => {
    render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
    expect(screen.getByLabelText("L Curve")).toBeInTheDocument()
  })

  it("renders the title", () => {
    render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
    expect(screen.getByText("L Curve")).toBeInTheDocument()
  })

  it("displays the selected curve icon", () => {
    render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
    const display = document.querySelector(".curve-select-display")
    expect(display).toBeInTheDocument()
  })

  describe("dropdown interaction", () => {
    it("opens dropdown when clicked", () => {
      render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.click(button)
      expect(document.querySelector(".curve-select-dropdown")).toBeInTheDocument()
    })

    it("renders all 4 curve options", () => {
      render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.click(button)
      const options = document.querySelectorAll(".curve-select-option")
      expect(options.length).toBe(4)
    })

    it("displays option names in dropdown", () => {
      render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.click(button)
      expect(screen.getByText("-LIN")).toBeInTheDocument()
      expect(screen.getByText("-EXP")).toBeInTheDocument()
      expect(screen.getByText("+EXP")).toBeInTheDocument()
      expect(screen.getByText("+LIN")).toBeInTheDocument()
    })

    it("calls onChange when an option is selected", () => {
      const onChange = vi.fn()
      render(<CurveSelect title="L Curve" value={0} onChange={onChange} />)

      const button = document.querySelector(".curve-select-display")
      fireEvent.click(button)

      const options = document.querySelectorAll(".curve-select-option")
      fireEvent.click(options[2]) // Select +EXP

      expect(onChange).toHaveBeenCalledWith(2)
    })

    it("closes dropdown after selection", () => {
      const onChange = vi.fn()
      render(<CurveSelect title="L Curve" value={0} onChange={onChange} />)

      const button = document.querySelector(".curve-select-display")
      fireEvent.click(button)

      const options = document.querySelectorAll(".curve-select-option")
      fireEvent.click(options[1])

      expect(document.querySelector(".curve-select-dropdown")).not.toBeInTheDocument()
    })
  })

  describe("side prop (mirrored curves)", () => {
    it("uses normal curves for left side by default", () => {
      render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
      const button = document.querySelector(".curve-select-display")
      fireEvent.click(button)

      // Left side curves go down to up
      const options = document.querySelectorAll(".curve-select-option")
      expect(options.length).toBe(4)
    })

    it("uses mirrored curves for right side", () => {
      render(<CurveSelect title="R Curve" value={0} onChange={() => {}} side="right" />)
      const button = document.querySelector(".curve-select-display")
      fireEvent.click(button)

      const options = document.querySelectorAll(".curve-select-option")
      expect(options.length).toBe(4)
    })
  })

  describe("keyboard navigation", () => {
    it("opens dropdown on Enter key", () => {
      render(<CurveSelect title="L Curve" value={0} onChange={() => {}} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.keyDown(button, { key: "Enter" })
      expect(document.querySelector(".curve-select-dropdown")).toBeInTheDocument()
    })

    it("decrements value on ArrowUp", () => {
      const onChange = vi.fn()
      render(<CurveSelect title="L Curve" value={2} onChange={onChange} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.keyDown(button, { key: "ArrowUp" })
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it("increments value on ArrowDown", () => {
      const onChange = vi.fn()
      render(<CurveSelect title="L Curve" value={1} onChange={onChange} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.keyDown(button, { key: "ArrowDown" })
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it("wraps to last option when ArrowUp at first option", () => {
      const onChange = vi.fn()
      render(<CurveSelect title="L Curve" value={0} onChange={onChange} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.keyDown(button, { key: "ArrowUp" })
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it("wraps to first option when ArrowDown at last option", () => {
      const onChange = vi.fn()
      render(<CurveSelect title="L Curve" value={3} onChange={onChange} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.keyDown(button, { key: "ArrowDown" })
      expect(onChange).toHaveBeenCalledWith(0)
    })
  })

  describe("size variants", () => {
    it("applies size classes correctly", () => {
      const { unmount } = render(<CurveSelect title="Curve" value={0} onChange={() => {}} size="sm" />)
      expect(document.querySelector(".curve-select-container")).toHaveClass("curve-select-sm")
      unmount()

      render(<CurveSelect title="Curve" value={0} onChange={() => {}} size="md" />)
      expect(document.querySelector(".curve-select-container")).toHaveClass("curve-select-md")
      cleanup()

      render(<CurveSelect title="Curve" value={0} onChange={() => {}} size="lg" />)
      expect(document.querySelector(".curve-select-container")).toHaveClass("curve-select-lg")
      cleanup()

      render(<CurveSelect title="Curve" value={0} onChange={() => {}} size="xl" />)
      expect(document.querySelector(".curve-select-container")).toHaveClass("curve-select-xl")
    })

    it("uses default 'md' size when not specified", () => {
      render(<CurveSelect title="Curve" value={0} onChange={() => {}} />)
      expect(document.querySelector(".curve-select-container")).toHaveClass("curve-select-md")
    })
  })

  describe("description tooltip", () => {
    it("shows description on hover", () => {
      render(<CurveSelect title="Curve" value={0} onChange={() => {}} description="Select curve type" />)
      const container = document.querySelector(".curve-select-container")

      fireEvent.mouseEnter(container)
      expect(screen.getByText("Select curve type")).toBeInTheDocument()

      fireEvent.mouseLeave(container)
      expect(screen.queryByText("Select curve type")).not.toBeInTheDocument()
    })

    it("does not show description when dropdown is open", () => {
      render(<CurveSelect title="Curve" value={0} onChange={() => {}} description="Select curve type" />)
      const container = document.querySelector(".curve-select-container")
      const button = document.querySelector(".curve-select-display")

      fireEvent.click(button) // Open dropdown
      fireEvent.mouseEnter(container)

      expect(screen.queryByText("Select curve type")).not.toBeInTheDocument()
    })
  })

  describe("selected option highlighting", () => {
    it("highlights the currently selected option", () => {
      render(<CurveSelect title="L Curve" value={2} onChange={() => {}} />)
      const button = document.querySelector(".curve-select-display")

      fireEvent.click(button)
      const options = document.querySelectorAll(".curve-select-option")

      expect(options[2]).toHaveClass("selected")
      expect(options[2]).toHaveAttribute("aria-selected", "true")
    })
  })
})
