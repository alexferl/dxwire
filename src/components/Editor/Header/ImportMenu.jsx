import { MenuButton, MenuItem } from "@/src/components/MenuButton"
import { useVoice } from "../index"

/**
 * Import menu component.
 * Provides UI for importing banks from files.
 * @returns {import("solid-js").JSX.Element}
 */
export function ImportMenu() {
  const voice = useVoice()

  /**
   * Handles importing a bank from a file.
   * Opens a file picker for .syx or .json files.
   */
  const handleImportBank = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".syx,.json"
    input.onchange = async (e) => {
      const file = /** @type {HTMLInputElement} */ (e.target).files?.[0]
      if (!file) return
      try {
        await voice.loadFromFile(file)
      } catch (err) {
        alert(`Failed to import: ${err.message}`)
      }
    }
    input.click()
  }

  const importIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      fill="currentColor"
      role="img"
      aria-label="Import icon"
    >
      <title>Import icon</title>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  )

  return (
    <MenuButton icon={importIcon}>
      <MenuItem label="Import Bank..." onClick={handleImportBank} />
    </MenuButton>
  )
}
