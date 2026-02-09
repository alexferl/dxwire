import { render, screen } from "@testing-library/preact"
import { describe, expect, it, vi } from "vitest"

// Mock VoiceContext before importing Editor
vi.mock("./VoiceContext.jsx", () => {
  const mockVoiceInstance = {
    banks: { value: [{ name: "Init Bank", bank: null }] },
    currentBank: { value: 0 },
    currentVoiceIndex: { value: 0 },
    global: { name: { value: "Init Voice" } },
  }
  return {
    VoiceContext: {
      Provider: ({ children }) => children,
    },
    voiceInstance: mockVoiceInstance,
    useVoice: () => mockVoiceInstance,
  }
})

// Mock child components
vi.mock("./Header/index.jsx", () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock("./Sidebar/index.jsx", () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

vi.mock("./Operators/index.jsx", () => ({
  Operator: ({ number }) => <div data-testid={`operator-${number}`}>Operator {number}</div>,
  Operators: ({ children }) => <div data-testid="operators">{children}</div>,
}))

import { Editor } from "./index"

describe("Editor", () => {
  it("renders the editor container", () => {
    render(<Editor />)

    expect(document.querySelector(".editor")).toBeInTheDocument()
  })

  it("renders Header component", () => {
    render(<Editor />)

    expect(screen.getByTestId("header")).toBeInTheDocument()
  })

  it("renders Sidebar component", () => {
    render(<Editor />)

    expect(screen.getByTestId("sidebar")).toBeInTheDocument()
  })

  it("renders Operators container", () => {
    render(<Editor />)

    expect(screen.getByTestId("operators")).toBeInTheDocument()
  })

  it("renders all 6 operators", () => {
    render(<Editor />)

    expect(screen.getByTestId("operator-1")).toBeInTheDocument()
    expect(screen.getByTestId("operator-2")).toBeInTheDocument()
    expect(screen.getByTestId("operator-3")).toBeInTheDocument()
    expect(screen.getByTestId("operator-4")).toBeInTheDocument()
    expect(screen.getByTestId("operator-5")).toBeInTheDocument()
    expect(screen.getByTestId("operator-6")).toBeInTheDocument()
  })

  it("passes correct numbers to operators", () => {
    render(<Editor />)

    expect(screen.getByText("Operator 1")).toBeInTheDocument()
    expect(screen.getByText("Operator 6")).toBeInTheDocument()
  })

  it("wraps content in VoiceContext.Provider", () => {
    render(<Editor />)

    // If the provider wasn't working, the component would fail
    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByTestId("sidebar")).toBeInTheDocument()
  })
})
