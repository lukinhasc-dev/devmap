import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar.tsx"
import "./styles/App.css"
import Projects from "./pages/Projects.tsx"
import Home from "./pages/Dashboard.tsx"
import Github from "./pages/Github.tsx"
import Databases from "./pages/Databases.tsx"
import Endpoints from "./pages/Endpoints.tsx"
import Tasks from "./pages/Tasks.tsx"

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/projects" element={<Projects />} />
          </Routes>

          <Routes>
            <Route path="/dashboard" element={<Home />} />
          </Routes>

          <Routes>
            <Route path="/github" element={<Github />} />
          </Routes>

          <Routes>
            <Route path="/databases" element={<Databases />} />
          </Routes>

          <Routes>
            <Route path="/endpoints" element={<Endpoints />} />
          </Routes>

          <Routes>
            <Route path="/tasks" element={<Tasks />} />
          </Routes>

        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
