import { useEffect, useRef, useState } from "preact/hooks"
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
 * @returns {import("preact").JSX.Element} The rendered knob component
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
export function Knob({
  title,
  value,
  onChange,
  description = "",
  min = 0,
  max = 99,
  size = "md",
  rotationDegrees = 270,
  showValueInput = false,
  indicatorOffAtMin = false,
  sensitivity = 1.0,
  invert = false,
  formatValue = null,
  parseValue = null,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLabelHovered, setIsLabelHovered] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)
  const [inputValue, setInputValue] = useState(value)
  const knobRef = useRef(null)
  const keyRepeatRef = useRef(null)
  const keyDirectionRef = useRef(0)
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const percentage = ((value - min) / (max - min)) * 100
  const rotation = (percentage / 100) * rotationDegrees - rotationDegrees / 2

  const displayValue = formatValue ? formatValue(value) : value

  const handleInputChange = (e) => {
    const rawValue = e.target.value
    setInputValue(rawValue)

    const newValue = parseValue ? parseValue(rawValue) : parseInt(rawValue, 10)

    if (newValue !== null && !Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    setInputValue(null)
  }

  useEffect(() => {
    setInputValue(null)
  }, [value])

  const handleMouseDown = (
    /** @type {{ preventDefault: () => void; clientY: import("preact/hooks").StateUpdater<number>; }} */ e,
  ) => {
    e.preventDefault()
    knobRef.current?.focus()
    setIsDragging(true)
    setDragStartY(e.clientY)
    setStartValue(value)
  }

  const handleMouseMove = (/** @type {{ clientY: number; }} */ e) => {
    if (!isDragging) return

    let deltaY = e.clientY - dragStartY
    if (!invert) deltaY = dragStartY - e.clientY

    const baseSensitivity = (max - min) / 200
    const adjustedSensitivity = baseSensitivity * sensitivity
    const newValue = Math.round(startValue + deltaY * adjustedSensitivity)

    const clampedValue = Math.max(min, Math.min(max, newValue))

    if (clampedValue !== value && onChange) {
      onChange(clampedValue)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStartY, startValue, value, invert, sensitivity])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const clearKeyRepeat = () => {
    if (keyRepeatRef.current) {
      clearTimeout(keyRepeatRef.current)
      keyRepeatRef.current = null
    }
    keyDirectionRef.current = 0
  }

  const scheduleKeyRepeat = () => {
    keyRepeatRef.current = setTimeout(() => {
      const direction = keyDirectionRef.current
      if (direction === 0) return

      const currentValue = valueRef.current
      const newValue = direction > 0 ? Math.min(max, currentValue + 1) : Math.max(min, currentValue - 1)
      if (newValue !== currentValue && onChange) {
        onChange(newValue)
      }

      scheduleKeyRepeat()
    }, 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault()
      if (keyDirectionRef.current !== 1) {
        clearKeyRepeat()
        keyDirectionRef.current = 1
        const newValue = Math.min(max, value + 1)
        if (newValue !== value && onChange) {
          onChange(newValue)
        }
        scheduleKeyRepeat()
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault()
      if (keyDirectionRef.current !== -1) {
        clearKeyRepeat()
        keyDirectionRef.current = -1
        const newValue = Math.max(min, value - 1)
        if (newValue !== value && onChange) {
          onChange(newValue)
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

  useEffect(() => {
    return () => {
      if (keyRepeatRef.current) {
        clearTimeout(keyRepeatRef.current)
      }
    }
  }, [])

  const sizeClass = size === "sm" ? "knob-sm" : size === "lg" ? "knob-lg" : size === "xl" ? "knob-xl" : "knob-md"

  return (
    <div className="knob-container">
      {title && (
        <section
          className="knob-title"
          onMouseEnter={() => setIsLabelHovered(true)}
          onMouseLeave={() => setIsLabelHovered(false)}
          aria-label={`${title} knob`}
        >
          {title}
        </section>
      )}
      <div
        ref={knobRef}
        className={`knob ${sizeClass} ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
      >
        <div className="knob-outer">
          <div className="knob-inner" style={{ transform: `rotate(${rotation}deg)` }}>
            <div className={`knob-indicator ${indicatorOffAtMin && value === min ? "off" : ""}`}></div>
          </div>
          <div className="knob-track"></div>
        </div>
      </div>
      {showValueInput ? (
        <input
          type={formatValue ? "text" : "number"}
          className={`knob-input ${indicatorOffAtMin && value === min ? "off" : ""}`}
          value={inputValue ?? displayValue}
          min={min}
          max={max}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      ) : (
        <div className="knob-input-spacer" />
      )}
      {!showValueInput && (isHovered || isDragging) && (
        <div className="knob-popover">{formatValue ? formatValue(value) : value}</div>
      )}
      {description && isLabelHovered && <div className="knob-label-popover">{description}</div>}
    </div>
  )
}
