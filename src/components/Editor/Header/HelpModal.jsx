import {
  DownloadIcon,
  GearIcon,
  ReceiveBankIcon,
  SaveIcon,
  SendBankIcon,
  SendVoiceIcon,
  SettingsIcon,
  UploadIcon,
} from "../../Icons/index.jsx"
import { Modal } from "../../Modal/index.jsx"
import "../style.css"

/**
 * @param {Object} props
 * @param {() => void} props.onClose
 */
export function HelpModal(props) {
  return (
    <Modal title="Help" onClose={props.onClose} size="medium">
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
          <SendVoiceIcon size="sm" /> <strong>Send Voice</strong>: Sends a single voice - useful for devices like the
          KORG Volca FM that don't support bank transfers
        </li>
      </ul>

      <h3>Saving Changes</h3>
      <ul>
        <li>
          The <strong>save indicator</strong> shows the current state: <span style={{ color: "#888" }}>No changes</span>{" "}
          (gray), <span style={{ color: "#ffaa44" }}>Unsaved changes</span> (orange), or{" "}
          <span style={{ color: "#66cc66" }}>Saved</span> (green)
        </li>
        <li>
          <SaveIcon size="sm" /> <strong>Save</strong> button saves the current voice to the selected bank slot
        </li>
        <li>You will be prompted to save or discard changes when switching voices/banks with unsaved changes</li>
        <li>Closing or refreshing the page with unsaved changes will show a browser confirmation</li>
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
          <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>S</kbd> Save current voice
        </li>
        <li>
          <kbd>↑</kbd> <kbd>↓</kbd> <kbd>Enter</kbd> Navigate menu items
        </li>
        <li>
          <kbd>Escape</kbd> Close menus and dialogs
        </li>
      </ul>
    </Modal>
  )
}
