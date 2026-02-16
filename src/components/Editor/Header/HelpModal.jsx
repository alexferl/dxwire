import { onCleanup, onMount } from "solid-js"
import {
  DownloadIcon,
  GearIcon,
  ReceiveBankIcon,
  SendBankIcon,
  SendVoiceIcon,
  SettingsIcon,
  UploadIcon,
} from "../../Icons/index.jsx"
import "../style.css"

/**
 * @param {Object} props
 * @param {() => void} props.onClose
 */
export function HelpModal(props) {
  const onClose = () => props.onClose()

  onMount(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    onCleanup(() => {
      document.body.style.overflow = originalOverflow
    })
  })

  return (
    <section
      class="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault()
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        class="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onClose()
          }
        }}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
      >
        <div class="modal-header">
          <h2>Help</h2>
          <button type="button" class="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div class="modal-body">
          <h3>Bank & Voice Management</h3>
          <ul>
            <li>
              Click the <SettingsIcon size="sm" /> icon next to the bank selector to rename, delete, or reset banks
            </li>
            <li>
              Click the <SettingsIcon size="sm" /> icon next to the voice selector to initialize, rename, or copy voices
            </li>
            <li>
              Voice names are limited to <strong>10 characters</strong> (DX7 format limit)
            </li>
          </ul>

          <h3>MIDI</h3>
          <ul>
            <li>
              Select a <strong>MIDI output device</strong> to send/receive banks to/from your DX7
            </li>
            <li>
              <ReceiveBankIcon size="sm" /> <strong>Receive Bank</strong>: Receives a bank dump from the DX7 (32 voices)
            </li>
            <li>
              <SendBankIcon size="sm" /> <strong>Send Bank</strong>: Sends the full bank (32 voices) to the DX7
            </li>
            <li>
              <SendVoiceIcon size="sm" /> <strong>Send Voice</strong>: Sends a single voice - useful for devices like
              the KORG Volca FM that don't support bank transfers
            </li>
          </ul>

          <h3>Import / Export</h3>
          <ul>
            <li>
              <UploadIcon size="sm" /> Import banks from .syx or .json files
            </li>
            <li>
              <DownloadIcon size="sm" /> Export banks as .syx or .json
            </li>
          </ul>

          <h3>Settings</h3>
          <ul>
            <li>
              Click the <GearIcon size="sm" /> icon in the header to customize editor preferences
            </li>
          </ul>

          <h3>Algorithm Visualization</h3>
          <ul>
            <li>
              <span style={{ color: "#4caf50" }}>■</span> <strong>Green</strong> = Carrier (outputs sound)
            </li>
            <li>
              <span style={{ color: "#2196f3" }}>■</span> <strong>Blue</strong> = Modulator (modulates other operators)
            </li>
            <li>
              <span style={{ color: "#666" }}>■</span> <strong>Gray</strong> = Disabled operator
            </li>
            <li>Lines show connections between operators</li>
          </ul>

          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li>
              <kbd>↑</kbd> <kbd>↓</kbd> <kbd>Enter</kbd> Navigate menu items
            </li>
            <li>
              <kbd>Escape</kbd> Close menus and dialogs
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
