import { Knob } from "@/src/components/Knob"
import { useVoice } from "../index"

/**
 * Pitch Envelope Generator (Pitch EG) editor component.
 * Controls for the 4-stage pitch envelope (rates R1-R4 and levels L1-L4).
 * @returns {import("solid-js").JSX.Element}
 */
export function PitchEG() {
  const voice = useVoice()

  return (
    <div class="pitch-eg-section">
      <div class="pitch-eg-knobs-level">
        <Knob
          title="L1"
          description="Pitch EG Level 1"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.level1[0]()}
          onChange={(v) => {
            voice.pitchEG.level1[1](v)
          }}
        />
        <Knob
          title="L2"
          description="Pitch EG Level 2"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.level2[0]()}
          onChange={(v) => {
            voice.pitchEG.level2[1](v)
          }}
        />
        <Knob
          title="L3"
          description="Pitch EG Level 3"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.level3[0]()}
          onChange={(v) => {
            voice.pitchEG.level3[1](v)
          }}
        />
        <Knob
          title="L4"
          description="Pitch EG Level 4"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.level4[0]()}
          onChange={(v) => {
            voice.pitchEG.level4[1](v)
          }}
        />
      </div>
      <div class="pitch-eg-knobs-rate">
        <Knob
          title="R1"
          description="Pitch EG Rate 1"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.rate1[0]()}
          onChange={(v) => {
            voice.pitchEG.rate1[1](v)
          }}
        />
        <Knob
          title="R2"
          description="Pitch EG Rate 2"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.rate2[0]()}
          onChange={(v) => {
            voice.pitchEG.rate2[1](v)
          }}
        />
        <Knob
          title="R3"
          description="Pitch EG Rate 3"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.rate3[0]()}
          onChange={(v) => {
            voice.pitchEG.rate3[1](v)
          }}
        />
        <Knob
          title="R4"
          description="Pitch EG Rate 4"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="sm"
          value={voice.pitchEG.rate4[0]()}
          onChange={(v) => {
            voice.pitchEG.rate4[1](v)
          }}
        />
      </div>
    </div>
  )
}
