import { render } from "preact"
import { LocationProvider, Route, Router } from "preact-iso"
import { NotFound } from "./pages/_404.jsx"
import { Home } from "./pages/Home/index.jsx"
import "./style.css"

/**
 * Main application component.
 * Sets up the router and location provider for the Preact ISO routing system.
 * @returns {import("preact").VNode}
 */
export function App() {
  return (
    <LocationProvider>
      <main>
        <Router>
          <Route path="/" component={Home} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  )
}

render(<App />, document.getElementById("app"))
