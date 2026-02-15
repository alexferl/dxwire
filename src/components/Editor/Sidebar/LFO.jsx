import { Knob } from "@/src/components/Knob"
import { ToggleSwitch } from "@/src/components/ToggleSwitch"
import { WaveSelect } from "@/src/components/WaveSelect"
import { useVoice } from "../index"

/**
 * Low Frequency Oscillator (LFO) editor component.
 * Controls for LFO speed, delay, modulation depth, and sync settings.
 * @returns {import("solid-js").JSX.Element}
 */
export function LFO() {
  const voice = useVoice()

  return (
    <div class="lfo-section">
      <div class="lfo-row lfo-row-wave">
        <WaveSelect
          title="Wave"
          description="LFO Waveform"
          value={voice.lfo.wave[0]()}
          onChange={(v) => {
            voice.lfo.wave[1](v)
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
          showValueInput={voice.settings[0]().showValueInputs}
          size="lg"
          value={voice.lfo.speed[0]()}
          onChange={(v) => {
            voice.lfo.speed[1](v)
          }}
        />
        <Knob
          title="Delay"
          description="LFO Delay"
          min={0}
          max={99}
          showValueInput={voice.settings[0]().showValueInputs}
          size="lg"
          value={voice.lfo.delay[0]()}
          onChange={(v) => {
            voice.lfo.delay[1](v)
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
          showValueInput={voice.settings[0]().showValueInputs}
          size="md"
          value={voice.lfo.pmDepth[0]()}
          onChange={(v) => {
            voice.lfo.pmDepth[1](v)
          }}
        />
        <Knob
          title="AMD"
          description="LFO Amp Mod Depth"
          min={0}
          max={99}
          indicatorOffAtMin={true}
          showValueInput={voice.settings[0]().showValueInputs}
          size="md"
          value={voice.lfo.amDepth[0]()}
          onChange={(v) => {
            voice.lfo.amDepth[1](v)
          }}
        />
        <Knob
          title="PMS"
          description="Pitch Mod Sensitivity"
          min={0}
          max={7}
          indicatorOffAtMin={true}
          showValueInput={voice.settings[0]().showValueInputs}
          size="md"
          value={voice.lfo.pmSens[0]()}
          onChange={(v) => {
            voice.lfo.pmSens[1](v)
          }}
        />
      </div>
      <div class="lfo-row lfo-row-switches">
        <ToggleSwitch
          title="LFO Key Sync"
          description="LFO Key Sync"
          value={voice.lfo.keySync[0]() === 1}
          onChange={(v) => {
            voice.lfo.keySync[1](v ? 1 : 0)
          }}
          size="lg"
        />
        <ToggleSwitch
          title="OSC Key Sync"
          description="OSC Key Sync"
          value={voice.global.oscSync[0]() === 1}
          onChange={(v) => {
            voice.global.oscSync[1](v ? 1 : 0)
          }}
          size="lg"
        />
      </div>
    </div>
  )
}
