import { useMIDI } from "../Editor/context/MIDIContext.jsx"
import "./style.css"

/**
 * MIDI device selector component.
 * Displays dropdowns for MIDI input/output device selection with connection status indicators.
 * @returns {import("solid-js").JSX.Element}
 */
export function MIDIDeviceSelector() {
  const midi = useMIDI()

  /**
   * Gets the status indicator dot for a device connection state.
   * Status classes: "" = gray (neutral), "connected" = green, "disconnected" = red
   * @param {() => string} statusGetter - Getter function for connection status
   * @returns {import("solid-js").JSX.Element} Status dot element
   */
  function getStatusDot(statusGetter) {
    return <span class={`status-dot ${statusGetter()}`}></span>
  }

  return (
    <div class="midi-selector">
      <div class="midi-group">
        <label for="output-select">MIDI Output {getStatusDot(() => midi.outputStatus)}</label>
        <select id="output-select">
          <option value="">Select a device</option>
        </select>
      </div>

      <div class="midi-group">
        <label for="input-select">MIDI Input {getStatusDot(() => midi.inputStatus)}</label>
        <select id="input-select">
          <option value="">Select a device</option>
        </select>
      </div>
    </div>
  )
}
