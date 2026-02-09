import { DX7Bank } from "midiwire"
import { useEffect, useState } from "preact/hooks"
import { MenuButton, MenuItem } from "../../MenuButton/index.jsx"
import { MIDIDeviceSelector } from "../../MIDIDeviceSelector/index.jsx"
import { MIDIContextProvider, useMIDI } from "../context/MIDIContext.jsx"
import { CopyVoiceDialog } from "../dialogs/CopyVoiceDialog.jsx"
import { RenameDialog } from "../dialogs/RenameDialog.jsx"
import { useVoice } from "../index.jsx"
import { ExportMenu } from "./ExportMenu.jsx"
import { HelpModal } from "./HelpModal.jsx"
import { ImportMenu } from "./ImportMenu.jsx"
import "./style.css"

const receiveBankIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    viewBox="0 0 24 24"
    width="18"
    fill="currentColor"
    role="img"
    aria-label="Receive bank icon"
  >
    <title>Receive bank icon</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
  </svg>
)

const sendVoiceIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    viewBox="0 0 24 24"
    width="18"
    fill="currentColor"
    role="img"
    aria-label="Send voice icon"
  >
    <title>Send voice icon</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
  </svg>
)

const loadingSpinner = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    viewBox="0 0 24 24"
    width="18"
    fill="currentColor"
    role="img"
    aria-label="Loading"
    class="spinner"
  >
    <title>Loading</title>
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
)

const sendBankIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    viewBox="0 0 24 24"
    width="18"
    fill="currentColor"
    role="img"
    aria-label="Send bank icon"
  >
    <title>Send bank icon</title>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

/** @type {import("preact").VNode} */
const helpIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    viewBox="0 0 24 24"
    width="20"
    fill="currentColor"
    role="img"
    aria-label="Help icon"
  >
    <title>Help icon</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
)

const settingsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    viewBox="0 0 24 24"
    width="20"
    fill="currentColor"
    role="img"
    aria-label="Settings icon"
  >
    <title>Settings icon</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

/**
 * Bank management menu component.
 * Provides options to rename, delete, and reset banks.
 * @returns {import("preact").VNode}
 */
function BankManageMenu() {
  const voice = useVoice()
  const [showRename, setShowRename] = useState(false)

  const canDelete = voice.banks.value.length > 1
  const currentBankName = voice.getBankNames()[voice.currentBank.value] || ""

  const handleDelete = () => {
    if (!canDelete) return
    if (confirm(`Delete bank "${currentBankName}"?`)) {
      try {
        voice.deleteBank(voice.currentBank.value)
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const handleReset = () => {
    if (confirm("Reset all banks? This will delete all imported banks and restore the default.")) {
      voice.resetBanks()
    }
  }

  return (
    <>
      <MenuButton icon={settingsIcon} title="Manage Bank">
        <MenuItem label="Rename Bank..." onClick={() => setShowRename(true)} />
        <MenuItem label="Delete Bank" onClick={handleDelete} disabled={!canDelete} />
        <MenuItem label="Separator" separator />
        <MenuItem label="Reset All Banks" onClick={handleReset} />
      </MenuButton>
      {showRename && (
        <RenameDialog
          title="Rename Bank"
          currentName={currentBankName}
          onConfirm={(newName) => {
            voice.renameBank(voice.currentBank.value, newName)
            setShowRename(false)
          }}
          onCancel={() => setShowRename(false)}
        />
      )}
    </>
  )
}

/**
 * Voice management menu component.
 * Provides options to initialize, rename, and copy voices.
 * @returns {import("preact").VNode}
 */
function VoiceManageMenu() {
  const voice = useVoice()
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showRename, setShowRename] = useState(false)

  const currentVoiceIdx = voice.currentVoiceIndex.value
  const voiceNames = voice.getBankVoiceNames()
  const currentVoiceName = voice.global.name.value

  const handleInit = () => {
    if (confirm(`Initialize "${currentVoiceName}" to default? This will overwrite the current voice.`)) {
      try {
        voice.initVoice(currentVoiceIdx)
      } catch (err) {
        alert(err.message)
      }
    }
  }

  return (
    <>
      <MenuButton icon={settingsIcon} title="Manage Voice">
        <MenuItem label="Initialize Voice" onClick={handleInit} />
        <MenuItem label="Rename Voice..." onClick={() => setShowRename(true)} />
        <MenuItem label="Separator" separator />
        <MenuItem label="Copy to Slot..." onClick={() => setShowCopyDialog(true)} />
      </MenuButton>
      {showCopyDialog && (
        <CopyVoiceDialog
          voiceNames={voiceNames}
          currentIndex={currentVoiceIdx}
          onConfirm={(toIndex) => {
            voice.copyVoice(currentVoiceIdx, toIndex)
            setShowCopyDialog(false)
          }}
          onCancel={() => setShowCopyDialog(false)}
        />
      )}
      {showRename && (
        <RenameDialog
          title="Rename Voice"
          currentName={currentVoiceName}
          onConfirm={(newName) => {
            voice.renameVoice(currentVoiceIdx, newName)
            setShowRename(false)
          }}
          onCancel={() => setShowRename(false)}
        />
      )}
    </>
  )
}

/**
 * Internal header content component.
 * Displays the bank/voice selectors, MIDI controls, and action buttons.
 * @returns {import("preact").VNode}
 */
function HeaderContent() {
  const voice = useVoice()
  const { midi, hasOutputDevice, hasInputDevice } = useMIDI()
  const [showHelp, setShowHelp] = useState(false)
  const [sendingBank, setSendingBank] = useState(false)
  const [sendingVoice, setSendingVoice] = useState(false)
  const [requestingBank, setRequestingBank] = useState(false)

  // Listen for incoming SysEx messages
  useEffect(() => {
    if (!midi?.connection) return

    const handleSysEx = (event) => {
      const { data } = event
      if (!data || data.length < 6) return

      // Check if it's a DX7 bank dump (Yamaha ID = 0x43, format = 0x09 for 32 voices)
      // DX7 bank SysEx: F0 43 0n 09 ... F7
      if (data[1] === 0x43 && (data[2] & 0xf0) === 0x00 && data[3] === 0x09) {
        try {
          const bank = DX7Bank.fromSysEx(new Uint8Array(data))
          // Add as a new bank
          const bankName = `DX7 Bank ${new Date().toLocaleTimeString()}`
          voice.banks.value = [...voice.banks.value, { name: bankName, bank }]
          voice.currentBank.value = voice.banks.value.length - 1
          voice.currentVoiceIndex.value = 0
          voice.loadFromVoice(bank.getVoice(0))
          alert(`Received bank "${bankName}" with 32 voices`)
        } catch (err) {
          console.error("Failed to parse received bank:", err)
        } finally {
          setRequestingBank(false)
        }
      }
    }

    midi.connection.on("sysex", handleSysEx)
    return () => {
      midi.connection.off("sysex", handleSysEx)
    }
  }, [midi])

  const handleBankChange = (e) => {
    const index = Number(e.target.value)
    voice.switchBank(index)
  }

  const handleVoiceChange = (e) => {
    const index = Number(e.target.value)
    voice.loadFromVoiceIndex(index)
  }

  /**
   * Sends the current voice via MIDI SysEx.
   */
  const handleSendVoiceViaMIDI = async () => {
    if (!midi) {
      alert("MIDI not connected")
      return
    }
    setSendingVoice(true)
    try {
      const sysex = voice.toSysEx()
      midi.system.sendEx(sysex, false)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      console.error("Failed to send voice:", err)
    } finally {
      setSendingVoice(false)
    }
  }

  /**
   * Sends the current bank via MIDI SysEx to the connected DX7.
   */
  const handleSendBankViaMIDI = async () => {
    if (!midi) {
      alert("MIDI not connected")
      return
    }
    setSendingBank(true)
    try {
      const bankEntry = voice.banks.value[voice.currentBank.value]
      if (!bankEntry?.bank) {
        alert("No bank loaded")
        setSendingBank(false)
        return
      }
      const sysex = bankEntry.bank.toSysEx()
      midi.system.sendEx(sysex, false)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      console.error("Failed to send bank:", err)
    } finally {
      setSendingBank(false)
    }
  }

  /**
   * Requests a bank dump from the connected DX7.
   */
  const handleRequestBankViaMIDI = async () => {
    if (!midi) {
      alert("MIDI not connected")
      return
    }
    setRequestingBank(true)
    try {
      // DX7 bank dump request: F0 43 2n 09 F7 (n = channel - 1, using channel 1 = 0x20)
      const request = [0xf0, 0x43, 0x20, 0x09, 0xf7]
      midi.system.sendEx(request, true)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (err) {
      console.error("Failed to request bank:", err)
    } finally {
      setRequestingBank(false)
    }
  }

  const currentBankIndex = voice.currentBank.value
  const currentVoiceIdx = voice.currentVoiceIndex.value

  const bankNames = voice.getBankNames()
  const voiceNames = voice.banks.value[currentBankIndex]?.bank ? voice.getBankVoiceNames() : []
  const bankLoaded = !!voice.banks.value[currentBankIndex]?.bank

  return (
    <>
      <div class="header">
        <div class="header-left">
          <div class="header-logo">DX7</div>
          <select class="bank-select-header" value={currentBankIndex} onChange={handleBankChange}>
            {bankNames.map((name, i) => (
              <option value={i}>{name || `Bank ${i + 1}`}</option>
            ))}
          </select>
          <BankManageMenu />
          <select class="voice-select-header" value={currentVoiceIdx} onChange={handleVoiceChange}>
            {voiceNames.map((name, i) => (
              <option value={i}>
                {i + 1}. {name || "(Empty)"}
              </option>
            ))}
          </select>
          <VoiceManageMenu />
          <div class="header-separator" />
          <button
            type="button"
            class="header-send-btn"
            onClick={handleRequestBankViaMIDI}
            disabled={!hasInputDevice || requestingBank}
            title="Receive Bank from Device"
          >
            {requestingBank ? loadingSpinner : receiveBankIcon}
          </button>
          <button
            type="button"
            class="header-send-btn"
            onClick={handleSendBankViaMIDI}
            disabled={!hasOutputDevice || !bankLoaded || sendingBank}
            title="Send Bank to Device"
          >
            {sendingBank ? loadingSpinner : sendBankIcon}
          </button>
          <button
            type="button"
            class="header-send-btn"
            onClick={handleSendVoiceViaMIDI}
            disabled={!hasOutputDevice || sendingVoice}
            title="Send Voice to Device"
          >
            {sendingVoice ? loadingSpinner : sendVoiceIcon}
          </button>
        </div>
        <div class="header-right">
          <div class="header-midi">
            <MIDIDeviceSelector />
          </div>
          <div class="header-buttons">
            <ImportMenu />
            <ExportMenu />
          </div>
          <button type="button" class="help-button" onClick={() => setShowHelp(true)} title="Help">
            {helpIcon}
          </button>
        </div>
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  )
}

/**
 * Header subcomponent for Editor.
 * Wraps the header content with MIDI context provider.
 * @returns {import("preact").VNode}
 */
export function Header() {
  return (
    <MIDIContextProvider>
      <HeaderContent />
    </MIDIContextProvider>
  )
}
