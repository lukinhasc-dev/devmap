import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar.tsx"
import "./styles/App.css"
import Projects from "./pages/Projects.tsx"

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Projects />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
