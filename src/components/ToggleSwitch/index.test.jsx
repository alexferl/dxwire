import { fireEvent, render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { ToggleSwitch } from "./index"

describe("ToggleSwitch", () => {
  describe("single option mode", () => {
    it("renders with title in single option mode", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Enable Feature" />)
      expect(screen.getByText("Enable Feature")).toBeInTheDocument()
    })

    it("renders in 'off' state by default", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Test" />)
      const switchEl = screen.getByRole("switch")
      expect(switchEl).toHaveAttribute("aria-checked", "false")
      expect(switchEl).toHaveClass("off")
    })

    it("renders in 'on' state when value is true", () => {
      render(<ToggleSwitch value={true} onChange={() => {}} title="Test" />)
      const switchEl = screen.getByRole("switch")
      expect(switchEl).toHaveAttribute("aria-checked", "true")
      expect(switchEl).toHaveClass("on")
    })

    it("calls onChange with toggled value when clicked", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={false} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.click(switchEl)
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it("shows side indicator based on state", () => {
      const { rerender } = render(<ToggleSwitch value={false} onChange={() => {}} title="Test" />)
      const indicator = document.querySelector(".toggle-side-indicator")
      expect(indicator).not.toHaveClass("on")

      rerender(<ToggleSwitch value={true} onChange={() => {}} title="Test" />)
      expect(indicator).toHaveClass("on")
    })
  })

  describe("dual option mode", () => {
    it("renders both option labels in dual mode", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} option1="Option A" option2="Option B" />)
      expect(screen.getByText("Option A")).toBeInTheDocument()
      expect(screen.getByText("Option B")).toBeInTheDocument()
    })

    it("does not render title in dual mode", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Title" option1="A" option2="B" />)
      // Title should not appear when option1 and option2 are provided
      expect(screen.queryByText("Title")).not.toBeInTheDocument()
    })

    it("shows indicators on correct sides based on value", () => {
      const { rerender } = render(<ToggleSwitch value={false} onChange={() => {}} option1="A" option2="B" />)
      const indicators = document.querySelectorAll(".toggle-side-indicator")
      // When value is false, left indicator (option1) should be "on"
      expect(indicators[0]).toHaveClass("on")
      expect(indicators[1]).not.toHaveClass("on")

      rerender(<ToggleSwitch value={true} onChange={() => {}} option1="A" option2="B" />)
      // When value is true, right indicator (option2) should be "on"
      expect(indicators[0]).not.toHaveClass("on")
      expect(indicators[1]).toHaveClass("on")
    })
  })

  describe("keyboard interaction", () => {
    it("toggles on Space key press", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={false} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: " " })
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it("toggles on Enter key press", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={false} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: "Enter" })
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it("sets value to true on ArrowRight in single mode", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={false} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: "ArrowRight" })
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it("sets value to false on ArrowLeft in single mode", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={true} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: "ArrowLeft" })
      expect(onChange).toHaveBeenCalledWith(false)
    })

    it("sets value to true on ArrowDown", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={false} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: "ArrowDown" })
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it("sets value to false on ArrowUp", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={true} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: "ArrowUp" })
      expect(onChange).toHaveBeenCalledWith(false)
    })

    it("does not call onChange when already in target state", () => {
      const onChange = vi.fn()
      render(<ToggleSwitch value={true} onChange={onChange} title="Test" />)
      const switchEl = screen.getByRole("switch")

      fireEvent.keyDown(switchEl, { key: "ArrowRight" })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe("size variants", () => {
    it("applies size classes correctly", () => {
      const { rerender } = render(<ToggleSwitch value={false} onChange={() => {}} title="Test" size="sm" />)
      expect(screen.getByRole("switch")).toHaveClass("toggle-sm")

      rerender(<ToggleSwitch value={false} onChange={() => {}} title="Test" size="md" />)
      expect(screen.getByRole("switch")).toHaveClass("toggle-md")

      rerender(<ToggleSwitch value={false} onChange={() => {}} title="Test" size="lg" />)
      expect(screen.getByRole("switch")).toHaveClass("toggle-lg")

      rerender(<ToggleSwitch value={false} onChange={() => {}} title="Test" size="xl" />)
      expect(screen.getByRole("switch")).toHaveClass("toggle-xl")
    })

    it("uses default 'md' size when not specified", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Test" />)
      expect(screen.getByRole("switch")).toHaveClass("toggle-md")
    })
  })

  describe("description popover", () => {
    it("shows description on label hover in single mode", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Test" description="Test description" />)
      const label = screen.getByText("Test")

      fireEvent.mouseEnter(label)
      expect(screen.getByText("Test description")).toBeInTheDocument()

      fireEvent.mouseLeave(label)
      expect(screen.queryByText("Test description")).not.toBeInTheDocument()
    })
  })

  describe("accessibility", () => {
    it("has correct aria-label on title element", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Feature Toggle" />)
      expect(screen.getByLabelText("Feature Toggle toggle")).toBeInTheDocument()
    })

    it("is focusable", () => {
      render(<ToggleSwitch value={false} onChange={() => {}} title="Test" />)
      expect(screen.getByRole("switch")).toHaveAttribute("tabIndex", "0")
    })
  })
})
