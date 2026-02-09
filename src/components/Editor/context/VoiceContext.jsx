import { createContext } from "preact"
import { useContext } from "preact/hooks"
import { createVoice } from "../Voice.js"

/** @type {import("preact").Context<ReturnType<typeof createVoice>|null>} */
export const VoiceContext = createContext(null)

/** @type {ReturnType<typeof createVoice>} */
const voiceInstance = createVoice()

/**
 * Hook to access the voice context.
 * Must be used within an Editor component.
 * @returns {ReturnType<typeof createVoice>} The voice instance
 */
export function useVoice() {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error("useVoice must be used within an Editor component")
  }
  return context
}

export { voiceInstance }
