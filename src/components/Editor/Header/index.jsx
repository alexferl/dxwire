import { DX7Bank, isMIDISupported } from "midiwire"
import { createEffect, createMemo, createSignal, Index, onCleanup, onMount } from "solid-js"
import {
  GearIcon,
  HelpIcon,
  LoadingSpinner,
  ReceiveBankIcon,
  SaveIcon,
  SendBankIcon,
  SendVoiceIcon,
  SettingsIcon,
} from "../../Icons/index.jsx"
import { MenuButton, MenuItem } from "../../MenuButton/index.jsx"
import { MIDIDeviceSelector } from "../../MIDIDeviceSelector/index.jsx"
import { MIDIContextProvider, useMIDI } from "../context/MIDIContext.jsx"
import { CopyVoiceDialog } from "../dialogs/CopyVoiceDialog.jsx"
import { RenameDialog } from "../dialogs/RenameDialog.jsx"
import { UnsavedChangesDialog } from "../dialogs/UnsavedChangesDialog.jsx"
import { useVoice } from "../index.jsx"
import { ExportMenu } from "./ExportMenu.jsx"
import { HelpModal } from "./HelpModal.jsx"
import { ImportMenu } from "./ImportMenu.jsx"
import { SettingsModal } from "./SettingsModal.jsx"
import "./style.css"

/**
 * Bank management menu component.
 * Provides options to rename, delete, and reset banks.
 * @returns {import("solid-js").JSX.Element}
 */
function BankManageMenu() {
  const voice = useVoice()
  const [showRename, setShowRename] = createSignal(false)

  const canDelete = () => voice.banks[0]().length > 1
  const currentBankName = () => voice.getBankNames()[voice.currentBank[0]()] || ""

  const handleDelete = () => {
    if (!canDelete()) return
    if (confirm(`Delete bank "${currentBankName()}"?`)) {
      try {
        voice.deleteBank(voice.currentBank[0]())
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
      <MenuButton icon={<SettingsIcon size="lg" ariaLabel="Settings icon" />} title="Manage Bank">
        <MenuItem label="Rename Bank..." onClick={() => setShowRename(true)} />
        <MenuItem label="Delete Bank" onClick={handleDelete} disabled={!canDelete()} />
        <MenuItem label="Separator" separator />
        <MenuItem label="Reset All Banks" onClick={handleReset} />
      </MenuButton>
      {showRename() && (
        <RenameDialog
          title="Rename Bank"
          currentName={currentBankName()}
          onConfirm={(newName) => {
            voice.renameBank(voice.currentBank[0](), newName)
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
 * @returns {import("solid-js").JSX.Element}
 */
function VoiceManageMenu() {
  const voice = useVoice()
  const [showCopyDialog, setShowCopyDialog] = createSignal(false)
  const [showRename, setShowRename] = createSignal(false)

  const currentVoiceIdx = () => voice.currentVoiceIndex[0]()
  const voiceNames = () => voice.getBankVoiceNames()
  const currentVoiceName = () => voice.global.name[0]()
  const hasChanges = () => voice.hasUnsavedChanges[0]()

  const handleInit = () => {
    if (confirm(`Initialize "${currentVoiceName()}" to default? This will overwrite the current voice.`)) {
      try {
        voice.initVoice(currentVoiceIdx())
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const handleSaveToSlot = () => {
    if (confirm(`Save changes to "${currentVoiceName()}" (slot ${currentVoiceIdx() + 1})?`)) {
      try {
        voice.replaceVoiceInBank(currentVoiceIdx())
      } catch (err) {
        alert(err.message)
      }
    }
  }

  return (
    <>
      <MenuButton icon={<SettingsIcon size="lg" ariaLabel="Settings icon" />} title="Manage Voice">
        <MenuItem label="Save to Current Slot" onClick={handleSaveToSlot} disabled={!hasChanges()} />
        <MenuItem label="Separator" separator />
        <MenuItem label="Initialize Voice" onClick={handleInit} />
        <MenuItem label="Rename Voice..." onClick={() => setShowRename(true)} />
        <MenuItem label="Separator" separator />
        <MenuItem label="Copy to Slot..." onClick={() => setShowCopyDialog(true)} />
      </MenuButton>
      {showCopyDialog() && (
        <CopyVoiceDialog
          voiceNames={voiceNames()}
          currentIndex={currentVoiceIdx()}
          onConfirm={(toIndex) => {
            voice.copyVoice(currentVoiceIdx(), toIndex)
            setShowCopyDialog(false)
          }}
          onCancel={() => setShowCopyDialog(false)}
        />
      )}
      {showRename() && (
        <RenameDialog
          title="Rename Voice"
          currentName={currentVoiceName()}
          onConfirm={(newName) => {
            voice.renameVoice(currentVoiceIdx(), newName)
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
 * @returns {import("solid-js").JSX.Element}
 */
function HeaderContent() {
  const voice = useVoice()
  const { midi, hasOutputDevice } = useMIDI()
  const [showHelp, setShowHelp] = createSignal(false)
  const [showSettings, setShowSettings] = createSignal(false)
  const [sendingBank, setSendingBank] = createSignal(false)
  const [sendingVoice, setSendingVoice] = createSignal(false)
  const [requestingBank, setRequestingBank] = createSignal(false)

  // Listen for incoming SysEx messages
  const setupSysExListener = () => {
    if (!midi()?.connection) return

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
          const newBanks = [...voice.banks[0](), { name: bankName, bank }]
          voice.banks[1](newBanks)
          voice.currentBank[1](newBanks.length - 1)
          voice.currentVoiceIndex[1](0)
          voice.loadFromVoice(bank.getVoice(0))
          alert(`Received bank "${bankName}" with 32 voices`)
        } catch (err) {
          console.error("Failed to parse received bank:", err)
        } finally {
          setRequestingBank(false)
        }
      }
    }

    midi().connection.on("sysex", handleSysEx)
    return () => {
      midi().connection.off("sysex", handleSysEx)
    }
  }

  // Set up effect for SysEx listener
  createEffect(() => {
    if (midi()) {
      return setupSysExListener()
    }
  })

  const pendingBankChange = createSignal(null)
  const pendingVoiceChange = createSignal(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = createSignal(false)

  const hasChanges = () => voice.hasUnsavedChanges[0]()

  const confirmDiscardChanges = () => {
    setShowUnsavedDialog(false)
    voice.markSaved() // Discard changes by marking current as "saved"
    // Execute pending change
    const bankIndex = pendingBankChange[0]()
    const voiceIndex = pendingVoiceChange[0]()
    if (bankIndex !== null) {
      voice.switchBank(bankIndex)
      pendingBankChange[1](null)
    }
    if (voiceIndex !== null) {
      voice.loadFromVoiceIndex(voiceIndex)
      pendingVoiceChange[1](null)
    }
  }

  const cancelDiscardChanges = () => {
    setShowUnsavedDialog(false)
    pendingBankChange[1](null)
    pendingVoiceChange[1](null)
  }

  const handleBankChange = (e) => {
    const index = Number(e.target.value)
    if (hasChanges()) {
      pendingBankChange[1](index)
      pendingVoiceChange[1](null)
      setShowUnsavedDialog(true)
    } else {
      voice.switchBank(index)
    }
  }

  /** @type {HTMLSelectElement | undefined} */
  let bankSelectRef
  /** @type {HTMLSelectElement | undefined} */
  let voiceSelectRef

  // Ensure select values stay synchronized
  createEffect(() => {
    if (bankSelectRef) {
      bankSelectRef.value = String(currentBankIndex())
    }
    if (voiceSelectRef) {
      voiceSelectRef.value = String(currentVoiceIdx())
    }
  })

  const handleVoiceChange = (e) => {
    const index = Number(e.target.value)
    if (hasChanges()) {
      pendingBankChange[1](null)
      pendingVoiceChange[1](index)
      setShowUnsavedDialog(true)
    } else {
      voice.loadFromVoiceIndex(index)
    }
  }

  const handleSaveToSlot = () => {
    const currentVoiceName = () => voice.global.name[0]()
    const currentVoiceIdx = () => voice.currentVoiceIndex[0]()
    if (!hasChanges()) return
    if (confirm(`Save changes to "${currentVoiceName()}" (slot ${currentVoiceIdx() + 1})?`)) {
      try {
        voice.replaceVoiceInBank(currentVoiceIdx())
      } catch (err) {
        alert(err.message)
      }
    }
  }

  // Helper functions for save indicator state (avoid nested ternaries)
  const getSaveIndicatorClass = () => {
    if (hasChanges()) return "save-indicator--unsaved"
    if (voice.justSaved[0]()) return "save-indicator--saved"
    return "save-indicator--default"
  }

  const getSaveIndicatorTitle = () => {
    if (hasChanges()) return "You have unsaved changes"
    if (voice.justSaved[0]()) return "Changes saved"
    return "No changes"
  }

  const getSaveIndicatorText = () => {
    if (hasChanges()) return "Unsaved changes"
    if (voice.justSaved[0]()) return "Saved"
    return "No changes"
  }

  // Keyboard shortcut for save (Ctrl/Cmd+S)
  onMount(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (hasChanges()) {
          handleSaveToSlot()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown)
    })
  })

  /**
   * Sends the current voice via MIDI SysEx.
   */
  const handleSendVoiceViaMIDI = async () => {
    if (!midi()) {
      alert("MIDI not connected")
      return
    }
    setSendingVoice(true)
    try {
      const sysex = voice.toSysEx()
      midi().system.sendEx(sysex, false)
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
    if (!midi()) {
      alert("MIDI not connected")
      return
    }
    setSendingBank(true)
    try {
      const bankEntry = voice.banks[0]()[voice.currentBank[0]()]
      if (!bankEntry?.bank) {
        alert("No bank loaded")
        setSendingBank(false)
        return
      }
      const sysex = bankEntry.bank.toSysEx()
      midi().system.sendEx(sysex, false)
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
    if (!midi()) {
      alert("MIDI not connected")
      return
    }
    setRequestingBank(true)
    try {
      // DX7 bank dump request: F0 43 2n 09 F7 (n = channel - 1, using channel 1 = 0x20)
      const request = [0xf0, 0x43, 0x20, 0x09, 0xf7]
      midi().system.sendEx(request, false)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (err) {
      console.error("Failed to request bank:", err)
    } finally {
      setRequestingBank(false)
    }
  }

  const currentBankIndex = () => voice.currentBank[0]()
  const currentVoiceIdx = () => voice.currentVoiceIndex[0]()

  const bankNames = createMemo(() => voice.getBankNames())
  const voiceNames = createMemo(() => {
    const idx = currentBankIndex()
    return voice.banks[0]()[idx]?.bank ? voice.getBankVoiceNames() : []
  })
  const bankLoaded = () => !!voice.banks[0]()[currentBankIndex()]?.bank

  return (
    <>
      <div class="header">
        <div class="header-left">
          <div class="header-logo">
            <span class="header-logo-title">DXWire</span>
            <span class="header-logo-subtitle">DX7 Patch Editor and Manager</span>
          </div>
          <select ref={bankSelectRef} class="bank-select-header" value={currentBankIndex()} onChange={handleBankChange}>
            <Index each={bankNames()}>{(name, i) => <option value={i}>{name() || `Bank ${i + 1}`}</option>}</Index>
          </select>
          <BankManageMenu />
          <select
            ref={voiceSelectRef}
            class="voice-select-header"
            value={currentVoiceIdx()}
            onChange={handleVoiceChange}
          >
            <Index each={voiceNames()}>
              {(name, i) => (
                <option value={i}>
                  {i + 1}. {name() || "(Empty)"}
                </option>
              )}
            </Index>
          </select>
          <VoiceManageMenu />
          <div class="header-separator" />
          <button
            type="button"
            class="header-send-btn"
            onClick={handleRequestBankViaMIDI}
            disabled={!hasOutputDevice() || requestingBank()}
            title="Receive Bank from Device"
          >
            {requestingBank() ? (
              <LoadingSpinner size="md" />
            ) : (
              <ReceiveBankIcon size="md" ariaLabel="Receive bank icon" />
            )}
          </button>
          <button
            type="button"
            class="header-send-btn"
            onClick={handleSendBankViaMIDI}
            disabled={!hasOutputDevice() || !bankLoaded() || sendingBank()}
            title="Send Bank to Device"
          >
            {sendingBank() ? <LoadingSpinner size="md" /> : <SendBankIcon size="md" ariaLabel="Send bank icon" />}
          </button>
          <button
            type="button"
            class="header-send-btn"
            onClick={handleSendVoiceViaMIDI}
            disabled={!hasOutputDevice() || sendingVoice()}
            title="Send Voice to Device"
          >
            {sendingVoice() ? <LoadingSpinner size="md" /> : <SendVoiceIcon size="md" ariaLabel="Send voice icon" />}
          </button>
          <button
            type="button"
            class="header-send-btn"
            onClick={handleSaveToSlot}
            disabled={!hasChanges()}
            title="Save to Current Slot"
          >
            <SaveIcon size="md" ariaLabel="Save icon" />
          </button>
          <div class={`save-indicator ${getSaveIndicatorClass()}`} title={getSaveIndicatorTitle()}>
            <span class="save-indicator-dot" />
            <span>{getSaveIndicatorText()}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="header-midi">
            {isMIDISupported() ? <MIDIDeviceSelector /> : <span class="midi-not-supported">MIDI not supported</span>}
          </div>
          <div class="header-buttons">
            <ImportMenu />
            <ExportMenu />
          </div>
          <button type="button" class="settings-button" onClick={() => setShowSettings(true)} title="Settings">
            <GearIcon size="lg" ariaLabel="Settings gear icon" />
          </button>
          <button type="button" class="help-button" onClick={() => setShowHelp(true)} title="Help">
            <HelpIcon size="lg" ariaLabel="Help icon" />
          </button>
        </div>
      </div>
      {showHelp() && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings() && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showUnsavedDialog() && (
        <UnsavedChangesDialog
          onSave={() => {
            setShowUnsavedDialog(false)
            voice.replaceVoiceInBank(currentVoiceIdx())
            const bankIndex = pendingBankChange[0]()
            const voiceIndex = pendingVoiceChange[0]()
            if (bankIndex !== null) {
              voice.switchBank(bankIndex)
              pendingBankChange[1](null)
            }
            if (voiceIndex !== null) {
              voice.loadFromVoiceIndex(voiceIndex)
              pendingVoiceChange[1](null)
            }
          }}
          onDiscard={confirmDiscardChanges}
          onCancel={cancelDiscardChanges}
        />
      )}
    </>
  )
}

/**
 * Header subcomponent for Editor.
 * Wraps the header content with MIDI context provider.
 * @returns {import("solid-js").JSX.Element}
 */
export function Header() {
  return (
    <MIDIContextProvider>
      <HeaderContent />
    </MIDIContextProvider>
  )
}
