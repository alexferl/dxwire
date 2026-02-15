import { EnvelopeGraph } from "@/src/components/EnvelopeGraph"
import { useVoice } from "../index"

/**
 * Waveform display component.
 * Visualizes the pitch envelope generator as a waveform graph.
 * @returns {import("solid-js").JSX.Element}
 */
export function WaveformDisplay() {
  const voice = useVoice()

  return (
    <div class="waveform-display">
      <EnvelopeGraph
        type="pitch"
        levels={[
          voice.pitchEG.level1[0](),
          voice.pitchEG.level2[0](),
          voice.pitchEG.level3[0](),
          voice.pitchEG.level4[0](),
        ]}
        rates={[voice.pitchEG.rate1[0](), voice.pitchEG.rate2[0](), voice.pitchEG.rate3[0](), voice.pitchEG.rate4[0]()]}
        showADSR={voice.settings[0]().showADSR}
      />
    </div>
  )
}
