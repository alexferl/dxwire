import { VoiceContext, voiceInstance } from "./context/VoiceContext.jsx"
import { Header } from "./Header/index.jsx"
import { Operator, Operators } from "./Operators/index.jsx"
import { Sidebar } from "./Sidebar/index.jsx"
import "./style.css"

export { useVoice } from "./context/VoiceContext.jsx"

/**
 * Main DX7 editor component.
 * Renders the complete editor interface with header, sidebar, and operators.
 * @returns {import("preact").VNode}
 */
export function Editor() {
  return (
    <VoiceContext.Provider value={voiceInstance}>
      <div class="editor">
        <Header />
        <Sidebar />
        <Operators>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <Operator key={num} number={num} />
          ))}
        </Operators>
      </div>
    </VoiceContext.Provider>
  )
}
