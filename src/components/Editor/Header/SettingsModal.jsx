import { useEffect } from "preact/hooks"
import { useVoice } from "../context/VoiceContext.jsx"
import "./style.css"

/**
 * @param {Object} props
 * @param {() => void} props.onClose
 */
export function SettingsModal({ onClose }) {
  const voice = useVoice()
  const settings = voice.settings.value

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleShowADSRChange = (e) => {
    voice.updateSetting("showADSR", e.target.checked)
  }

  const handleShowValueInputsChange = (e) => {
    voice.updateSetting("showValueInputs", e.target.checked)
  }

  return (
    <section
      class="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault()
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        class="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onClose()
          }
        }}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
      >
        <div class="modal-header">
          <h2>Settings</h2>
          <button type="button" class="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="settings-section">
            <h3>Envelope Display</h3>
            <label class="settings-checkbox">
              <input type="checkbox" checked={settings.showADSR} onChange={handleShowADSRChange} />
              <span>Show ADSR visualization (colored fills and labels)</span>
            </label>
            <p class="settings-description">
              When enabled, envelope graphs display colored fills for Attack, Decay, Sustain, and Release phases, along
              with ADSR labels. When disabled, a simpler visualization is shown.
            </p>
          </div>
          <div class="settings-section">
            <h3>Input Controls</h3>
            <label class="settings-checkbox">
              <input type="checkbox" checked={settings.showValueInputs} onChange={handleShowValueInputsChange} />
              <span>Show value input fields on knobs and sliders</span>
            </label>
            <p class="settings-description">
              When enabled, knobs and sliders display numeric input fields below them. When disabled, values are only
              shown on hover.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
