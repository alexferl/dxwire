import { Knob } from "@/src/components/Knob"
import { useVoice } from "../index"

/**
 * General section component.
 * Controls for algorithm selection, feedback amount, and transpose settings.
 * @returns {import("solid-js").JSX.Element}
 */
export function General() {
  const voice = useVoice()

  return (
    <div class="feedback-section">
      <div class="feedback-knobs">
        <Knob
          title="Algo"
          description="Alogrithm"
          min={1}
          max={32}
          showValueInput={voice.settings[0]().showValueInputs}
          size="lg"
          value={voice.global.algorithm[0]()}
          onChange={(v) => {
            voice.global.algorithm[1](v)
          }}
        />
        <Knob
          title="Feed"
          description="Feedback"
          min={0}
          max={7}
          indicatorOffAtMin={true}
          showValueInput={voice.settings[0]().showValueInputs}
          size="lg"
          value={voice.global.feedback[0]()}
          onChange={(v) => {
            voice.global.feedback[1](v)
          }}
        />
        <Knob
          title="Trans"
          description="Transpose"
          min={-24}
          max={24}
          showValueInput={voice.settings[0]().showValueInputs}
          size="lg"
          value={voice.global.transpose[0]() - 24}
          onChange={(v) => {
            voice.global.transpose[1](v + 24)
          }}
        />
      </div>
    </div>
  )
}
