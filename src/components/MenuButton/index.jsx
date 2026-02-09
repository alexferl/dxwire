import { useEffect, useRef, useState } from "preact/hooks"
import "./style.css"

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {import("preact").ComponentChildren} [props.icon]
 * @param {import("preact").ComponentChildren} [props.children]
 * @param {boolean} [props.disabled]
 * @param {string} [props.title]
 */
export function MenuButton({ label, icon, children, disabled = false, title }) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  // Get array of valid menu item children (excluding separators for focus)
  const validChildren = []
  const allChildren = []
  if (children) {
    const childArray = Array.isArray(children) ? children : [children]
    childArray.forEach((child, index) => {
      allChildren.push(child)
      if (child?.props && !child.props.separator && !child.props.disabled) {
        validChildren.push({ index, child })
      }
    })
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation when menu is open
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1)
      return
    }

    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => {
            if (prev === -1) return 0
            return (prev + 1) % validChildren.length
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => {
            if (prev === -1) return validChildren.length - 1
            return (prev - 1 + validChildren.length) % validChildren.length
          })
          break
        case "Enter":
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < validChildren.length) {
            const { child } = validChildren[focusedIndex]
            if (child.props.onClick) {
              child.props.onClick()
            }
            setIsOpen(false)
            setFocusedIndex(-1)
          }
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          buttonRef.current?.focus()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, focusedIndex, validChildren])

  const handleButtonClick = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setFocusedIndex(-1)
    }
  }

  const handleButtonKeyDown = (e) => {
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !isOpen) {
      e.preventDefault()
      setIsOpen(true)
      setFocusedIndex(0)
    }
  }

  // Close menu callback to pass to children
  const closeMenu = () => {
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  // Render children with closeMenu context
  const renderedChildren = allChildren.map((child, idx) => {
    if (!child || !child.props) return child
    if (child.props.separator) return <div key={idx} class="menu-separator" />

    const validIndex = validChildren.findIndex((v) => v.index === idx)
    const isFocused = validIndex === focusedIndex

    return (
      <MenuItemWrapper
        key={idx}
        child={child}
        isFocused={isFocused}
        onMouseEnter={() => setFocusedIndex(validIndex)}
        closeMenu={closeMenu}
      />
    )
  })

  return (
    <div ref={containerRef} class="menu-button-container">
      <button
        ref={buttonRef}
        type="button"
        class="menu-button"
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        title={title}
      >
        {icon && <span class="menu-icon">{icon}</span>}
        {label}
      </button>
      {isOpen && <div class="menu-dropdown">{renderedChildren}</div>}
    </div>
  )
}

/**
 * Wrapper component that handles menu item interactions
 * @param {Object} props
 * @param {Object} props.child - The child MenuItem element
 * @param {boolean} props.isFocused - Whether this item is focused
 * @param {() => void} props.onMouseEnter - Mouse enter handler
 * @param {() => void} props.closeMenu - Function to close the menu
 */
function MenuItemWrapper({ child, isFocused, onMouseEnter, closeMenu }) {
  const itemRef = useRef(null)

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.focus()
    }
  }, [isFocused])

  const handleClick = () => {
    if (child.props.onClick) {
      child.props.onClick()
    }
    closeMenu()
  }

  return (
    <button
      ref={itemRef}
      type="button"
      class={`menu-item ${isFocused ? "focused" : ""}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      disabled={child.props.disabled}
      tabIndex={-1}
    >
      {child.props.label}
    </button>
  )
}

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.separator]
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MenuItem(_props) {
  // This is a marker component - actual rendering is handled by MenuItemWrapper
  // The props are used by MenuButton to render the actual button
  return null
}
