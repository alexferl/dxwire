import { Knob } from "@/src/components/Knob"
import { useVoice } from "../index"

/**
 * General section component.
 * Controls for algorithm selection, feedback amount, and transpose settings.
 * @returns {import("preact").VNode}
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
          showValueInput={true}
          size="lg"
          value={voice.global.algorithm.value}
          onChange={(v) => {
            voice.global.algorithm.value = v
          }}
        />
        <Knob
          title="Feed"
          description="Feedback"
          min={0}
          max={7}
          indicatorOffAtMin={true}
          showValueInput={true}
          size="lg"
          value={voice.global.feedback.value}
          onChange={(v) => {
            voice.global.feedback.value = v
          }}
        />
        <Knob
          title="Trans"
          description="Transpose"
          min={-24}
          max={24}
          showValueInput={true}
          size="lg"
          value={voice.global.transpose.value - 24}
          onChange={(v) => {
            voice.global.transpose.value = v + 24
          }}
        />
      </div>
    </div>
  )
}
