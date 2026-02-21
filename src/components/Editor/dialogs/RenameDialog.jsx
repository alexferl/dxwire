import { createSignal, onMount } from "solid-js"
import { Modal } from "../../Modal/index.jsx"
import "./style.css"

/**
 * Rename dialog component.
 * @param {Object} props
 * @param {string} props.currentName - Current name
 * @param {string} props.title - Dialog title
 * @param {(newName: string) => void} props.onConfirm - Callback when confirmed
 * @param {() => void} props.onCancel - Callback when cancelled
 * @returns {import("solid-js").JSX.Element}
 */
export function RenameDialog(props) {
  const { currentName, title, onConfirm, onCancel } = props
  const [name, setName] = createSignal(currentName)
  /** @type {HTMLInputElement | undefined} */
  let inputRef

  onMount(() => {
    if (inputRef) {
      inputRef.focus()
      inputRef.select()
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = name().trim()
    if (trimmedName) {
      onConfirm(trimmedName)
    }
  }

  return (
    <Modal title={title} onClose={onCancel} size="small">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={name()}
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
    </Modal>
  )
}
