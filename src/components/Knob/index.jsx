import { createEffect, createSignal, onCleanup } from "solid-js"
import "./style.css"

/**
 * A rotary knob control component with drag interaction, optional value input, and hover popovers.
 * Supports vertical drag to adjust values, keyboard focus, and accessibility features.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Short label displayed above the knob (e.g., "LFO Rate")
 * @param {number} props.value - Current value of the knob
 * @param {function} props.onChange - Callback function called when value changes: (newValue) => void
 * @param {string} [props.description=""] - Extended description shown in popover on label hover
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=99] - Maximum value
 * @param {string} [props.size="md"] - Size of the knob: "sm" | "md" | "lg" | "xl"
 * @param {number} [props.rotationDegrees=270] - Total rotation range in degrees (e.g., 270° = -135° to +135°)
 * @param {boolean} [props.showValueInput=false] - Whether to show a numeric input field below the knob
 * @param {boolean} [props.indicatorOffAtMin=false] - Whether to dim the indicator when value equals min
 * @param {number} [props.sensitivity=1.0] - Multiplier for drag sensitivity (higher = faster changes)
 * @param {boolean} [props.invert=false] - Invert drag direction (true: down increases value)
 * @param {function} [props.formatValue] - Optional function to format value for display: (value) => string
 * @param {function} [props.parseValue] - Optional function to parse input value: (string) => number | null
 *
 * @returns {import("solid-js").JSX.Element} The rendered knob component
 *
 * @example
 * // Basic usage (required params only)
 * <Knob
 *   title="Volume"
 *   value={volume}
 *   onChange={setVolume}
 * />
 *
 * @example
 * // With description popover and value input
 * <Knob
 *   title="Filter"
 *   value={cutoff}
 *   onChange={setCutoff}
 *   description="Low-pass filter cutoff frequency in Hz"
 *   min={20}
 *   max={20000}
 *   showValueInput={true}
 *   size="lg"
 *   sensitivity={0.5}
 * />
 */
export function Knob(props) {
  const onChange = () => props.onChange
  const description = () => props.description ?? ""
  const min = () => props.min ?? 0
  const max = () => props.max ?? 99
  const size = () => props.size ?? "md"
  const rotationDegrees = () => props.rotationDegrees ?? 270
  const showValueInput = () => props.showValueInput ?? false
  const indicatorOffAtMin = () => props.indicatorOffAtMin ?? false
  const sensitivity = () => props.sensitivity ?? 1.0
  const invert = () => props.invert ?? false
  const formatValue = () => props.formatValue ?? null
  const parseValue = () => props.parseValue ?? null

  const [isDragging, setIsDragging] = createSignal(false)
  const [isHovered, setIsHovered] = createSignal(false)
  const [isLabelHovered, setIsLabelHovered] = createSignal(false)
  const [dragStartY, setDragStartY] = createSignal(0)
  const [startValue, setStartValue] = createSignal(0)
  const [inputValue, setInputValue] = createSignal(null)
  let knobRef
  let keyRepeatRef
  let keyDirectionRef = 0

  createEffect(() => {
    props.value
    setInputValue(null)
  })

  const percentage = () => ((props.value - min()) / (max() - min())) * 100
  const rotation = () => (percentage() / 100) * rotationDegrees() - rotationDegrees() / 2

  const displayValue = () => (formatValue() ? formatValue()(props.value) : props.value)

  const handleInputChange = (e) => {
    const rawValue = e.target.value
    setInputValue(rawValue)

    const parser = parseValue()
    const newValue = parser ? parser(rawValue) : parseInt(rawValue, 10)

    if (newValue !== null && !Number.isNaN(newValue) && newValue >= min() && newValue <= max()) {
      onChange()?.(newValue)
    }
  }

  const handleInputBlur = () => {
    setInputValue(null)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    knobRef?.focus()
    setIsDragging(true)
    setDragStartY(e.clientY)
    setStartValue(props.value)
  }

  const handleMouseMove = (e) => {
    if (!isDragging()) return

    let deltaY = e.clientY - dragStartY()
    if (!invert()) deltaY = dragStartY() - e.clientY

    const baseSensitivity = (max() - min()) / 200
    const adjustedSensitivity = baseSensitivity * sensitivity()
    const newValue = Math.round(startValue() + deltaY * adjustedSensitivity)

    const clampedValue = Math.max(min(), Math.min(max(), newValue))

    if (clampedValue !== props.value && onChange()) {
      onChange()(clampedValue)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  createEffect(() => {
    if (isDragging()) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      onCleanup(() => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      })
    }
  })

  const clearKeyRepeat = () => {
    if (keyRepeatRef) {
      clearTimeout(keyRepeatRef)
      keyRepeatRef = null
    }
    keyDirectionRef = 0
  }

  const scheduleKeyRepeat = () => {
    keyRepeatRef = setTimeout(() => {
      const direction = keyDirectionRef
      if (direction === 0) return

      const newValue = direction > 0 ? Math.min(max(), props.value + 1) : Math.max(min(), props.value - 1)
      if (newValue !== props.value && onChange()) {
        onChange()(newValue)
      }

      scheduleKeyRepeat()
    }, 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault()
      if (keyDirectionRef !== 1) {
        clearKeyRepeat()
        keyDirectionRef = 1
        const newValue = Math.min(max(), props.value + 1)
        if (newValue !== props.value && onChange()) {
          onChange()(newValue)
        }
        scheduleKeyRepeat()
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault()
      if (keyDirectionRef !== -1) {
        clearKeyRepeat()
        keyDirectionRef = -1
        const newValue = Math.max(min(), props.value - 1)
        if (newValue !== props.value && onChange()) {
          onChange()(newValue)
        }
        scheduleKeyRepeat()
      }
    }
  }

  const handleKeyUp = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft") {
      clearKeyRepeat()
    }
  }

  onCleanup(() => {
    if (keyRepeatRef) {
      clearTimeout(keyRepeatRef)
    }
  })

  const sizeClass = () => {
    if (size() === "sm") return "knob-sm"
    if (size() === "lg") return "knob-lg"
    if (size() === "xl") return "knob-xl"
    return "knob-md"
  }

  return (
    <div class="knob-container">
      {props.title && (
        <section
          class="knob-title"
          onMouseEnter={() => setIsLabelHovered(true)}
          onMouseLeave={() => setIsLabelHovered(false)}
          aria-label={`${props.title} knob`}
        >
          {props.title}
        </section>
      )}
      <div
        ref={knobRef}
        class={`knob ${sizeClass()} ${isDragging() ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        role="slider"
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={props.value}
        tabIndex={0}
      >
        <div class="knob-outer">
          <div class="knob-inner" style={{ transform: `rotate(${rotation()}deg)` }}>
            <div class={`knob-indicator ${indicatorOffAtMin() && props.value === min() ? "off" : ""}`}></div>
          </div>
          <div class="knob-track"></div>
        </div>
      </div>
      {showValueInput() ? (
        <input
          type={formatValue() ? "text" : "number"}
          class={`knob-input ${indicatorOffAtMin() && props.value === min() ? "off" : ""}`}
          value={inputValue() ?? displayValue()}
          min={min()}
          max={max()}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      ) : (
        <div class="knob-input-spacer" />
      )}
      {!showValueInput() && (isHovered() || isDragging()) && (
        <div class="knob-popover">{formatValue() ? formatValue()(props.value) : props.value}</div>
      )}
      {description() && isLabelHovered() && <div class="knob-label-popover">{description()}</div>}
    </div>
  )
}
