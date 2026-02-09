import { useEffect, useRef, useState } from "preact/hooks"
import "./style.css"

/**
 * A horizontal slider control component styled like a mixer button with drag interaction,
 * optional value input, and hover popovers.
 * Supports horizontal drag to adjust values, keyboard focus, and accessibility features.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Short label displayed above the knob (e.g., "Volume")
 * @param {number} props.value - Current value of the slider
 * @param {function} props.onChange - Callback function called when value changes: (newValue) => void
 * @param {string} [props.description=""] - Extended description shown in popover on label hover
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=99] - Maximum value
 * @param {string} [props.size="md"] - Size of the slider: "sm" | "md" | "lg" | "xl"
 * @param {boolean} [props.showValueInput=false] - Whether to show a numeric input field below the slider
 * @param {boolean} [props.indicatorOffAtMin=false] - Whether to dim the indicator when value equals min
 * @param {number} [props.sensitivity=1.0] - Multiplier for drag sensitivity (higher = faster changes)
 * @param {boolean} [props.invert=false] - Invert drag direction (true: left increases value)
 * @param {function} [props.formatValue] - Optional function to format value for display: (value) => string
 * @param {function} [props.parseValue] - Optional function to parse input value: (string) => number | null
 *
 * @returns {import("preact").JSX.Element} The rendered slider component
 *
 * @example
 * // Basic usage (required params only)
 * <Slider
 *   title="Volume"
 *   value={volume}
 *   onChange={setVolume}
 * />
 *
 * @example
 * // With description and value input
 * <Slider
 *   title="Filter"
 *   value={cutoff}
 *   onChange={setCutoff}
 *   description="Filter cutoff frequency in Hz"
 *   min={20}
 *   max={20000}
 *   showValueInput={true}
 *   size="lg"
 *   sensitivity={0.5}
 * />
 */
export function Slider({
  title,
  value,
  onChange,
  description = "",
  min = 0,
  max = 99,
  size = "md",
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
  const [dragStartX, setDragStartX] = useState(0)
  const [startValue, setStartValue] = useState(0)
  const [inputValue, setInputValue] = useState(value)
  const sliderRef = useRef(null)
  const keyRepeatRef = useRef(null)
  const keyDirectionRef = useRef(0)
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const percentage = ((value - min) / (max - min)) * 100

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
    /** @type {{ preventDefault: () => void; clientX: import("preact/hooks").StateUpdater<number>; }} */ e,
  ) => {
    e.preventDefault()
    sliderRef.current?.focus()
    setIsDragging(true)
    setDragStartX(e.clientX)
    setStartValue(value)
  }

  const handleMouseMove = (/** @type {{ clientX: number; }} */ e) => {
    if (!isDragging) return

    let deltaX = e.clientX - dragStartX
    if (invert) deltaX = dragStartX - e.clientX

    const baseSensitivity = (max - min) / 200
    const adjustedSensitivity = baseSensitivity * sensitivity
    const newValue = Math.round(startValue + deltaX * adjustedSensitivity)

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
  }, [isDragging, dragStartX, startValue, value, invert, sensitivity])

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

  const handleKeyDown = (/** @type {{ key: string; preventDefault: () => void; }} */ e) => {
    if (e.key === "ArrowLeft") {
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
    } else if (e.key === "ArrowRight") {
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
    }
  }

  const handleKeyUp = (/** @type {{ key: string; }} */ e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
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

  const sizeClass =
    size === "sm" ? "slider-sm" : size === "lg" ? "slider-lg" : size === "xl" ? "slider-xl" : "slider-md"

  return (
    <div className="slider-container">
      {title && (
        <section
          className="slider-title"
          onMouseEnter={() => setIsLabelHovered(true)}
          onMouseLeave={() => setIsLabelHovered(false)}
          aria-label={`${title} slider`}
        >
          {title}
        </section>
      )}
      <div
        ref={sliderRef}
        className={`slider ${sizeClass} ${isDragging ? "dragging" : ""}`}
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
        <div className="slider-track">
          <div
            className={`slider-fill ${indicatorOffAtMin && value === min ? "off" : ""}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div
          className={`slider-thumb ${indicatorOffAtMin && value === min ? "off" : ""}`}
          style={{ left: `${10 + percentage * 0.8}%` }}
        ></div>
      </div>
      {showValueInput ? (
        <input
          type={formatValue ? "text" : "number"}
          className={`slider-input ${indicatorOffAtMin && value === min ? "off" : ""}`}
          value={inputValue ?? displayValue}
          min={min}
          max={max}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      ) : (
        <div className="slider-input-spacer" />
      )}
      {!showValueInput && (isHovered || isDragging) && (
        <div className="slider-popover">{formatValue ? formatValue(value) : value}</div>
      )}
      {description && isLabelHovered && <div className="slider-label-popover">{description}</div>}
    </div>
  )
}
