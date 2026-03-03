import { useState, useEffect } from "react"
import DefaultPage from "./DefaultPage"
import ProjectCard from "../components/ProjectsCards"
import { getProjects } from "../services/projects.service"
import type { Projects } from "../models/Projects.model"

export default function Projects() {
    const [projects, setProjects] = useState<Projects[]>([])
    const [filtered, setFiltered] = useState<Projects[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProjects()
            .then((data) => {
                setProjects(data)
                setFiltered(data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    function handleSearch(query: string) {
        const q = query.toLowerCase()
        setFiltered(projects.filter((p) =>
            p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q)
        ))
    }

    const STATUS_MAP: Record<string, string> = {
        active: "Em Andamento",
        done: "Concluídos",
        paused: "Pausados",
    }

    function handleFilter(value: string) {
        if (value === "all") return setFiltered(projects)
        const statusReal = STATUS_MAP[value]
        setFiltered(projects.filter((p) => p.status === statusReal))
    }

    function handleAdd() {
        // TODO: abrir modal de novo projeto
        console.log("Novo projeto")
    }

    return (
        <DefaultPage
            tittle="Projetos"
            description="Crie os seus projetos para gerenciar e acompanhar o desenvolvimento deles."
            addLabel="Novo Projeto"
            onAdd={handleAdd}
            onSearch={handleSearch}
            filters={[
                { label: "Todos", value: "all" },
                { label: "Em Andamento", value: "active" },
                { label: "Concluídos", value: "done" },
                { label: "Pausados", value: "paused" },
            ]}
            onFilterChange={handleFilter}
        >
            {loading ? (
                <p className="loading-text">Carregando projetos...</p>
            ) : filtered.length === 0 ? (
                <p className="empty-text">Nenhum projeto encontrado.</p>
            ) : (
                <div className="projects-cards">
                    {filtered.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
            )}
        </DefaultPage>
    )
}