import { createSignal, For, onCleanup, onMount } from "solid-js"
import "./style.css"

const Waveforms = {
  triangle: () => (
    <svg viewBox="0 0 24 12" class="waveform-icon" role="img" aria-label="Triangle wave">
      <title>Triangle wave</title>
      <polyline fill="none" stroke="currentColor" stroke-width="1.5" points="0,6 6,0 12,6 18,12 24,6" />
    </svg>
  ),
  sawDown: () => (
    <svg viewBox="0 0 24 12" class="waveform-icon" role="img" aria-label="Saw down wave">
      <title>Saw down wave</title>
      <polyline fill="none" stroke="currentColor" stroke-width="1.5" points="0,0 24,12 24,0" />
    </svg>
  ),
  sawUp: () => (
    <svg viewBox="0 0 24 12" class="waveform-icon" role="img" aria-label="Saw up wave">
      <title>Saw up wave</title>
      <polyline fill="none" stroke="currentColor" stroke-width="1.5" points="0,12 0,0 24,12" />
    </svg>
  ),
  square: () => (
    <svg viewBox="0 0 24 12" class="waveform-icon" role="img" aria-label="Square wave">
      <title>Square wave</title>
      <polyline fill="none" stroke="currentColor" stroke-width="1.5" points="0,12 0,0 12,0 12,12 24,12 24,0" />
    </svg>
  ),
  sine: () => (
    <svg viewBox="0 0 24 12" class="waveform-icon" role="img" aria-label="Sine wave">
      <title>Sine wave</title>
      <path fill="none" stroke="currentColor" stroke-width="1.5" d="M0,6 Q6,0 12,6 T24,6" />
    </svg>
  ),
  sampleHold: () => (
    <svg viewBox="0 0 24 12" class="waveform-icon" role="img" aria-label="Sample and hold wave">
      <title>Sample and hold wave</title>
      <polyline
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        points="0,3 4,3 4,9 8,9 8,2 12,2 12,10 16,10 16,4 20,4 20,8 24,8"
      />
    </svg>
  ),
}

const WAVE_OPTIONS = [
  { name: "Triangle", icon: Waveforms.triangle },
  { name: "Saw Down", icon: Waveforms.sawDown },
  { name: "Saw Up", icon: Waveforms.sawUp },
  { name: "Square", icon: Waveforms.square },
  { name: "Sine", icon: Waveforms.sine },
  { name: "S&H", icon: Waveforms.sampleHold },
]

/**
 * A waveform selector component like in Dexed
 * Shows waveform icons for LFO wave selection
 *
 * @param {Object} props
 * @param {string} [props.title] - Label above the select
 * @param {number} props.value - Current selected index (0-5)
 * @param {function} props.onChange - Callback when selection changes
 * @param {string} [props.description] - Tooltip description
 * @param {string} [props.size="md"] - Size: "sm" | "md" | "lg" | "xl"
 */
export function WaveSelect(props) {
  const { onChange, description = "" } = props

  const [isOpen, setIsOpen] = createSignal(false)
  const [isHovered, setIsHovered] = createSignal(false)
  let containerRef

  const sizeClass = () => {
    if (props.size === "sm") return "wave-select-sm"
    if (props.size === "lg") return "wave-select-lg"
    if (props.size === "xl") return "wave-select-xl"
    return "wave-select-md"
  }

  const selectedOption = () => WAVE_OPTIONS[props.value] || WAVE_OPTIONS[0]

  onMount(() => {
    const handleClickOutside = (e) => {
      if (containerRef && !containerRef.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside))
  })

  const handlePrev = () => {
    const newValue = props.value > 0 ? props.value - 1 : WAVE_OPTIONS.length - 1
    onChange(newValue)
  }

  const handleNext = () => {
    const newValue = props.value < WAVE_OPTIONS.length - 1 ? props.value + 1 : 0
    onChange(newValue)
  }

  const handleSelect = (index) => {
    onChange(index)
    setIsOpen(false)
  }

  return (
    <section
      ref={containerRef}
      class={`wave-select-container ${sizeClass()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={props.title || "Wave"}
    >
      {props.title && <div class="wave-select-title">{props.title}</div>}

      <button
        type="button"
        class={`wave-select-display ${isOpen() ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(!isOpen())
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            handlePrev()
          } else if (e.key === "ArrowDown") {
            e.preventDefault()
            handleNext()
          }
        }}
      >
        <span class="wave-select-value">
          {(() => {
            const Icon = selectedOption().icon
            return <Icon />
          })()}
        </span>
        <span class="wave-select-arrow">▼</span>
      </button>

      {isOpen() && (
        <div class="wave-select-dropdown">
          <For each={WAVE_OPTIONS}>
            {(option, index) => {
              const IconComponent = option.icon
              return (
                <button
                  type="button"
                  class={`wave-select-option ${index() === props.value ? "selected" : ""}`}
                  onClick={() => handleSelect(index())}
                  title={option.name}
                >
                  <IconComponent />
                  <span class="wave-select-option-name">{option.name}</span>
                </button>
              )
            }}
          </For>
        </div>
      )}

      {description && isHovered() && !isOpen() && <div class="wave-select-tooltip">{description}</div>}
    </section>
  )
}
