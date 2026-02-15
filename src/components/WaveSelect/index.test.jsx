import { fireEvent, render, screen } from "@solidjs/testing-library"
import { createSignal } from "solid-js"
import { describe, expect, it, vi } from "vitest"
import { WaveSelect } from "./index"

describe("WaveSelect", () => {
  it("renders with required props", () => {
    render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
    expect(screen.getByLabelText("LFO Wave")).toBeInTheDocument()
  })

  it("renders the title", () => {
    render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
    expect(screen.getByText("LFO Wave")).toBeInTheDocument()
  })

  it("renders without title when not provided", () => {
    render(() => <WaveSelect value={0} onChange={() => {}} />)
    expect(screen.getByLabelText("Wave")).toBeInTheDocument()
  })

  it("displays the selected wave icon", () => {
    render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
    const display = document.querySelector(".wave-select-display")
    expect(display).toBeInTheDocument()
  })

  describe("dropdown interaction", () => {
    it("opens dropdown when clicked", () => {
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.click(button)
      expect(document.querySelector(".wave-select-dropdown")).toBeInTheDocument()
    })

    it("renders all 6 wave options", () => {
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.click(button)
      const options = document.querySelectorAll(".wave-select-option")
      expect(options.length).toBe(6)
    })

    it("calls onChange when an option is selected", () => {
      const onChange = vi.fn()
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={onChange} />)

      const button = document.querySelector(".wave-select-display")
      fireEvent.click(button)

      const options = document.querySelectorAll(".wave-select-option")
      fireEvent.click(options[2]) // Select third option

      expect(onChange).toHaveBeenCalledWith(2)
    })

    it("closes dropdown after selection", () => {
      const onChange = vi.fn()
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={onChange} />)

      const button = document.querySelector(".wave-select-display")
      fireEvent.click(button)

      const options = document.querySelectorAll(".wave-select-option")
      fireEvent.click(options[1])

      expect(document.querySelector(".wave-select-dropdown")).not.toBeInTheDocument()
    })
  })

  describe("keyboard navigation", () => {
    it("opens dropdown on Enter key", () => {
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.keyDown(button, { key: "Enter" })
      expect(document.querySelector(".wave-select-dropdown")).toBeInTheDocument()
    })

    it("opens dropdown on Space key", () => {
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={() => {}} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.keyDown(button, { key: " " })
      expect(document.querySelector(".wave-select-dropdown")).toBeInTheDocument()
    })

    it("decrements value on ArrowUp", () => {
      const onChange = vi.fn()
      render(() => <WaveSelect title="LFO Wave" value={2} onChange={onChange} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.keyDown(button, { key: "ArrowUp" })
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it("increments value on ArrowDown", () => {
      const onChange = vi.fn()
      render(() => <WaveSelect title="LFO Wave" value={2} onChange={onChange} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.keyDown(button, { key: "ArrowDown" })
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it("wraps to last option when ArrowUp at first option", () => {
      const onChange = vi.fn()
      render(() => <WaveSelect title="LFO Wave" value={0} onChange={onChange} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.keyDown(button, { key: "ArrowUp" })
      expect(onChange).toHaveBeenCalledWith(5)
    })

    it("wraps to first option when ArrowDown at last option", () => {
      const onChange = vi.fn()
      render(() => <WaveSelect title="LFO Wave" value={5} onChange={onChange} />)
      const button = document.querySelector(".wave-select-display")

      fireEvent.keyDown(button, { key: "ArrowDown" })
      expect(onChange).toHaveBeenCalledWith(0)
    })
  })

  describe("size variants", () => {
    it("applies size classes correctly", () => {
      // SolidJS uses signals instead of rerender
      const [size, setSize] = createSignal("sm")
      render(() => <WaveSelect title="LFO" value={0} onChange={() => {}} size={size()} />)
      expect(document.querySelector(".wave-select-container")).toHaveClass("wave-select-sm")

      setSize("md")
      expect(document.querySelector(".wave-select-container")).toHaveClass("wave-select-md")

      setSize("lg")
      expect(document.querySelector(".wave-select-container")).toHaveClass("wave-select-lg")

      setSize("xl")
      expect(document.querySelector(".wave-select-container")).toHaveClass("wave-select-xl")
    })

    it("uses default 'md' size when not specified", () => {
      render(() => <WaveSelect title="LFO" value={0} onChange={() => {}} />)
      expect(document.querySelector(".wave-select-container")).toHaveClass("wave-select-md")
    })
  })

  describe("description tooltip", () => {
    it("shows description on hover", () => {
      render(() => <WaveSelect title="LFO" value={0} onChange={() => {}} description="Select waveform" />)
      const container = document.querySelector(".wave-select-container")

      fireEvent.mouseEnter(container)
      expect(screen.getByText("Select waveform")).toBeInTheDocument()

      fireEvent.mouseLeave(container)
      expect(screen.queryByText("Select waveform")).not.toBeInTheDocument()
    })

    it("does not show description when dropdown is open", () => {
      render(() => <WaveSelect title="LFO" value={0} onChange={() => {}} description="Select waveform" />)
      const container = document.querySelector(".wave-select-container")
      const button = document.querySelector(".wave-select-display")

      fireEvent.click(button) // Open dropdown
      fireEvent.mouseEnter(container)

      expect(screen.queryByText("Select waveform")).not.toBeInTheDocument()
    })
  })
})
