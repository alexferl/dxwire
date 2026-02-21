import { onCleanup, onMount } from "solid-js"
import "./style.css"

/**
 * Reusable Modal component with overlay, header, and body sections.
 * @param {Object} props
 * @param {string} props.title - Modal title (optional, no header if not provided)
 * @param {() => void} props.onClose - Callback when modal is closed
 * @param {import("solid-js").JSX.Element} props.children - Modal content
 * @param {string} [props.size="medium"] - Modal size: "small", "medium", "large"
 * @returns {import("solid-js").JSX.Element}
 */
export function Modal(props) {
  const { title, onClose, children, size = "medium" } = props

  onMount(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    onCleanup(() => {
      document.body.style.overflow = originalOverflow
    })
  })

  const handleOverlayClick = () => {
    onClose()
  }

  const handleOverlayKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  const handleContentClick = (e) => {
    e.stopPropagation()
  }

  const sizeClass = `modal-content--${size}`

  return (
    <section
      class="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        class={`modal-content ${sizeClass}`}
        onClick={handleContentClick}
        onKeyDown={handleOverlayKeyDown}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
      >
        {title && (
          <div class="modal-header">
            <h2>{title}</h2>
            <button type="button" class="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <div class="modal-body">{children}</div>
      </div>
    </section>
  )
}
