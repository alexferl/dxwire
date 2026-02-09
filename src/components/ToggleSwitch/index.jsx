import { useRef, useState } from "preact/hooks"
import "./style.css"

/**
 * A toggle switch component similar to Dexed with state indicators.
 *
 * Supports two modes:
 * 1. Single option: Title above, toggle in middle, indicator on right
 * 2. Dual options: Two options with indicators on each side, switch in middle
 *
 * @param {Object} props - Component props
 * @param {boolean} props.value - Current state (true = on/first option, false = off/second option)
 * @param {function} props.onChange - Callback when toggle changes: (newValue) => void
 * @param {string} [props.title=""] - Title for single option mode
 * @param {string} [props.option1="ON"] - First option label for dual mode
 * @param {string} [props.option2="OFF"] - Second option label for dual mode
 * @param {string} [props.description=""] - Extended description shown in popover
 * @param {string} [props.size="md"] - Size of the toggle: "sm" | "md" | "lg" | "xl"
 *
 * @returns {import("preact").JSX.Element} The rendered toggle switch component
 *
 * @example
 * // Single option mode (on/off with indicator)
 * <ToggleSwitch
 *   value={isEnabled}
 *   onChange={setIsEnabled}
 *   title="Enable Effect"
 * />
 *
 * @example
 * // Dual option mode (choose between two values)
 * <ToggleSwitch
 *   value={mode}
 *   onChange={setMode}
 *   option1="Rate"
 *   option2="Level"
 *   description="Select EG Edit Mode"
 *   size="lg"
 * />
 */
export function ToggleSwitch({
  value,
  onChange,
  title = "",
  option1 = "",
  option2 = "",
  description = "",
  size = "md",
}) {
  const [isLabelHovered, setIsLabelHovered] = useState(false)
  const dualToggleRef = useRef(null)
  const singleToggleRef = useRef(null)

  const handleToggle = () => {
    onChange(!value)
  }

  const handleKeyDown = (/** @type {{ key: string; preventDefault: () => void; }} */ e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      handleToggle()
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      const newValue = e.key === "ArrowRight" || e.key === "ArrowDown"
      if (newValue !== value) {
        onChange(newValue)
      }
    }
  }

  const sizeClass =
    size === "sm" ? "toggle-sm" : size === "lg" ? "toggle-lg" : size === "xl" ? "toggle-xl" : "toggle-md"

  const isDualMode = option1 && option2

  return (
    <div className="toggle-container">
      {isDualMode ? (
        <div className="toggle-dual-container">
          <div className="toggle-side-group">
            <div className="toggle-dual-label">{option1}</div>
            <div className={`toggle-side-indicator ${value ? "" : "on"}`} />
          </div>
          <div
            ref={dualToggleRef}
            className={`toggle-switch ${sizeClass} ${value ? "on" : "off"}`}
            onClick={handleToggle}
            onMouseDown={() => dualToggleRef.current?.focus()}
            role="switch"
            aria-checked={value}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div className="toggle-track">
              <div className="toggle-3d-left" />
              <div className="toggle-3d-right" />
            </div>
          </div>
          <div className="toggle-side-group">
            <div className="toggle-dual-label">{option2}</div>
            <div className={`toggle-side-indicator ${value ? "on" : ""}`} />
          </div>
        </div>
      ) : (
        <div className="toggle-single-wrapper">
          {title && (
            <section
              className="toggle-title"
              onMouseEnter={() => setIsLabelHovered(true)}
              onMouseLeave={() => setIsLabelHovered(false)}
              aria-label={`${title} toggle`}
            >
              {title}
            </section>
          )}
          <div className="toggle-single-row">
            <div
              ref={singleToggleRef}
              className={`toggle-switch ${sizeClass} ${value ? "on" : "off"}`}
              onClick={handleToggle}
              onMouseDown={() => singleToggleRef.current?.focus()}
              role="switch"
              aria-checked={value}
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <div className="toggle-track">
                <div className="toggle-3d-left" />
                <div className="toggle-3d-right" />
              </div>
            </div>
            <div className={`toggle-side-indicator ${value ? "on" : ""}`} />
          </div>
        </div>
      )}
      {description && isLabelHovered && <div className="toggle-label-popover">{description}</div>}
    </div>
  )
}
