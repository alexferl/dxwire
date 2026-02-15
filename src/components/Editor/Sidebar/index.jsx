import { Algorithm } from "./Algorithm.jsx"
import { General } from "./General.jsx"
import { LFO } from "./LFO.jsx"
import { PitchEG } from "./PitchEG.jsx"
import { WaveformDisplay } from "./WaveformDisplay.jsx"
import "./style.css"

/**
 * Sidebar component for the Editor.
 * Contains Algorithm, General, WaveformDisplay, PitchEG, and LFO sections.
 * @returns {import("solid-js").JSX.Element}
 */
export function Sidebar() {
  return (
    <div class="left-column">
      <Algorithm />
      <General />
      <WaveformDisplay />
      <PitchEG />
      <LFO />
    </div>
  )
}
