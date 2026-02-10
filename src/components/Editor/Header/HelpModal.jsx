import { useEffect } from "preact/hooks"
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
export function HelpModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

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
