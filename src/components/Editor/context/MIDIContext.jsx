import { createMIDIDeviceManager } from "midiwire"
import { createContext } from "preact"
import { useContext, useEffect, useState } from "preact/hooks"

const MIDIContext = createContext(null)

/**
 * Provider component for MIDI context.
 * Initializes MIDI device manager and provides MIDI state to children.
 * @param {Object} props
 * @param {import("preact").ComponentChildren} props.children - Child components
 * @returns {import("preact").VNode}
 */
export function MIDIContextProvider({ children }) {
  const [midi, setMidi] = useState(null)
  const [outputStatus, setOutputStatus] = useState("")
  const [inputStatus, setInputStatus] = useState("")

  useEffect(() => {
    let isMounted = true

    async function initMIDI() {
      try {
        const deviceManager = await createMIDIDeviceManager({
          sysex: true,
          onConnectionUpdate: (_output, _input, midiInstance) => {
            if (!isMounted) return
            updateStatus(midiInstance)
          },
        })

        if (isMounted) {
          setMidi(deviceManager.midi)
          updateStatus(deviceManager.midi)

          await deviceManager.setupSelectors(
            {
              output: "#output-select",
              input: "#input-select",
            },
            {
              onDeviceListChange: () => {
                updateStatus(deviceManager.midi)
              },
            },
          )
        }
      } catch (err) {
        console.error("Failed to initialize MIDI:", err)
      }
    }

    /**
     * Updates the connection status for MIDI input and output devices.
     * @param {Object} midiInstance - MIDI instance from midiwire
     * @param {Object} midiInstance.device - Device manager
     * @param {Function} midiInstance.device.getOutputs - Get available outputs
     * @param {Function} midiInstance.device.getInputs - Get available inputs
     * @param {Function} midiInstance.device.getCurrentOutput - Get current output
     * @param {Function} midiInstance.device.getCurrentInput - Get current input
     */
    function updateStatus(midiInstance) {
      if (!midiInstance) return

      const outputs = midiInstance.device.getOutputs()
      const inputs = midiInstance.device.getInputs()
      const currentOutput = midiInstance.device.getCurrentOutput()
      const currentInput = midiInstance.device.getCurrentInput()

      if (outputs.length === 0 && !currentOutput) {
        setOutputStatus("disconnected")
      } else if (currentOutput) {
        setOutputStatus("connected")
      } else {
        setOutputStatus("")
      }

      if (inputs.length === 0 && !currentInput) {
        setInputStatus("disconnected")
      } else if (currentInput) {
        setInputStatus("connected")
      } else {
        setInputStatus("")
      }
    }

    initMIDI()

    return () => {
      isMounted = false
    }
  }, [])

  const hasOutputDevice = outputStatus === "connected"
  const hasInputDevice = inputStatus === "connected"

  const value = {
    midi,
    outputStatus,
    inputStatus,
    hasOutputDevice,
    hasInputDevice,
  }

  return <MIDIContext.Provider value={value}>{children}</MIDIContext.Provider>
}

/**
 * Hook to access the MIDI context.
 * Must be used within a MIDIContextProvider.
 * @returns {Object} MIDI context with midi instance, status, and device flags
 * @throws {Error} If used outside of MIDIContextProvider
 */
export function useMIDI() {
  const context = useContext(MIDIContext)
  if (!context) {
    throw new Error("useMIDI must be used within MIDIContextProvider")
  }
  return context
}
