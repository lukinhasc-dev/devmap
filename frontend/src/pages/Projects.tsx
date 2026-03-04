import { useState, useEffect } from "react"
import DefaultPage from "./DefaultPage"
import ProjectCard from "../components/ProjectsCards"
import ModalDefault from "../components/ModalDefault"
import ProjectForm, { type ProjectFormData } from "../components/ProjectForm"
import { getProjects, createProject, updateProject, deleteProject } from "../services/projects.service"
import type { Projects } from "../models/Projects.model"

const EMPTY_FORM: ProjectFormData = {
    nome: "",
    descricao: "",
    status: "Em Andamento",
    responsavel: "",
    data_inicio: "",
    data_entrega: "",
}

const STATUS_MAP: Record<string, string> = {
    active: "Em Andamento",
    done: "Concluídos",
    paused: "Pausados",
}

export default function Projects() {
    const [projects, setProjects] = useState<Projects[]>([])
    const [filtered, setFiltered] = useState<Projects[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<ProjectFormData>(EMPTY_FORM)
    const [error, setError] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)

    function fetchProjects() {
        setLoading(true)
        getProjects()
            .then((data) => { setProjects(data); setFiltered(data) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchProjects() }, [])

    function handleSearch(query: string) {
        const q = query.toLowerCase()
        setFiltered(projects.filter((p) =>
            p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q)
        ))
    }

    function handleFilter(value: string) {
        if (value === "all") return setFiltered(projects)
        setFiltered(projects.filter((p) => p.status === STATUS_MAP[value]))
    }

    function handleAdd() {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setError("")
        setModalOpen(true)
    }

    function handleEdit(project: Projects) {
        setEditingId(project.id)
        setForm({
            nome: project.nome,
            descricao: project.descricao,
            status: project.status,
            responsavel: project.responsavel,
            data_inicio: project.data_inicio?.slice(0, 10) ?? "",
            data_entrega: project.data_entrega?.slice(0, 10) ?? "",
        })
        setError("")
        setModalOpen(true)
    }

    async function handleSave() {
        if (!form.nome.trim() || !form.responsavel.trim() || !form.data_inicio) {
            setError("Nome, responsável e data de início são obrigatórios.")
            return
        }
        setSaving(true)
        try {
            const payload = { ...form, data_entrega: form.data_entrega || undefined } as unknown as Projects
            if (editingId !== null) {
                await updateProject(editingId, payload)
            } else {
                await createProject(payload)
            }
            setModalOpen(false)
            fetchProjects()
        } catch {
            setError("Erro ao salvar projeto. Tente novamente.")
        } finally {
            setSaving(false)
        }
    }



    async function handleDelete(id: number) {
        if (!window.confirm("Deseja realmente excluir este projeto?")) return
        try {
            await deleteProject(id)
            fetchProjects()
        } catch (err) {
            console.error(err)
        }
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
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <ModalDefault
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                title={editingId !== null ? "Editar Projeto" : "Novo Projeto"}
                description="Preencha os dados do projeto abaixo."
                submitLabel={editingId !== null ? "Salvar Alterações" : "Criar Projeto"}
                isLoading={saving}
            >
                <ProjectForm
                    form={form}
                    error={error}
                    onChange={(field, value) => { setForm((p) => ({ ...p, [field]: value })); setError("") }}
                />
            </ModalDefault>
        </DefaultPage>
    )
}