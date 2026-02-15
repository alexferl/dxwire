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
export function RidgedSwitch(props) {
  const sizeClass = () => {
    if (props.size === "sm") return "ridged-sm"
    if (props.size === "lg") return "ridged-lg"
    if (props.size === "xl") return "ridged-xl"
    return "ridged-md"
  }
  const handleClick = () => {
    props.onChange(!props.value)
  }

  return (
    <div
      class={`ridged-switch ${sizeClass()} ${props.value ? "on" : "off"}`}
      onClick={handleClick}
      role="switch"
      aria-checked={props.value}
      aria-label={props.description}
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
