import { Modal } from "../../Modal/index.jsx"

/**
 * Dialog component for handling unsaved changes confirmation.
 * Allows users to save, discard, or cancel when navigating away with unsaved changes.
 * @param {Object} props
 * @param {() => void} props.onSave - Callback when user chooses to save
 * @param {() => void} props.onDiscard - Callback when user chooses to discard
 * @param {() => void} props.onCancel - Callback when user chooses to cancel
 * @returns {import("solid-js").JSX.Element}
 */
export function UnsavedChangesDialog(props) {
  return (
    <Modal title="Unsaved Changes" onClose={props.onCancel} size="small">
      <p>You have unsaved changes to the current voice.</p>
      <p>What would you like to do?</p>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
          "margin-top": "20px",
        }}
      >
        <button
          type="button"
          class="dialog-btn dialog-btn-primary"
          onClick={props.onSave}
          style={{
            padding: "12px 16px",
            background: "#00aaaa",
            border: "none",
            "border-radius": "4px",
            color: "#fff",
            "font-size": "14px",
            cursor: "pointer",
            "font-weight": "500",
          }}
        >
          Save to Current Slot
        </button>
        <button
          type="button"
          class="dialog-btn"
          onClick={props.onDiscard}
          style={{
            padding: "12px 16px",
            background: "#4a4a4a",
            border: "1px solid #555",
            "border-radius": "4px",
            color: "#fff",
            "font-size": "14px",
            cursor: "pointer",
          }}
        >
          Discard Changes
        </button>
        <button
          type="button"
          class="dialog-btn"
          onClick={props.onCancel}
          style={{
            padding: "12px 16px",
            background: "transparent",
            border: "1px solid #555",
            "border-radius": "4px",
            color: "#aaa",
            "font-size": "14px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}
