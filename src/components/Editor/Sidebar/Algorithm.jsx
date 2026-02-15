import { useVoice } from "../index"

/**
 * Algorithm display component.
 * Shows the current algorithm number and its visualization from the voice settings.
 * @returns {import("solid-js").JSX.Element}
 */
export function Algorithm() {
  const voice = useVoice()
  const algorithmId = () => voice.global.algorithm[0]()

  return (
    <div class="algo-section">
      <div class="algo-number">{algorithmId()}</div>
      <div class="algo-label">ALGORITHM</div>
    </div>
  )
}
