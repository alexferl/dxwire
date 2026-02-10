/** @type {import("preact").ComponentChildren} */

const ICON_SIZES = {
  sm: 16,
  md: 18,
  lg: 20,
}

/**
 * @param {Object} props
 * @param {number} props.size
 * @param {string} props.title
 * @param {string} props.path
 * @param {string} [props.ariaLabel]
 * @param {string} [props.className]
 * @returns {import("preact").VNode}
 */
function IconSvg({ size, title, path, ariaLabel, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill="currentColor"
      style="vertical-align: middle; margin: 0 2px;"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      class={className}
    >
      <title>{title}</title>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d={path} />
    </svg>
  )
}

/**
 * @param {string | number} size
 * @returns {number}
 */
function getSize(size) {
  return typeof size === "string" ? ICON_SIZES[size] : size
}

/**
 * @typedef {Object} IconProps
 * @property {"sm" | "md" | "lg" | number} [size]
 */

/**
 * @typedef {Object} IconPropsWithAria
 * @property {"sm" | "md" | "lg" | number} [size]
 * @property {string} [ariaLabel]
 */

/** Settings icon (three dots)
 * @param {IconPropsWithAria} props
 */
export function SettingsIcon({ size = "sm", ariaLabel }) {
  return (
    <IconSvg
      size={getSize(size)}
      title="Settings"
      path="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      ariaLabel={ariaLabel}
    />
  )
}

/** Gear icon (settings)
 * @param {IconPropsWithAria} props
 */
export function GearIcon({ size = "sm", ariaLabel }) {
  return (
    <IconSvg
      size={getSize(size)}
      title="Settings gear"
      path="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      ariaLabel={ariaLabel}
    />
  )
}

/** Upload icon
 * @param {IconProps} props
 */
export function UploadIcon({ size = "sm" }) {
  return <IconSvg size={getSize(size)} title="Upload" path="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
}

/** Download icon
 * @param {IconProps} props
 */
export function DownloadIcon({ size = "sm" }) {
  return <IconSvg size={getSize(size)} title="Download" path="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
}

/** Send bank icon (paper plane)
 * @param {IconPropsWithAria} props
 */
export function SendBankIcon({ size = "sm", ariaLabel }) {
  return (
    <IconSvg
      size={getSize(size)}
      title="Send bank"
      path="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
      ariaLabel={ariaLabel}
    />
  )
}

/** Send voice icon (music note)
 * @param {IconPropsWithAria} props
 */
export function SendVoiceIcon({ size = "sm", ariaLabel }) {
  return (
    <IconSvg
      size={getSize(size)}
      title="Send voice"
      path="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"
      ariaLabel={ariaLabel}
    />
  )
}

/** Receive bank icon (download archive)
 * @param {IconPropsWithAria} props
 */
export function ReceiveBankIcon({ size = "sm", ariaLabel }) {
  return (
    <IconSvg
      size={getSize(size)}
      title="Receive bank"
      path="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"
      ariaLabel={ariaLabel}
    />
  )
}

/** Help icon (question mark)
 * @param {IconPropsWithAria} props
 */
export function HelpIcon({ size = "lg", ariaLabel }) {
  return (
    <IconSvg
      size={getSize(size)}
      title="Help icon"
      path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
      ariaLabel={ariaLabel}
    />
  )
}

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {"sm" | "md" | "lg" | number} [size]
 * @property {string} [ariaLabel]
 */

/** Loading spinner
 * @param {LoadingSpinnerProps} props
 */
export function LoadingSpinner({ size = "md", ariaLabel = "Loading" }) {
  return (
    <IconSvg
      size={getSize(size)}
      title={ariaLabel}
      path="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
      ariaLabel={ariaLabel}
      className="spinner"
    />
  )
}
