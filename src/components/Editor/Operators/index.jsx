import "./style.css"

export { Operator } from "./Operator.jsx"

/**
 * Operators container component.
 * Grid layout wrapper for operator components.
 * @param {Object} props
 * @param {import("preact").ComponentChildren} props.children - Operator components
 * @returns {import("preact").VNode}
 */
export function Operators({ children }) {
  return <div class="operators-grid">{children}</div>
}
