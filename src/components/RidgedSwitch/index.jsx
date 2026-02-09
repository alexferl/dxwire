import "./style.css"

/**
 * A small ridged toggle switch like those on toy electronics
 * No labels, no indicators - just a tactile toggle
 *
 * @param {Object} props
 * @param {boolean} props.value - Current state (true = on, false = off)
 * @param {function} props.onChange - Callback when toggled
 * @param {string} [props.description] - Accessibility description
 * @param {string} [props.size="md"] - Size of the switch: "sm" | "md" | "lg" | "xl"
 */
export function RidgedSwitch({ value, onChange, description = "", size = "md" }) {
  const sizeClass =
    size === "sm" ? "ridged-sm" : size === "lg" ? "ridged-lg" : size === "xl" ? "ridged-xl" : "ridged-md"
  const handleClick = () => {
    onChange(!value)
  }

  return (
    <div
      class={`ridged-switch ${sizeClass} ${value ? "on" : "off"}`}
      onClick={handleClick}
      role="switch"
      aria-checked={value}
      aria-label={description}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div class="ridged-switch-track">
        <div class="ridged-switch-thumb">
          <div class="ridged-switch-ridges" />
        </div>
      </div>
    </div>
  )
}
