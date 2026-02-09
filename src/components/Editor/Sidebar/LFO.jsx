import { Knob } from "@/src/components/Knob"
import { ToggleSwitch } from "@/src/components/ToggleSwitch"
import { WaveSelect } from "@/src/components/WaveSelect"
import { useVoice } from "../index"

/**
 * Low Frequency Oscillator (LFO) editor component.
 * Controls for LFO speed, delay, modulation depth, and sync settings.
 * @returns {import("preact").VNode}
 */
export function LFO() {
  const voice = useVoice()

  return (
    <div class="lfo-section">
      <div class="lfo-row lfo-row-wave">
        <WaveSelect
          title="Wave"
          description="LFO Waveform"
          value={voice.lfo.wave.value}
          onChange={(v) => {
            voice.lfo.wave.value = v
          }}
          size="xl"
        />
      </div>
      <div class="lfo-row lfo-row-main">
        <Knob
          title="Speed"
          description="LFO Speed"
          min={0}
          max={99}
          showValueInput={true}
          size="lg"
          value={voice.lfo.speed.value}
          onChange={(v) => {
            voice.lfo.speed.value = v
          }}
        />
        <Knob
          title="Delay"
          description="LFO Delay"
          min={0}
          max={99}
          showValueInput={true}
          size="lg"
          value={voice.lfo.delay.value}
          onChange={(v) => {
            voice.lfo.delay.value = v
          }}
        />
      </div>
      <div class="lfo-row lfo-row-mod">
        <Knob
          title="PMD"
          description="LFO Pitch Mod Depth"
          min={0}
          max={99}
          indicatorOffAtMin={true}
          showValueInput={true}
          size="md"
          value={voice.lfo.pmDepth.value}
          onChange={(v) => {
            voice.lfo.pmDepth.value = v
          }}
        />
        <Knob
          title="AMD"
          description="LFO Amp Mod Depth"
          min={0}
          max={99}
          indicatorOffAtMin={true}
          showValueInput={true}
          size="md"
          value={voice.lfo.amDepth.value}
          onChange={(v) => {
            voice.lfo.amDepth.value = v
          }}
        />
        <Knob
          title="PMS"
          description="Pitch Mod Sensitivity"
          min={0}
          max={7}
          indicatorOffAtMin={true}
          showValueInput={true}
          size="md"
          value={voice.lfo.pmSens.value}
          onChange={(v) => {
            voice.lfo.pmSens.value = v
          }}
        />
      </div>
      <div class="lfo-row lfo-row-switches">
        <ToggleSwitch
          title="LFO Key Sync"
          description="LFO Key Sync"
          value={voice.lfo.keySync.value === 1}
          onChange={(v) => {
            voice.lfo.keySync.value = v ? 1 : 0
          }}
          size="lg"
        />
        <ToggleSwitch
          title="OSC Key Sync"
          description="OSC Key Sync"
          value={voice.global.oscSync.value === 1}
          onChange={(v) => {
            voice.global.oscSync.value = v ? 1 : 0
          }}
          size="lg"
        />
      </div>
    </div>
  )
}
