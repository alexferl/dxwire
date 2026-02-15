import { noteNameToNumber, noteNumberToName } from "midiwire"
import { createMemo } from "solid-js"
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
 * @returns {import("solid-js").JSX.Element}
 */
export function Operator(props) {
  const { number } = props
  const voice = useVoice()
  const op = voice.operators[number - 1]

  const freqDisplay = createMemo(() =>
    calculateFrequency(op.mode[0](), op.coarse[0](), op.fine[0](), op.detune[0]() - 7),
  )

  return (
    <div class={`operator op${number}`}>
      <div class="freq-controls">
        <div class="freq-header-row">
          <div class="op-header">
            <div class={`op-label ${op.enabled[0]() ? "on" : "off"}`}>{number}</div>
            <RidgedSwitch
              value={op.enabled[0]()}
              onChange={(v) => {
                op.enabled[1](v)
              }}
              description="Operator On/Off"
            />
          </div>
          <ToggleSwitch
            option1="Ratio"
            option2="Fixed"
            description="Mode"
            value={op.mode[0]() === 1}
            onChange={(v) => {
              op.mode[1](v ? 1 : 0)
            }}
            size="sm"
          />
        </div>
        <div class="freq-display">{freqDisplay()}</div>
        <div class="freq-knobs">
          <Knob
            title="Detune"
            description="Oscillator Detune"
            min={-7}
            max={7}
            showValueInput={voice.settings[0]().showValueInputs}
            size="md"
            value={op.detune[0]() - 7}
            onChange={(v) => {
              op.detune[1](v + 7)
            }}
          />
          <Knob
            title="Coarse"
            description="Oscillator Frequency Coarse"
            min={0}
            max={31}
            showValueInput={voice.settings[0]().showValueInputs}
            size="md"
            value={op.coarse[0]()}
            onChange={(v) => {
              op.coarse[1](v)
            }}
          />
          <Knob
            title="Fine"
            description="Oscillator Frequency Fine"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="md"
            value={op.fine[0]()}
            onChange={(v) => {
              op.fine[1](v)
            }}
          />
        </div>
      </div>
      <div class="envelope-display">
        <EnvelopeGraph
          type="amplitude"
          levels={[op.egLevel1[0](), op.egLevel2[0](), op.egLevel3[0](), op.egLevel4[0]()]}
          rates={[op.egRate1[0](), op.egRate2[0](), op.egRate3[0](), op.egRate4[0]()]}
          showADSR={voice.settings[0]().showADSR}
        />
      </div>
      <div class="eg-section">
        <div class="eg-knobs-level">
          <Knob
            title="L1"
            description="EG Level 1"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egLevel1[0]()}
            onChange={(v) => {
              op.egLevel1[1](v)
            }}
          />
          <Knob
            title="L2"
            description="EG Level 2"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egLevel2[0]()}
            onChange={(v) => {
              op.egLevel2[1](v)
            }}
          />
          <Knob
            title="L3"
            description="EG Level 3"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egLevel3[0]()}
            onChange={(v) => {
              op.egLevel3[1](v)
            }}
          />
          <Knob
            title="L4"
            description="EG Level 4"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egLevel4[0]()}
            onChange={(v) => {
              op.egLevel4[1](v)
            }}
          />
        </div>
        <div class="eg-knobs-rate">
          <Knob
            title="R1"
            description="EG Rate 1"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egRate1[0]()}
            onChange={(v) => {
              op.egRate1[1](v)
            }}
          />
          <Knob
            title="R2"
            description="EG Rate 2"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egRate2[0]()}
            onChange={(v) => {
              op.egRate2[1](v)
            }}
          />
          <Knob
            title="R3"
            description="EG Rate 3"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egRate3[0]()}
            onChange={(v) => {
              op.egRate3[1](v)
            }}
          />
          <Knob
            title="R4"
            description="EG Rate 4"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.egRate4[0]()}
            onChange={(v) => {
              op.egRate4[1](v)
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
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.leftDepth[0]()}
            onChange={(v) => {
              op.leftDepth[1](v)
            }}
          />
          <Slider
            title="Breakpoint"
            value={op.breakPoint[0]()}
            onChange={(v) => {
              op.breakPoint[1](v)
            }}
            description="Keyboard Level Scaling Break Point"
            min={0}
            max={99}
            showValueInput={voice.settings[0]().showValueInputs}
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
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.rightDepth[0]()}
            onChange={(v) => {
              op.rightDepth[1](v)
            }}
          />
        </div>
        <div class="level-knobs-row">
          <CurveSelect
            title="L Curve"
            description="Keyboard Level Scaling Left Curve"
            value={op.leftCurve[0]()}
            onChange={(v) => {
              op.leftCurve[1](v)
            }}
            size="md"
          />
          <Knob
            title="Rate Scaling"
            description="Keyboard Rate Scaling"
            min={0}
            max={7}
            indicatorOffAtMin={true}
            showValueInput={voice.settings[0]().showValueInputs}
            size="sm"
            value={op.rateScaling[0]()}
            onChange={(v) => {
              op.rateScaling[1](v)
            }}
          />
          <CurveSelect
            title="R Curve"
            description="Keyboard Level Scaling Right Curve"
            value={op.rightCurve[0]()}
            onChange={(v) => {
              op.rightCurve[1](v)
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
              showValueInput={voice.settings[0]().showValueInputs}
              size="md"
              value={op.ampModSens[0]()}
              onChange={(v) => {
                op.ampModSens[1](v)
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
              showValueInput={voice.settings[0]().showValueInputs}
              size="lg"
              value={op.outputLevel[0]()}
              onChange={(v) => {
                op.outputLevel[1](v)
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
              showValueInput={voice.settings[0]().showValueInputs}
              size="md"
              value={op.keyVelocity[0]()}
              onChange={(v) => {
                op.keyVelocity[1](v)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
