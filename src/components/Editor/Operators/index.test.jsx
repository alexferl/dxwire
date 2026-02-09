import { render, screen } from "@testing-library/preact"
import { describe, expect, it } from "vitest"
import { Operators } from "./index.jsx"

describe("Operators", () => {
  it("renders children", () => {
    render(
      <Operators>
        <div data-testid="child1">Operator 1</div>
        <div data-testid="child2">Operator 2</div>
      </Operators>,
    )
    expect(screen.getByTestId("child1")).toBeInTheDocument()
    expect(screen.getByTestId("child2")).toBeInTheDocument()
  })

  it("has correct CSS class", () => {
    render(
      <Operators>
        <div>Child</div>
      </Operators>,
    )
    expect(document.querySelector(".operators-grid")).toBeInTheDocument()
  })
})
