import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar.tsx"
import "./styles/App.css"
import Projects from "./pages/Projects.tsx"
import Home from "./pages/Dashboard.tsx"
import Endpoints from "./pages/Endpoints.tsx"
import Tasks from "./pages/Tasks.tsx"
import ProjectDetail from "./pages/ProjectDetail.tsx"
import ProjectGithub from "./pages/project/ProjectGithub.tsx"
import ProjectDatabases from "./pages/project/ProjectDatabases.tsx"
import ProjectEndpoints from "./pages/project/ProjectEndpoints.tsx"
import ProjectControllers from "./pages/project/ProjectController.tsx"
import ProjectTasks from "./pages/project/ProjectTasks.tsx"
import ProjectFiles from "./pages/project/ProjectFiles.tsx"
import Settings from "./pages/Settings.tsx"


function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/endpoints" element={<Endpoints />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/projects/:id" element={<ProjectDetail />}>
              <Route path="github" element={<ProjectGithub />} />
              <Route path="databases" element={<ProjectDatabases />} />
              <Route path="endpoints" element={<ProjectEndpoints />} />
              <Route path="controllers" element={<ProjectControllers />} />
              <Route path="tasks" element={<ProjectTasks />} />
              <Route path="files" element={<ProjectFiles />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
