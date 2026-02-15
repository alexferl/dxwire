import { createSignal } from "solid-js"
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
 * @returns {import("solid-js").JSX.Element} The rendered toggle switch component
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
export function ToggleSwitch(props) {
  const { onChange } = props

  const [isLabelHovered, setIsLabelHovered] = createSignal(false)
  /** @type {HTMLDivElement | undefined} */
  let dualToggleRef
  /** @type {HTMLDivElement | undefined} */
  let singleToggleRef

  const handleToggle = () => {
    onChange(!props.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      handleToggle()
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      const newValue = e.key === "ArrowRight" || e.key === "ArrowDown"
      if (newValue !== props.value) {
        onChange(newValue)
      }
    }
  }

  const sizeClass = () => {
    if (props.size === "sm") return "toggle-sm"
    if (props.size === "lg") return "toggle-lg"
    if (props.size === "xl") return "toggle-xl"
    return "toggle-md"
  }

  const isDualMode = () => props.option1 && props.option2

  return (
    <div class="toggle-container">
      {isDualMode() ? (
        <div class="toggle-dual-container">
          <div class="toggle-side-group">
            <div class="toggle-dual-label">{props.option1}</div>
            <div class={`toggle-side-indicator ${props.value ? "" : "on"}`} />
          </div>
          <div
            ref={dualToggleRef}
            class={`toggle-switch ${sizeClass()} ${props.value ? "on" : "off"}`}
            onClick={handleToggle}
            onMouseDown={() => dualToggleRef?.focus()}
            role="switch"
            aria-checked={props.value}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div class="toggle-track">
              <div class="toggle-3d-left" />
              <div class="toggle-3d-right" />
            </div>
          </div>
          <div class="toggle-side-group">
            <div class="toggle-dual-label">{props.option2}</div>
            <div class={`toggle-side-indicator ${props.value ? "on" : ""}`} />
          </div>
        </div>
      ) : (
        <div class="toggle-single-wrapper">
          {props.title && (
            <section
              class="toggle-title"
              onMouseEnter={() => setIsLabelHovered(true)}
              onMouseLeave={() => setIsLabelHovered(false)}
              aria-label={`${props.title} toggle`}
            >
              {props.title}
            </section>
          )}
          <div class="toggle-single-row">
            <div
              ref={singleToggleRef}
              class={`toggle-switch ${sizeClass()} ${props.value ? "on" : "off"}`}
              onClick={handleToggle}
              onMouseDown={() => singleToggleRef?.focus()}
              role="switch"
              aria-checked={props.value}
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <div class="toggle-track">
                <div class="toggle-3d-left" />
                <div class="toggle-3d-right" />
              </div>
            </div>
            <div class={`toggle-side-indicator ${props.value ? "on" : ""}`} />
          </div>
        </div>
      )}
      {props.description && isLabelHovered() && <div class="toggle-label-popover">{props.description}</div>}
    </div>
  )
}
