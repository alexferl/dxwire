import { useEffect } from "preact/hooks"
import "../style.css"

const settingsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    fill="currentColor"
    style="vertical-align: middle; margin: 0 2px;"
  >
    <title>Settings</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

const uploadIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    fill="currentColor"
    style="vertical-align: middle; margin: 0 2px;"
  >
    <title>Upload</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
)

const downloadIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    fill="currentColor"
    style="vertical-align: middle; margin: 0 2px;"
  >
    <title>Download</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
  </svg>
)

const sendBankIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    fill="currentColor"
    style="vertical-align: middle; margin: 0 2px;"
  >
    <title>Send bank</title>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

const sendVoiceIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    fill="currentColor"
    style="vertical-align: middle; margin: 0 2px;"
  >
    <title>Send voice</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
  </svg>
)

const receiveBankIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    fill="currentColor"
    style="vertical-align: middle; margin: 0 2px;"
  >
    <title>Receive bank</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
  </svg>
)

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
            <li>Click the {settingsIcon} icon next to the bank selector to rename, delete, or reset banks</li>
            <li>Click the {settingsIcon} icon next to the voice selector to initialize, rename, or copy voices</li>
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
              {receiveBankIcon} <strong>Receive Bank</strong>: Receives a bank dump from the DX7 (32 voices)
            </li>
            <li>
              {sendBankIcon} <strong>Send Bank</strong>: Sends the full bank (32 voices) to the DX7
            </li>
            <li>
              {sendVoiceIcon} <strong>Send Voice</strong>: Sends a single voice - useful for devices like the KORG Volca
              FM that don't support bank transfers
            </li>
          </ul>

          <h3>Import / Export</h3>
          <ul>
            <li>{uploadIcon} Import banks from .syx or .json files</li>
            <li>{downloadIcon} Export banks as .syx or .json</li>
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
