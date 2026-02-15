import { createSignal } from "solid-js"
import "./style.css"

/**
 * Copy voice dialog component.
 * @param {Object} props
 * @param {string[]} props.voiceNames - Array of voice names
 * @param {number} props.currentIndex - Current voice index
 * @param {(toIndex: number) => void} props.onConfirm - Callback when confirmed
 * @param {() => void} props.onCancel - Callback when cancelled
 * @returns {import("solid-js").JSX.Element}
 */
export function CopyVoiceDialog(props) {
  const { voiceNames, currentIndex, onConfirm, onCancel } = props
  const [selectedSlot, setSelectedSlot] = createSignal(currentIndex)

  return (
    <section
      class="slot-dialog-overlay"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault()
          onCancel()
        }
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        class="slot-dialog"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onCancel()
          }
        }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <h3>Copy Voice to Slot</h3>
        <div class="slot-grid">
          {Array.from({ length: 32 }, (_, i) => (
            <button
              type="button"
              class={`slot-button ${i === selectedSlot() ? "current" : ""} ${i === currentIndex ? "source" : ""}`}
              onClick={() => setSelectedSlot(i)}
              title={voiceNames[i] || "Empty"}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div class="copy-dialog-buttons">
          <button
            type="button"
            class="copy-confirm"
            onClick={() => onConfirm(selectedSlot())}
            disabled={selectedSlot() === currentIndex}
          >
            Copy
          </button>
          <button type="button" class="copy-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}
