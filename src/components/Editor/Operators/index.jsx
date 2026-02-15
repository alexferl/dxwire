import "./style.css"

export { Operator } from "./Operator.jsx"

/**
 * Operators container component.
 * Grid layout wrapper for operator components.
 * @param {Object} props
 * @param {import("solid-js").JSX.Element} props.children - Operator components
 * @returns {import("solid-js").JSX.Element}
 */
export function Operators({ children }) {
  return <div class="operators-grid">{children}</div>
}
