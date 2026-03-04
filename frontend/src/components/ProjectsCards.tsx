import "../styles/Cards.css"
import { useNavigate } from "react-router-dom"
import type { Projects } from "../models/Projects.model"

type ProjectCardProps = {
    project: Projects & { id: number }
    onEdit?: (project: Projects & { id: number }) => void
    onDelete?: (id: number) => void
}

// ── Icons ──────────────────────────────────────────────
function IconEdit() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    )
}

function IconTrash() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    )
}

function IconEnter() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M10 14L21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
    )
}

// ── Status label map ────────────────────────────────────
const STATUS_SLUG: Record<string, string> = {
    "Em Andamento": "active",
    "Concluídos": "done",
    "Pausados": "paused",
}

// ── Component ───────────────────────────────────────────
export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const navigate = useNavigate()
    const slug = STATUS_SLUG[project.status] ?? "unknown"

    return (
        <div className="card">
            {/* ── Topo: título + ações ── */}
            <div className="card-header">
                <h3 className="card-title">{project.nome}</h3>
                <div className="card-actions">
                    <button
                        className="card-icon-btn card-icon-btn--edit"
                        title="Editar projeto"
                        onClick={() => onEdit?.(project)}
                    >
                        <IconEdit />
                    </button>
                    <button
                        className="card-icon-btn card-icon-btn--delete"
                        title="Excluir projeto"
                        onClick={() => onDelete?.(project.id)}
                    >
                        <IconTrash />
                    </button>
                    <button
                        className="card-icon-btn card-icon-btn--enter"
                        title="Entrar no projeto"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <IconEnter />
                    </button>
                </div>
            </div>

            {/* ── Descrição ── */}
            <p className="card-description">{project.descricao}</p>

            {/* ── Status badge ── */}
            <span className={`card-status card-status--${slug}`}>
                {project.status}
            </span>
        </div>
    )
}