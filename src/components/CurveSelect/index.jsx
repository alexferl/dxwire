import { useEffect, useRef, useState } from "preact/hooks"
import "./style.css"

const Curves = {
  linNeg: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Linear negative curve">
      <title>Linear negative curve</title>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,12 24,0" />
    </svg>
  ),
  linNegMirrored: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Linear negative mirrored curve">
      <title>Linear negative mirrored curve</title>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,0 24,12" />
    </svg>
  ),
  expNeg: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Exponential negative curve">
      <title>Exponential negative curve</title>
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M0,12 Q0,0 24,0" />
    </svg>
  ),
  expNegMirrored: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Exponential negative mirrored curve">
      <title>Exponential negative mirrored curve</title>
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M0,0 Q24,0 24,12" />
    </svg>
  ),
  expPos: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Exponential positive curve">
      <title>Exponential positive curve</title>
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M0,0 Q24,0 24,12" />
    </svg>
  ),
  expPosMirrored: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Exponential positive mirrored curve">
      <title>Exponential positive mirrored curve</title>
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M0,12 Q0,0 24,0" />
    </svg>
  ),
  linPos: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Linear positive curve">
      <title>Linear positive curve</title>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,0 24,12" />
    </svg>
  ),
  linPosMirrored: () => (
    <svg viewBox="0 0 24 12" className="curve-icon" role="img" aria-label="Linear positive mirrored curve">
      <title>Linear positive mirrored curve</title>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,12 24,0" />
    </svg>
  ),
}

const CURVE_OPTIONS_NORMAL = [
  { name: "-LIN", icon: Curves.linNeg },
  { name: "-EXP", icon: Curves.expNeg },
  { name: "+EXP", icon: Curves.expPos },
  { name: "+LIN", icon: Curves.linPos },
]

const CURVE_OPTIONS_MIRRORED = [
  { name: "-LIN", icon: Curves.linNegMirrored },
  { name: "-EXP", icon: Curves.expNegMirrored },
  { name: "+EXP", icon: Curves.expPosMirrored },
  { name: "+LIN", icon: Curves.linPosMirrored },
]

/**
 * A curve selector component for Keyboard Level Scaling
 * Shows curve icons for L Curve and R Curve selection
 *
 * @param {Object} props
 * @param {string} props.title - Label above the select
 * @param {number} props.value - Current selected index (0-3)
 * @param {function} props.onChange - Callback when selection changes
 * @param {string} [props.description] - Tooltip description
 * @param {string} [props.size="md"] - Size: "sm" | "md" | "lg" | "xl"
 * @param {string} [props.side="left"] - Which side: "left" | "right" (right mirrors the curves)
 */
export function CurveSelect({ title, value, onChange, description = "", size = "md", side = "left" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)

  const sizeClass =
    size === "sm"
      ? "curve-select-sm"
      : size === "lg"
        ? "curve-select-lg"
        : size === "xl"
          ? "curve-select-xl"
          : "curve-select-md"

  const curveOptions = side === "right" ? CURVE_OPTIONS_MIRRORED : CURVE_OPTIONS_NORMAL
  const selectedOption = curveOptions[value] || curveOptions[0]
  const SelectedIcon = selectedOption.icon

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handlePrev = () => {
    const newValue = value > 0 ? value - 1 : curveOptions.length - 1
    onChange(newValue)
  }

  const handleNext = () => {
    const newValue = value < curveOptions.length - 1 ? value + 1 : 0
    onChange(newValue)
  }

  const handleSelect = (index) => {
    onChange(index)
    setIsOpen(false)
  }

  return (
    <section
      ref={containerRef}
      class={`curve-select-container ${sizeClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={title || "Curve"}
    >
      {title && <div class="curve-select-title">{title}</div>}

      <button
        type="button"
        class={`curve-select-display ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(!isOpen)
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            handlePrev()
          } else if (e.key === "ArrowDown") {
            e.preventDefault()
            handleNext()
          }
        }}
      >
        <span class="curve-select-value">
          <SelectedIcon />
        </span>
        <span class="curve-select-arrow">▼</span>
      </button>

      {isOpen && (
        <div class="curve-select-dropdown" role="listbox">
          {curveOptions.map((option, index) => {
            const IconComponent = option.icon
            return (
              <button
                type="button"
                key={index}
                class={`curve-select-option ${index === value ? "selected" : ""}`}
                onClick={() => handleSelect(index)}
                title={option.name}
                role="option"
                aria-selected={index === value}
              >
                <IconComponent />
                <span class="curve-select-option-name">{option.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {description && isHovered && !isOpen && <div class="curve-select-tooltip">{description}</div>}
    </section>
  )
}
