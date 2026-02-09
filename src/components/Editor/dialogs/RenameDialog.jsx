import { useEffect, useRef, useState } from "preact/hooks"
import "./style.css"

/**
 * Rename dialog component.
 * @param {Object} props
 * @param {string} props.currentName - Current name
 * @param {string} props.title - Dialog title
 * @param {(newName: string) => void} props.onConfirm - Callback when confirmed
 * @param {() => void} props.onCancel - Callback when cancelled
 * @returns {import("preact").VNode}
 */
export function RenameDialog({ currentName, title, onConfirm, onCancel }) {
  const [name, setName] = useState(currentName)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onConfirm(name.trim())
    }
  }

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
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Name"
            class="rename-input"
            maxLength={10}
          />
          <div class="rename-buttons">
            <button type="submit" class="rename-confirm">
              Rename
            </button>
            <button type="button" class="rename-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
