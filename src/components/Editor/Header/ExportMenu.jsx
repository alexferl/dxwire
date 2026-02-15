import { MenuButton, MenuItem } from "@/src/components/MenuButton"
import { useVoice } from "../index"

/**
 * Export menu component.
 * Provides UI for exporting banks to files.
 * @returns {import("solid-js").JSX.Element}
 */
export function ExportMenu() {
  const voice = useVoice()

  /**
   * Exports the current bank as a .syx file.
   export { ExportMenu } from "./ExportMenu.jsx"
   */
  const handleExportBankSysEx = () => {
    const bankEntry = voice.banks[0]()[voice.currentBank[0]()]
    if (!bankEntry?.bank) {
      alert("No bank loaded")
      return
    }
    const sysex = bankEntry.bank.toSysEx()
    const blob = new Blob([sysex], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${bankEntry.name.replace(/\s+/g, "_")}.syx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Exports the current bank as a .json file.
   */
  const handleExportBankJSON = () => {
    const bankEntry = voice.banks[0]()[voice.currentBank[0]()]
    if (!bankEntry?.bank) {
      alert("No bank loaded")
      return
    }
    const json = bankEntry.bank.toJSON()
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${bankEntry.name.replace(/\s+/g, "_")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      fill="currentColor"
      role="img"
      aria-label="Export icon"
    >
      <title>Export icon</title>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
    </svg>
  )

  const bankLoaded = () => !!voice.banks[0]()[voice.currentBank[0]()]?.bank

  return (
    <MenuButton icon={exportIcon}>
      <MenuItem label="Export Bank (.syx)" onClick={handleExportBankSysEx} disabled={!bankLoaded()} />
      <MenuItem label="Export Bank (.json)" onClick={handleExportBankJSON} disabled={!bankLoaded()} />
    </MenuButton>
  )
}
