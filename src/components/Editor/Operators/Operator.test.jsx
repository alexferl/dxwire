import { fireEvent, render, screen, waitFor } from "@testing-library/preact"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing components that use it
const mockUseVoice = vi.fn()
vi.mock("../context/VoiceContext", () => ({
  VoiceContext: {
    Provider: ({ children }) => children,
  },
  useVoice: () => mockUseVoice(),
}))

import { Operator } from "./Operator"

// Mock midiwire
vi.mock("midiwire", () => ({
  DX7Bank: class {},
  noteNameToNumber: (name) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const match = name.match(/^([A-G][#-]?)(-?\d+)$/)
    if (!match) throw new Error("Invalid note name")
    const note = match[1]
    const octave = parseInt(match[2], 10)
    const noteIndex = notes.indexOf(note)
    if (noteIndex === -1) throw new Error("Invalid note")
    return (octave + 2) * 12 + noteIndex
  },
  noteNumberToName: (num) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const noteIndex = num % 12
    const octave = Math.floor(num / 12) - 2
    return `${notes[noteIndex]}${octave}`
  },
}))

// Create mock operator signals
function createMockOperator(number, overrides = {}) {
  return {
    number,
    enabled: { value: overrides.enabled ?? true },
    mode: { value: overrides.mode ?? 0 },
    coarse: { value: overrides.coarse ?? 1 },
    fine: { value: overrides.fine ?? 0 },
    detune: { value: overrides.detune ?? 7 },
    egLevel1: { value: overrides.egLevel1 ?? 99 },
    egLevel2: { value: overrides.egLevel2 ?? 99 },
    egLevel3: { value: overrides.egLevel3 ?? 99 },
    egLevel4: { value: overrides.egLevel4 ?? 0 },
    egRate1: { value: overrides.egRate1 ?? 99 },
    egRate2: { value: overrides.egRate2 ?? 99 },
    egRate3: { value: overrides.egRate3 ?? 99 },
    egRate4: { value: overrides.egRate4 ?? 99 },
    leftDepth: { value: overrides.leftDepth ?? 0 },
    rightDepth: { value: overrides.rightDepth ?? 0 },
    leftCurve: { value: overrides.leftCurve ?? 0 },
    rightCurve: { value: overrides.rightCurve ?? 0 },
    breakPoint: { value: overrides.breakPoint ?? 0 },
    rateScaling: { value: overrides.rateScaling ?? 0 },
    ampModSens: { value: overrides.ampModSens ?? 0 },
    keyVelocity: { value: overrides.keyVelocity ?? 0 },
    outputLevel: { value: overrides.outputLevel ?? 99 },
  }
}

// Mock voice context
function createMockVoice(operatorOverrides = {}) {
  return {
    operators: [
      createMockOperator(1, operatorOverrides.op1),
      createMockOperator(2, operatorOverrides.op2),
      createMockOperator(3, operatorOverrides.op3),
      createMockOperator(4, operatorOverrides.op4),
      createMockOperator(5, operatorOverrides.op5),
      createMockOperator(6, operatorOverrides.op6),
    ],
    settings: { value: { showADSR: true, showValueInputs: true } },
  }
}

describe("Operator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders operator with correct number", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(document.querySelector(".operator")).toBeInTheDocument()
    expect(document.querySelector(".op1")).toBeInTheDocument()
  })

  it("renders operator label with number", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={3} />)

    const label = document.querySelector(".op-label")
    expect(label).toHaveTextContent("3")
  })

  it("shows 'on' class when operator is enabled", () => {
    mockUseVoice.mockReturnValue(createMockVoice({ op1: { enabled: true } }))
    render(<Operator number={1} />)

    const label = document.querySelector(".op-label")
    expect(label).toHaveClass("on")
  })

  it("shows 'off' class when operator is disabled", () => {
    mockUseVoice.mockReturnValue(createMockVoice({ op1: { enabled: false } }))
    render(<Operator number={1} />)

    const label = document.querySelector(".op-label")
    expect(label).toHaveClass("off")
  })

  it("renders frequency display", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(document.querySelector(".freq-display")).toBeInTheDocument()
  })

  it("renders all frequency knobs", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("Detune knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Coarse knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Fine knob")).toBeInTheDocument()
  })

  it("renders envelope graph", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(document.querySelector(".envelope-display")).toBeInTheDocument()
  })

  it("renders all EG level knobs", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("L1 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("L2 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("L3 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("L4 knob")).toBeInTheDocument()
  })

  it("renders all EG rate knobs", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("R1 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R2 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R3 knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R4 knob")).toBeInTheDocument()
  })

  it("renders level scaling section", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("L Depth knob")).toBeInTheDocument()
    expect(screen.getByLabelText("R Depth knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Breakpoint slider")).toBeInTheDocument()
  })

  it("renders curve selects", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("L Curve")).toBeInTheDocument()
    expect(screen.getByLabelText("R Curve")).toBeInTheDocument()
  })

  it("renders rate scaling knob", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("Rate Scaling knob")).toBeInTheDocument()
  })

  it("renders modulation section knobs", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(screen.getByLabelText("Mod knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Level knob")).toBeInTheDocument()
    expect(screen.getByLabelText("Key knob")).toBeInTheDocument()
  })

  it("renders mode toggle switch", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(document.querySelector(".toggle-switch")).toBeInTheDocument()
  })

  it("renders enable ridged switch", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(document.querySelector(".ridged-switch")).toBeInTheDocument()
  })

  it("has correct CSS classes for sections", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    render(<Operator number={1} />)

    expect(document.querySelector(".freq-controls")).toBeInTheDocument()
    expect(document.querySelector(".eg-section")).toBeInTheDocument()
    expect(document.querySelector(".level-section")).toBeInTheDocument()
    expect(document.querySelector(".mod-section")).toBeInTheDocument()
  })

  it("renders different operator numbers correctly", () => {
    mockUseVoice.mockReturnValue(createMockVoice())
    const { rerender } = render(<Operator number={1} />)

    expect(document.querySelector(".op1")).toBeInTheDocument()

    rerender(<Operator number={6} />)

    expect(document.querySelector(".op6")).toBeInTheDocument()
  })

  it("calculates frequency display correctly for ratio mode", () => {
    mockUseVoice.mockReturnValue(createMockVoice({ op1: { mode: 0, coarse: 2, fine: 50, detune: 7 } }))
    render(<Operator number={1} />)

    const freqDisplay = document.querySelector(".freq-display")
    expect(freqDisplay).toBeInTheDocument()
  })

  it("calculates frequency display correctly for fixed mode", () => {
    mockUseVoice.mockReturnValue(createMockVoice({ op1: { mode: 1, coarse: 1, fine: 0, detune: 7 } }))
    render(<Operator number={1} />)

    const freqDisplay = document.querySelector(".freq-display")
    expect(freqDisplay).toBeInTheDocument()
  })

  describe("interactions", () => {
    it("updates enabled value when ridged switch toggled", async () => {
      const mockVoice = createMockVoice({ op1: { enabled: true } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const ridgedSwitch = document.querySelector(".ridged-switch")
      fireEvent.click(ridgedSwitch)

      await waitFor(() => {
        expect(mockVoice.operators[0].enabled.value).toBe(false)
      })
    })

    it("updates mode value when toggle switch clicked", async () => {
      const mockVoice = createMockVoice({ op1: { mode: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      // Find the toggle switch by its container
      const toggleSwitch = document.querySelector(".toggle-switch")
      // Click on the switch element inside
      const switchButton = toggleSwitch?.querySelector("button") || toggleSwitch
      fireEvent.click(switchButton)

      await waitFor(() => {
        expect(mockVoice.operators[0].mode.value).toBe(1)
      })
    })

    it("updates coarse value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { coarse: 1 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      // Coarse is the 2nd frequency knob (index 1 after detune)
      fireEvent.change(inputs[1], { target: { value: "10" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].coarse.value).toBe(10)
      })
    })

    it("updates fine value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { fine: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      // Fine is the 3rd frequency knob
      fireEvent.change(inputs[2], { target: { value: "50" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].fine.value).toBe(50)
      })
    })

    it("updates detune value with offset when changed", async () => {
      const mockVoice = createMockVoice({ op1: { detune: 7 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      // Detune is the 1st frequency knob, display shows value - 7
      // Setting display to 3 means actual value is 3 + 7 = 10
      fireEvent.change(inputs[0], { target: { value: "3" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].detune.value).toBe(10)
      })
    })

    it("updates egLevel1 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egLevel1: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      // After 3 freq knobs, L1-L4 are next
      fireEvent.change(inputs[3], { target: { value: "75" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egLevel1.value).toBe(75)
      })
    })

    it("updates egRate1 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egRate1: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      // After 3 freq + 4 level knobs, R1-R4 are next
      fireEvent.change(inputs[7], { target: { value: "80" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egRate1.value).toBe(80)
      })
    })

    it("updates leftDepth value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { leftDepth: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      // Find L Depth knob by looking for it specifically
      const lDepthIndex = Array.from(inputs).findIndex((input) => {
        const label = input.closest(".knob-container")?.querySelector(".knob-title")
        return label?.textContent === "L Depth"
      })
      if (lDepthIndex >= 0) {
        fireEvent.change(inputs[lDepthIndex], { target: { value: "25" } })
        await waitFor(() => {
          expect(mockVoice.operators[0].leftDepth.value).toBe(25)
        })
      }
    })

    it("updates leftCurve value when changed", () => {
      const mockVoice = createMockVoice({ op1: { leftCurve: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      // Click on curve select display to open dropdown
      const curveSelects = document.querySelectorAll(".curve-select-display")
      fireEvent.click(curveSelects[0])

      // Click on linear option (index 1, since 0 is -lin, 1 is -exp, 2 is +exp, 3 is +lin)
      const options = document.querySelectorAll(".curve-select-option")
      fireEvent.click(options[3])

      expect(mockVoice.operators[0].leftCurve.value).toBe(3)
    })

    it("updates rightDepth value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { rightDepth: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      const rDepthIndex = Array.from(inputs).findIndex((input) => {
        const label = input.closest(".knob-container")?.querySelector(".knob-title")
        return label?.textContent === "R Depth"
      })
      if (rDepthIndex >= 0) {
        fireEvent.change(inputs[rDepthIndex], { target: { value: "30" } })
        await waitFor(() => {
          expect(mockVoice.operators[0].rightDepth.value).toBe(30)
        })
      }
    })

    it("updates rightCurve value when changed", () => {
      const mockVoice = createMockVoice({ op1: { rightCurve: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const curveSelects = document.querySelectorAll(".curve-select-display")
      fireEvent.click(curveSelects[1])

      const options = document.querySelectorAll(".curve-select-option")
      fireEvent.click(options[2])

      expect(mockVoice.operators[0].rightCurve.value).toBe(2)
    })

    it("updates rateScaling value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { rateScaling: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      const rateScalingIndex = Array.from(inputs).findIndex((input) => {
        const label = input.closest(".knob-container")?.querySelector(".knob-title")
        return label?.textContent === "Rate Scaling"
      })
      if (rateScalingIndex >= 0) {
        fireEvent.change(inputs[rateScalingIndex], { target: { value: "5" } })
        await waitFor(() => {
          expect(mockVoice.operators[0].rateScaling.value).toBe(5)
        })
      }
    })

    it("updates ampModSens value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { ampModSens: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      const modIndex = Array.from(inputs).findIndex((input) => {
        const label = input.closest(".knob-container")?.querySelector(".knob-title")
        return label?.textContent === "Mod"
      })
      if (modIndex >= 0) {
        fireEvent.change(inputs[modIndex], { target: { value: "2" } })
        await waitFor(() => {
          expect(mockVoice.operators[0].ampModSens.value).toBe(2)
        })
      }
    })

    it("updates outputLevel value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { outputLevel: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      const levelIndex = Array.from(inputs).findIndex((input) => {
        const label = input.closest(".knob-container")?.querySelector(".knob-title")
        return label?.textContent === "Level"
      })
      if (levelIndex >= 0) {
        fireEvent.change(inputs[levelIndex], { target: { value: "50" } })
        await waitFor(() => {
          expect(mockVoice.operators[0].outputLevel.value).toBe(50)
        })
      }
    })

    it("updates keyVelocity value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { keyVelocity: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      const keyIndex = Array.from(inputs).findIndex((input) => {
        const label = input.closest(".knob-container")?.querySelector(".knob-title")
        return label?.textContent === "Key"
      })
      if (keyIndex >= 0) {
        fireEvent.change(inputs[keyIndex], { target: { value: "4" } })
        await waitFor(() => {
          expect(mockVoice.operators[0].keyVelocity.value).toBe(4)
        })
      }
    })

    it("updates egLevel2 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egLevel2: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      fireEvent.change(inputs[4], { target: { value: "60" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egLevel2.value).toBe(60)
      })
    })

    it("updates egLevel3 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egLevel3: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      fireEvent.change(inputs[5], { target: { value: "45" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egLevel3.value).toBe(45)
      })
    })

    it("updates egLevel4 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egLevel4: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      fireEvent.change(inputs[6], { target: { value: "25" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egLevel4.value).toBe(25)
      })
    })

    it("updates egRate2 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egRate2: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      fireEvent.change(inputs[8], { target: { value: "70" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egRate2.value).toBe(70)
      })
    })

    it("updates egRate3 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egRate3: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      fireEvent.change(inputs[9], { target: { value: "60" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egRate3.value).toBe(60)
      })
    })

    it("updates egRate4 value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { egRate4: 99 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const inputs = document.querySelectorAll(".knob-input")
      fireEvent.change(inputs[10], { target: { value: "50" } })

      await waitFor(() => {
        expect(mockVoice.operators[0].egRate4.value).toBe(50)
      })
    })

    it("updates breakPoint value when changed", async () => {
      const mockVoice = createMockVoice({ op1: { breakPoint: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const sliderInput = document.querySelector(".slider-input")
      expect(sliderInput).toBeInTheDocument()
      // Input a note name - parseValue converts it to breakPoint value
      fireEvent.change(sliderInput, { target: { value: "C3" } })

      await waitFor(() => {
        // C3 should be parsed to a note number minus 9
        expect(mockVoice.operators[0].breakPoint.value).toBeGreaterThan(0)
      })
    })

    it("updates breakPoint using note name input and parseValue", async () => {
      const mockVoice = createMockVoice({ op1: { breakPoint: 0 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const sliderInput = document.querySelector(".slider-input")
      expect(sliderInput).toBeInTheDocument()
      // Type a note name - this uses parseValue to convert note to number
      fireEvent.change(sliderInput, { target: { value: "C3" } })

      await waitFor(() => {
        // C3 should be parsed and converted to breakPoint value
        expect(mockVoice.operators[0].breakPoint.value).toBeGreaterThan(0)
      })
    })

    it("handles invalid note name in parseValue gracefully", async () => {
      const mockVoice = createMockVoice({ op1: { breakPoint: 50 } })
      mockUseVoice.mockReturnValue(mockVoice)
      render(<Operator number={1} />)

      const sliderInput = document.querySelector(".slider-input")
      expect(sliderInput).toBeInTheDocument()
      // Type an invalid note name - parseValue should return null and not update
      fireEvent.change(sliderInput, { target: { value: "invalid" } })

      await waitFor(() => {
        // Value should remain unchanged because parseValue returns null
        expect(mockVoice.operators[0].breakPoint.value).toBe(50)
      })
    })
  })
})
