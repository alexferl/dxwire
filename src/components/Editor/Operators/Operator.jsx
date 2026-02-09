import { noteNameToNumber, noteNumberToName } from "midiwire"
import { useMemo } from "preact/hooks"
import { CurveSelect } from "@/src/components/CurveSelect"
import { EnvelopeGraph } from "@/src/components/EnvelopeGraph"
import { Knob } from "@/src/components/Knob"
import { RidgedSwitch } from "@/src/components/RidgedSwitch"
import { Slider } from "@/src/components/Slider/index.jsx"
import { ToggleSwitch } from "@/src/components/ToggleSwitch"
import { useVoice } from "../index"
import { calculateFrequency } from "../utils"
import "./style.css"

/**
 * Single operator editor component.
 * Provides controls for one of the 6 DX7 operators including frequency,
 * envelope generator, keyboard scaling, and modulation settings.
 * @param {Object} props
 * @param {number} props.number - Operator number (1-6)
 * @returns {import("preact").VNode}
 */
export function Operator({ number }) {
  const voice = useVoice()
  const op = voice.operators[number - 1]

  const freqDisplay = useMemo(
    () => calculateFrequency(op.mode.value, op.coarse.value, op.fine.value, op.detune.value - 7),
    [op.mode.value, op.coarse.value, op.fine.value, op.detune.value],
  )

  return (
    <div class={`operator op${number}`}>
      <div class="freq-controls">
        <div class="freq-header-row">
          <div className="op-header">
            <div className={`op-label ${op.enabled.value ? "on" : "off"}`}>{number}</div>
            <RidgedSwitch
              value={op.enabled.value}
              onChange={(v) => {
                op.enabled.value = v
              }}
              description="Operator On/Off"
            />
          </div>
          <ToggleSwitch
            option1="Ratio"
            option2="Fixed"
            description="Mode"
            value={op.mode.value === 1}
            onChange={(v) => {
              op.mode.value = v ? 1 : 0
            }}
            size="sm"
          />
        </div>
        <div class="freq-display">{freqDisplay}</div>
        <div class="freq-knobs">
          <Knob
            title="Detune"
            description="Oscillator Detune"
            min={-7}
            max={7}
            showValueInput={voice.settings.value.showValueInputs}
            size="md"
            value={op.detune.value - 7}
            onChange={(v) => {
              op.detune.value = v + 7
            }}
          />
          <Knob
            title="Coarse"
            description="Oscillator Frequency Coarse"
            min={0}
            max={31}
            showValueInput={voice.settings.value.showValueInputs}
            size="md"
            value={op.coarse.value}
            onChange={(v) => {
              op.coarse.value = v
            }}
          />
          <Knob
            title="Fine"
            description="Oscillator Frequency Fine"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="md"
            value={op.fine.value}
            onChange={(v) => {
              op.fine.value = v
            }}
          />
        </div>
      </div>
      <div class="envelope-display">
        <EnvelopeGraph
          type="amplitude"
          levels={[op.egLevel1.value, op.egLevel2.value, op.egLevel3.value, op.egLevel4.value]}
          rates={[op.egRate1.value, op.egRate2.value, op.egRate3.value, op.egRate4.value]}
          showADSR={voice.settings.value.showADSR}
        />
      </div>
      <div className="eg-section">
        <div className="eg-knobs-level">
          <Knob
            title="L1"
            description="EG Level 1"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egLevel1.value}
            onChange={(v) => {
              op.egLevel1.value = v
            }}
          />
          <Knob
            title="L2"
            description="EG Level 2"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egLevel2.value}
            onChange={(v) => {
              op.egLevel2.value = v
            }}
          />
          <Knob
            title="L3"
            description="EG Level 3"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egLevel3.value}
            onChange={(v) => {
              op.egLevel3.value = v
            }}
          />
          <Knob
            title="L4"
            description="EG Level 4"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egLevel4.value}
            onChange={(v) => {
              op.egLevel4.value = v
            }}
          />
        </div>
        <div className="eg-knobs-rate">
          <Knob
            title="R1"
            description="EG Rate 1"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egRate1.value}
            onChange={(v) => {
              op.egRate1.value = v
            }}
          />
          <Knob
            title="R2"
            description="EG Rate 2"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egRate2.value}
            onChange={(v) => {
              op.egRate2.value = v
            }}
          />
          <Knob
            title="R3"
            description="EG Rate 3"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egRate3.value}
            onChange={(v) => {
              op.egRate3.value = v
            }}
          />
          <Knob
            title="R4"
            description="EG Rate 4"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.egRate4.value}
            onChange={(v) => {
              op.egRate4.value = v
            }}
          />
        </div>
      </div>
      <div class="level-section">
        <div class="level-knobs">
          <Knob
            title="L Depth"
            description="Keyboard Level Scaling Left Depth"
            min={0}
            max={99}
            indicatorOffAtMin={true}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.leftDepth.value}
            onChange={(v) => {
              op.leftDepth.value = v
            }}
          />
          <Slider
            title="Breakpoint"
            value={op.breakPoint.value}
            onChange={(v) => {
              op.breakPoint.value = v
            }}
            description="Keyboard Level Scaling Break Point"
            min={0}
            max={99}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            formatValue={(v) => noteNumberToName(v + 9)}
            parseValue={(v) => {
              try {
                return noteNameToNumber(v) - 9
              } catch {
                return null
              }
            }}
          />
          <Knob
            title="R Depth"
            description="Keyboard Level Scaling Right Depth"
            min={0}
            max={99}
            indicatorOffAtMin={true}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.rightDepth.value}
            onChange={(v) => {
              op.rightDepth.value = v
            }}
          />
        </div>
        <div class="level-knobs-row">
          <CurveSelect
            title="L Curve"
            description="Keyboard Level Scaling Left Curve"
            value={op.leftCurve.value}
            onChange={(v) => {
              op.leftCurve.value = v
            }}
            size="md"
          />
          <Knob
            title="Rate Scaling"
            description="Keyboard Rate Scaling"
            min={0}
            max={7}
            indicatorOffAtMin={true}
            showValueInput={voice.settings.value.showValueInputs}
            size="sm"
            value={op.rateScaling.value}
            onChange={(v) => {
              op.rateScaling.value = v
            }}
          />
          <CurveSelect
            title="R Curve"
            description="Keyboard Level Scaling Right Curve"
            value={op.rightCurve.value}
            onChange={(v) => {
              op.rightCurve.value = v
            }}
            size="md"
            side="right"
          />
        </div>
      </div>
      <div class="mod-section">
        <div class="mod-knobs-triangle">
          <div class="mod-knob-side">
            <Knob
              title="Mod"
              description="Amplitude Modulation Sensitivity"
              min={0}
              max={3}
              indicatorOffAtMin={true}
              showValueInput={voice.settings.value.showValueInputs}
              size="md"
              value={op.ampModSens.value}
              onChange={(v) => {
                op.ampModSens.value = v
              }}
            />
          </div>
          <div class="mod-knob-center">
            <Knob
              title="Level"
              description="Operator Output Level"
              min={0}
              max={99}
              indicatorOffAtMin={true}
              showValueInput={voice.settings.value.showValueInputs}
              size="lg"
              value={op.outputLevel.value}
              onChange={(v) => {
                op.outputLevel.value = v
              }}
            />
          </div>
          <div class="mod-knob-side">
            <Knob
              title="Key"
              description="Key Velocity Sensitivity"
              min={0}
              max={7}
              indicatorOffAtMin={true}
              showValueInput={voice.settings.value.showValueInputs}
              size="md"
              value={op.keyVelocity.value}
              onChange={(v) => {
                op.keyVelocity.value = v
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
