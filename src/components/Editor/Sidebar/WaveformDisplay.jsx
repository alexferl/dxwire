import { EnvelopeGraph } from "@/src/components/EnvelopeGraph"
import { useVoice } from "../index"

/**
 * Waveform display component.
 * Visualizes the pitch envelope generator as a waveform graph.
 * @returns {import("preact").VNode}
 */
export function WaveformDisplay() {
  const voice = useVoice()

  return (
    <div class="waveform-display">
      <EnvelopeGraph
        type="pitch"
        levels={[
          voice.pitchEG.level1.value,
          voice.pitchEG.level2.value,
          voice.pitchEG.level3.value,
          voice.pitchEG.level4.value,
        ]}
        rates={[
          voice.pitchEG.rate1.value,
          voice.pitchEG.rate2.value,
          voice.pitchEG.rate3.value,
          voice.pitchEG.rate4.value,
        ]}
        showADSR={voice.settings.value.showADSR}
      />
    </div>
  )
}
