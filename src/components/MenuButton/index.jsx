import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import "./style.css"

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {import("solid-js").JSX.Element} [props.icon]
 * @param {import("solid-js").JSX.Element} [props.children]
 * @param {boolean} [props.disabled]
 * @param {string} [props.title]
 */
export function MenuButton(props) {
  const [isOpen, setIsOpen] = createSignal(false)
  const [focusedIndex, setFocusedIndex] = createSignal(-1)
  /** @type {HTMLDivElement | undefined} */
  let containerRef
  /** @type {HTMLButtonElement | undefined} */
  let buttonRef

  // Get array of children, handling both single child and array
  const getChildrenArray = () => {
    const c = props.children
    if (!c) return []
    return Array.isArray(c) ? c.flat() : [c]
  }

  // Unwrap a SolidJS-wrapped child to get the actual component
  const unwrapChild = (child) => {
    if (typeof child !== "function") return null
    // Check if child itself is a MenuItem marker
    if (child.__menuItem) return child
    // Otherwise try to unwrap Solid's reactive wrapper
    const result = child()
    return result?.__menuItem ? result : null
  }

  // Get array of valid menu item children (excluding separators for focus)
  const validChildren = () => {
    const items = []
    const childArray = getChildrenArray()
    childArray.forEach((child, index) => {
      const unwrapped = unwrapChild(child)
      if (unwrapped && !unwrapped.props?.separator && !unwrapped.props?.disabled) {
        items.push({ index, props: unwrapped.props })
      }
    })
    return items
  }

  const handleClickOutside = (e) => {
    if (containerRef && !containerRef.contains(e.target) && !buttonRef?.contains(e.target)) {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside)
    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside))
  })

  // Handle keyboard navigation when menu is open
  createEffect(() => {
    if (!isOpen()) {
      setFocusedIndex(-1)
      return
    }

    const handleKeyDown = (e) => {
      if (!isOpen()) return
      const valid = validChildren()

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => {
            if (prev === -1) return 0
            return (prev + 1) % valid.length
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => {
            if (prev === -1) return valid.length - 1
            return (prev - 1 + valid.length) % valid.length
          })
          break
        case "Enter":
          e.preventDefault()
          {
            const currentFocused = focusedIndex()
            if (currentFocused >= 0 && currentFocused < valid.length) {
              const { props } = valid[currentFocused]
              if (props.onClick) {
                props.onClick()
              }
              setIsOpen(false)
              setFocusedIndex(-1)
            }
          }
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          buttonRef?.focus()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    onCleanup(() => document.removeEventListener("keydown", handleKeyDown))
  })

  const handleButtonClick = () => {
    setIsOpen((prev) => {
      const newValue = !prev
      if (!newValue) {
        setFocusedIndex(-1)
      }
      return newValue
    })
  }

  const handleButtonKeyDown = (e) => {
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !isOpen()) {
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

  return (
    <div ref={containerRef} class="menu-button-container">
      <button
        ref={buttonRef}
        type="button"
        class="menu-button"
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        disabled={props.disabled}
        title={props.title}
      >
        {props.icon && <span class="menu-icon">{props.icon}</span>}
        {props.label}
      </button>
      {isOpen() && (
        <div class="menu-dropdown">
          {(() => {
            const arr = getChildrenArray()
            return arr.map((child, idx) => {
              const unwrapped = unwrapChild(child)
              if (!unwrapped) return child
              const childProps = unwrapped.props
              if (childProps.separator) return <div class="menu-separator" />

              const valid = validChildren()
              const validIndex = valid.findIndex((v) => v.index === idx)
              const isFocused = () => validIndex === focusedIndex()

              return (
                <MenuItemWrapper
                  props={childProps}
                  isFocused={isFocused}
                  onMouseEnter={() => setFocusedIndex(validIndex)}
                  closeMenu={closeMenu}
                />
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}

/**
 * Wrapper component that handles menu item interactions
 * @param {Object} props
 * @param {Object} props.props - The MenuItem props
 * @param {() => boolean} props.isFocused - Whether this item is focused
 * @param {() => void} props.onMouseEnter - Mouse enter handler
 * @param {() => void} props.closeMenu - Function to close the menu
 */
function MenuItemWrapper(props) {
  /** @type {HTMLButtonElement | undefined} */
  let itemRef

  createEffect(() => {
    if (props.isFocused() && itemRef) {
      /** @type {HTMLButtonElement} */
      itemRef.focus()
    }
  })

  const handleClick = () => {
    if (props.props.onClick) {
      props.props.onClick()
    }
    props.closeMenu()
  }

  return (
    <button
      ref={itemRef}
      type="button"
      class={`menu-item ${props.isFocused() ? "focused" : ""}`}
      onClick={handleClick}
      onMouseEnter={props.onMouseEnter}
      disabled={props.props.disabled}
      tabIndex={-1}
    >
      {props.props.label}
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
/** @type {(props: {label?: string, onClick?: () => void, disabled?: boolean, separator?: boolean}) => any} */
export function MenuItem(props) {
  // Return a function that carries the props - this is detectable in SolidJS
  // and allows the parent to access the props
  return Object.assign(() => null, { __menuItem: true, props })
}
