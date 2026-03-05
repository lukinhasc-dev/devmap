import { useParams, useNavigate, NavLink, Outlet, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getProjects } from "../services/projects.service"
import type { Projects } from "../models/Projects.model"
import "../styles/ProjectDetail.css"

// ── Status slug map ──────────────────────────────────────────
const STATUS_SLUG: Record<string, string> = {
    "Em Andamento": "active",
    "Concluídos": "done",
    "Pausados": "paused",
}

// ── Icons ────────────────────────────────────────────────────
function IconBack() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    )
}

function IconGithub() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
    )
}

function IconDatabase() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
    )
}

function IconEndpoints() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    )
}

// ── Component ────────────────────────────────────────────────
export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [project, setProject] = useState<(Projects & { id: number }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        getProjects()
            .then((data) => {
                const found = data.find((p: Projects & { id: number }) => String(p.id) === id)
                if (found) {
                    setProject(found as Projects & { id: number })
                } else {
                    setNotFound(true)
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="project-detail">
                <p style={{ color: "var(--color-muted)" }}>Carregando projeto...</p>
            </div>
        )
    }

    if (notFound || !project) {
        return <Navigate to="/projects" replace />
    }

    const slug = STATUS_SLUG[project.status] ?? "unknown"
    const base = `/projects/${id}`

    return (
        <div className="project-detail">
            {/* ── Header ── */}
            <header className="project-detail__header">
                <button
                    className="project-detail__back-btn"
                    onClick={() => navigate("/projects")}
                >
                    <IconBack />
                    Voltar
                </button>

                <div className="project-detail__title-group">
                    <h1 className="project-detail__name">{project.nome}</h1>
                    <span className={`project-detail__status project-detail__status--${slug}`}>
                        {project.status}
                    </span>
                </div>
            </header>

            {/* ── Sub-navigation ── */}
            <nav className="project-detail__nav">
                <NavLink
                    to={`${base}/github`}
                    className={({ isActive }: { isActive: boolean }) =>
                        "project-detail__nav-link" + (isActive ? " active" : "")
                    }
                >
                    <IconGithub />
                    GitHub
                </NavLink>

                <NavLink
                    to={`${base}/databases`}
                    className={({ isActive }: { isActive: boolean }) =>
                        "project-detail__nav-link" + (isActive ? " active" : "")
                    }
                >
                    <IconDatabase />
                    Databases
                </NavLink>

                <NavLink
                    to={`${base}/endpoints`}
                    className={({ isActive }: { isActive: boolean }) =>
                        "project-detail__nav-link" + (isActive ? " active" : "")
                    }
                >
                    <IconEndpoints />
                    Endpoints
                </NavLink>
            </nav>

            {/* ── Content (sub-pages rendered here) ── */}
            <div className="project-detail__content">
                <Outlet />
            </div>
        </div>
    )
}
