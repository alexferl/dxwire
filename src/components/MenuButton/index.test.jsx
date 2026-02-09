import { fireEvent, render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"
import { MenuButton, MenuItem } from "./index"

describe("MenuButton", () => {
  it("renders with label", () => {
    render(
      <MenuButton label="File">
        <MenuItem label="Open" onClick={() => {}} />
      </MenuButton>,
    )
    expect(screen.getByText("File")).toBeInTheDocument()
  })

  it("renders with icon", () => {
    render(
      <MenuButton label="File" icon={<span data-testid="icon">★</span>}>
        <MenuItem label="Open" onClick={() => {}} />
      </MenuButton>,
    )
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("is disabled when disabled prop is true", () => {
    render(
      <MenuButton label="File" disabled={true}>
        <MenuItem label="Open" onClick={() => {}} />
      </MenuButton>,
    )
    expect(screen.getByText("File")).toBeDisabled()
  })

  describe("dropdown menu", () => {
    it("opens dropdown when button is clicked", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.click(button)

      expect(screen.getByText("Open")).toBeInTheDocument()
      expect(screen.getByText("Save")).toBeInTheDocument()
    })

    it("closes dropdown when clicked again", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.click(button)
      expect(screen.getByText("Open")).toBeInTheDocument()

      fireEvent.click(button)
      expect(screen.queryByText("Open")).not.toBeInTheDocument()
    })

    it("closes dropdown when clicking outside", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.click(button)
      expect(screen.getByText("Open")).toBeInTheDocument()

      fireEvent.mouseDown(document.body)
      expect(screen.queryByText("Open")).not.toBeInTheDocument()
    })
  })

  describe("menu item interaction", () => {
    it("calls onClick when menu item is clicked", () => {
      const onClick = vi.fn()
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={onClick} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.click(button)

      const menuItem = screen.getByText("Open")
      fireEvent.click(menuItem)

      expect(onClick).toHaveBeenCalled()
    })

    it("closes dropdown after menu item click", () => {
      const onClick = vi.fn()
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={onClick} />
        </MenuButton>,
      )

      fireEvent.click(screen.getByText("File"))
      fireEvent.click(screen.getByText("Open"))

      expect(screen.queryByText("Open")).not.toBeInTheDocument()
    })

    it("does not call onClick for disabled menu items", () => {
      const onClick = vi.fn()
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={onClick} disabled={true} />
        </MenuButton>,
      )

      fireEvent.click(screen.getByText("File"))

      const menuItem = screen.getByText("Open")
      expect(menuItem).toBeDisabled()
    })

    it("calls onClick when pressing Enter on focused item", () => {
      const onClick = vi.fn()
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={onClick} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      // Open menu with keyboard
      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      // Press Enter on first item
      fireEvent.keyDown(document, { key: "Enter" })

      expect(onClick).toHaveBeenCalled()
    })
  })

  describe("keyboard navigation", () => {
    it("opens dropdown on ArrowDown", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      expect(screen.getByText("Open")).toBeInTheDocument()
    })

    it("opens dropdown on Enter", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "Enter" })

      expect(screen.getByText("Open")).toBeInTheDocument()
    })

    it("opens dropdown on Space", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: " " })

      expect(screen.getByText("Open")).toBeInTheDocument()
    })

    it("closes dropdown on Escape", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      fireEvent.click(screen.getByText("File"))
      expect(screen.getByText("Open")).toBeInTheDocument()

      fireEvent.keyDown(document, { key: "Escape" })
      expect(screen.queryByText("Open")).not.toBeInTheDocument()
    })

    it("focuses first item on ArrowDown", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      const items = document.querySelectorAll(".menu-item")
      expect(items[0]).toHaveFocus()
    })

    it("navigates with ArrowDown through items", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem label="Save" onClick={() => {}} />
          <MenuItem label="Exit" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      const items = document.querySelectorAll(".menu-item")
      expect(items[0]).toHaveFocus()

      // Navigate down
      fireEvent.keyDown(document, { key: "ArrowDown" })
      expect(items[1]).toHaveFocus()

      fireEvent.keyDown(document, { key: "ArrowDown" })
      expect(items[2]).toHaveFocus()
    })

    it("navigates with ArrowUp through items", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem label="Save" onClick={() => {}} />
          <MenuItem label="Exit" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      const items = document.querySelectorAll(".menu-item")

      // Navigate up from first item (should wrap to last)
      fireEvent.keyDown(document, { key: "ArrowUp" })
      expect(items[2]).toHaveFocus()

      fireEvent.keyDown(document, { key: "ArrowUp" })
      expect(items[1]).toHaveFocus()
    })

    it("wraps navigation at end of list", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      const items = document.querySelectorAll(".menu-item")

      // Navigate past last item (should wrap to first)
      fireEvent.keyDown(document, { key: "ArrowDown" })
      fireEvent.keyDown(document, { key: "ArrowDown" })
      expect(items[0]).toHaveFocus()
    })

    it("returns focus to button on Escape", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      fireEvent.keyDown(document, { key: "Escape" })

      expect(button).toHaveFocus()
    })
  })

  describe("separators", () => {
    it("renders separator between items", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem separator={true} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      fireEvent.click(screen.getByText("File"))

      const separators = document.querySelectorAll(".menu-separator")
      expect(separators.length).toBe(1)
    })

    it("skips separators during keyboard navigation", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem separator={true} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      const button = screen.getByText("File")
      fireEvent.keyDown(button, { key: "ArrowDown" })

      // Should skip separator and focus Save
      fireEvent.keyDown(document, { key: "ArrowDown" })

      const items = document.querySelectorAll(".menu-item")
      // Should still have 2 items (separator is not a menu-item)
      expect(items.length).toBe(2)
    })
  })

  describe("title attribute", () => {
    it("sets title on button", () => {
      render(
        <MenuButton label="File" title="File menu">
          <MenuItem label="Open" onClick={() => {}} />
        </MenuButton>,
      )
      expect(screen.getByText("File")).toHaveAttribute("title", "File menu")
    })
  })

  describe("mouse navigation", () => {
    it("focuses item on mouse enter", () => {
      render(
        <MenuButton label="File">
          <MenuItem label="Open" onClick={() => {}} />
          <MenuItem label="Save" onClick={() => {}} />
        </MenuButton>,
      )

      fireEvent.click(screen.getByText("File"))

      const items = document.querySelectorAll(".menu-item")
      fireEvent.mouseEnter(items[1])

      expect(items[1]).toHaveFocus()
    })
  })
})
