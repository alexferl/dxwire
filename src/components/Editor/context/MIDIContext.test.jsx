import { render, screen, waitFor } from "@testing-library/preact"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MIDIContextProvider, useMIDI } from "./MIDIContext.jsx"

// Mock midiwire module
const mockSetupSelectors = vi.fn()
const mockGetOutputs = vi.fn()
const mockGetInputs = vi.fn()
const mockGetCurrentOutput = vi.fn()
const mockGetCurrentInput = vi.fn()

const mockMidiInstance = {
  device: {
    getOutputs: mockGetOutputs,
    getInputs: mockGetInputs,
    getCurrentOutput: mockGetCurrentOutput,
    getCurrentInput: mockGetCurrentInput,
  },
}

const mockDeviceManager = {
  midi: mockMidiInstance,
  setupSelectors: mockSetupSelectors,
}

vi.mock("midiwire", () => ({
  createMIDIDeviceManager: vi.fn(() => Promise.resolve(mockDeviceManager)),
}))

function TestComponent() {
  const midi = useMIDI()
  return (
    <div>
      <div data-testid="output-status">{midi.outputStatus}</div>
      <div data-testid="input-status">{midi.inputStatus}</div>
      <div data-testid="has-output">{midi.hasOutputDevice ? "yes" : "no"}</div>
      <div data-testid="has-input">{midi.hasInputDevice ? "yes" : "no"}</div>
      <div data-testid="midi-exists">{midi.midi ? "yes" : "no"}</div>
    </div>
  )
}

describe("MIDIContext", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOutputs.mockReturnValue([])
    mockGetInputs.mockReturnValue([])
    mockGetCurrentOutput.mockReturnValue(null)
    mockGetCurrentInput.mockReturnValue(null)
  })

  it("throws error when useMIDI is used outside provider", () => {
    function UnwrappedComponent() {
      try {
        useMIDI()
        return <div>No error</div>
      } catch (err) {
        return <div data-testid="error">{err.message}</div>
      }
    }

    render(<UnwrappedComponent />)
    expect(screen.getByTestId("error")).toHaveTextContent("useMIDI must be used within MIDIContextProvider")
  })

  it("provides initial MIDI state to children", async () => {
    render(
      <MIDIContextProvider>
        <TestComponent />
      </MIDIContextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("midi-exists")).toHaveTextContent("yes")
    })

    expect(screen.getByTestId("output-status")).toHaveTextContent("disconnected")
    expect(screen.getByTestId("input-status")).toHaveTextContent("disconnected")
    expect(screen.getByTestId("has-output")).toHaveTextContent("no")
    expect(screen.getByTestId("has-input")).toHaveTextContent("no")
  })

  it("shows connected status when devices are available", async () => {
    mockGetOutputs.mockReturnValue([{ name: "Output 1" }])
    mockGetInputs.mockReturnValue([{ name: "Input 1" }])
    mockGetCurrentOutput.mockReturnValue({ name: "Output 1" })
    mockGetCurrentInput.mockReturnValue({ name: "Input 1" })

    render(
      <MIDIContextProvider>
        <TestComponent />
      </MIDIContextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("output-status")).toHaveTextContent("connected")
    })

    expect(screen.getByTestId("input-status")).toHaveTextContent("connected")
    expect(screen.getByTestId("has-output")).toHaveTextContent("yes")
    expect(screen.getByTestId("has-input")).toHaveTextContent("yes")
  })

  it("shows empty status when devices exist but none selected", async () => {
    mockGetOutputs.mockReturnValue([{ name: "Output 1" }])
    mockGetInputs.mockReturnValue([{ name: "Input 1" }])
    mockGetCurrentOutput.mockReturnValue(null)
    mockGetCurrentInput.mockReturnValue(null)

    render(
      <MIDIContextProvider>
        <TestComponent />
      </MIDIContextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("output-status")).toHaveTextContent("")
    })

    expect(screen.getByTestId("input-status")).toHaveTextContent("")
    expect(screen.getByTestId("has-output")).toHaveTextContent("no")
    expect(screen.getByTestId("has-input")).toHaveTextContent("no")
  })

  it("calls setupSelectors with correct selectors", async () => {
    render(
      <MIDIContextProvider>
        <TestComponent />
      </MIDIContextProvider>,
    )

    await waitFor(() => {
      expect(mockSetupSelectors).toHaveBeenCalledWith(
        {
          output: "#output-select",
          input: "#input-select",
        },
        expect.objectContaining({
          onDeviceListChange: expect.any(Function),
        }),
      )
    })
  })

  it("updates status when device list changes", async () => {
    let deviceListChangeCallback

    mockSetupSelectors.mockImplementation((_selectors, callbacks) => {
      deviceListChangeCallback = callbacks.onDeviceListChange
    })

    mockGetOutputs.mockReturnValue([])
    mockGetInputs.mockReturnValue([])

    render(
      <MIDIContextProvider>
        <TestComponent />
      </MIDIContextProvider>,
    )

    await waitFor(() => {
      expect(mockSetupSelectors).toHaveBeenCalled()
    })

    // Initially disconnected
    expect(screen.getByTestId("output-status")).toHaveTextContent("disconnected")

    // Simulate device list change with connected devices
    mockGetOutputs.mockReturnValue([{ name: "Output 1" }])
    mockGetInputs.mockReturnValue([{ name: "Input 1" }])
    mockGetCurrentOutput.mockReturnValue({ name: "Output 1" })
    mockGetCurrentInput.mockReturnValue({ name: "Input 1" })

    // @ts-expect-error - callback is assigned by mock
    deviceListChangeCallback()

    await waitFor(() => {
      expect(screen.getByTestId("output-status")).toHaveTextContent("connected")
    })

    expect(screen.getByTestId("input-status")).toHaveTextContent("connected")
  })

  it("handles connection update callback", async () => {
    const { createMIDIDeviceManager } = await import("midiwire")
    let connectionUpdateCallback

    /** @type {any} */
    createMIDIDeviceManager.mockImplementation(({ onConnectionUpdate }) => {
      connectionUpdateCallback = onConnectionUpdate
      return Promise.resolve(mockDeviceManager)
    })

    mockGetOutputs.mockReturnValue([])
    mockGetInputs.mockReturnValue([])

    render(
      <MIDIContextProvider>
        <TestComponent />
      </MIDIContextProvider>,
    )

    await waitFor(() => {
      expect(createMIDIDeviceManager).toHaveBeenCalled()
    })

    // Simulate connection update with connected devices
    mockGetOutputs.mockReturnValue([{ name: "Output 1" }])
    mockGetInputs.mockReturnValue([{ name: "Input 1" }])
    mockGetCurrentOutput.mockReturnValue({ name: "Output 1" })
    mockGetCurrentInput.mockReturnValue({ name: "Input 1" })

    // @ts-expect-error - callback is assigned by mock
    connectionUpdateCallback(null, null, mockMidiInstance)

    await waitFor(() => {
      expect(screen.getByTestId("output-status")).toHaveTextContent("connected")
    })

    expect(screen.getByTestId("input-status")).toHaveTextContent("connected")
  })
})
