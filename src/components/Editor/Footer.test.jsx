import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it } from "vitest"

import { Footer } from "./index"

describe("Footer", () => {
  it("renders footer element", () => {
    render(() => <Footer />)

    expect(document.querySelector(".editor-footer")).toBeInTheDocument()
  })

  it("renders GitHub link", () => {
    render(() => <Footer />)

    const link = document.querySelector(".footer-link")
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent("GitHub")
  })

  it("has correct GitHub URL", () => {
    render(() => <Footer />)

    const link = document.querySelector(".footer-link")
    expect(link).toHaveAttribute("href", "https://github.com/alexferl/dxwire")
  })

  it("opens link in new tab", () => {
    render(() => <Footer />)

    const link = document.querySelector(".footer-link")
    expect(link).toHaveAttribute("target", "_blank")
  })

  it("has security rel attributes", () => {
    render(() => <Footer />)

    const link = document.querySelector(".footer-link")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders GitHub icon with correct aria-label", () => {
    render(() => <Footer />)

    const icon = screen.getByLabelText("GitHub")
    expect(icon).toBeInTheDocument()
  })

  it("has correct CSS class for link", () => {
    render(() => <Footer />)

    const link = document.querySelector(".footer-link")
    expect(link).toHaveClass("footer-link")
  })
})
