import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { NotFound } from "./pages/_404.jsx"
import { Home } from "./pages/Home/index.jsx"
import "./style.css"

/**
 * Main application component.
 * Sets up the router for the SolidJS routing system.
 * @returns {import("solid-js").JSX.Element}
 */
function App() {
  return (
    <main>
      <Router>
        <Route path="/" component={Home} />
        <Route path="*" component={NotFound} />
      </Router>
    </main>
  )
}

render(() => <App />, document.getElementById("app"))
