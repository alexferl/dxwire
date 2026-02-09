import { useMIDI } from "../Editor/context/MIDIContext.jsx"
import "./style.css"

/**
 * MIDI device selector component.
 * Displays dropdowns for MIDI input/output device selection with connection status indicators.
 * @returns {import("preact").VNode}
 */
export function MIDIDeviceSelector() {
  const { outputStatus, inputStatus } = useMIDI()

  /**
   * Gets the status indicator dot for a device connection state.
   * Status classes: "" = gray (neutral), "connected" = green, "disconnected" = red
   * @param {string} status - Connection status string
   * @returns {import("preact").VNode} Status dot element
   */
  function getStatusDot(status) {
    return <span className={`status-dot ${status}`}></span>
  }

  return (
    <div className="midi-selector">
      <div className="midi-group">
        <label htmlFor="output-select">MIDI Output {getStatusDot(outputStatus)}</label>
        <select id="output-select">
          <option value="">Select a device</option>
        </select>
      </div>

      <div className="midi-group">
        <label htmlFor="input-select">MIDI Input {getStatusDot(inputStatus)}</label>
        <select id="input-select">
          <option value="">Select a device</option>
        </select>
      </div>
    </div>
  )
}
