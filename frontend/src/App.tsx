import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar.tsx"
import "./styles/App.css"
import Projects from "./pages/Projects.tsx"
import Home from "./pages/Dashboard.tsx"
import Github from "./pages/Github.tsx"
import Databases from "./pages/Databases.tsx"
import Endpoints from "./pages/Endpoints.tsx"
import Tasks from "./pages/Tasks.tsx"
import ProjectDetail from "./pages/ProjectDetail.tsx"
import ProjectGithub from "./pages/project/ProjectGithub.tsx"
import ProjectDatabases from "./pages/project/ProjectDatabases.tsx"
import ProjectEndpoints from "./pages/project/ProjectEndpoints.tsx"

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/github" element={<Github />} />
            <Route path="/databases" element={<Databases />} />
            <Route path="/endpoints" element={<Endpoints />} />
            <Route path="/tasks" element={<Tasks />} />

            {/* ── Projeto detail com sub-rotas ── */}
            <Route path="/projects/:id" element={<ProjectDetail />}>
              <Route index element={<Navigate to="github" replace />} />
              <Route path="github" element={<ProjectGithub />} />
              <Route path="databases" element={<ProjectDatabases />} />
              <Route path="endpoints" element={<ProjectEndpoints />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
