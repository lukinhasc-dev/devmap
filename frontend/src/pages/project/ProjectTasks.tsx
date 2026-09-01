import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModalDefault from "../../components/ModalDefault";
import KanbanBoard, { type KanbanColumn, parseLabelIds, stringifyLabelIds } from "../../components/KanbanBoard";
import TaskForm, { type TaskFormData } from "../../components/TaskForm";
import { getTasks, createTask, updateTask, deleteTask } from "../../services/tasks.service";
import { getStatusesByProject } from "../../services/taskstatus.service";
import { getLabelsByProject } from "../../services/tasklabel.service";
import { getKanbanPrefs, type KanbanPrefs } from "../../services/preferences";
import type { Tasks as Task } from "../../models/Tasks.model";
import type { TaskStatus } from "../../models/TaskStatus.model";
import type { TaskLabel } from "../../models/TaskLabel.model";
import "../../styles/Tasks.css";

const EMPTY_FORM: TaskFormData = {
    titulo: "",
    descricao: "",
    status: "pendente",
    project_id: "",
    priority: "",
    labels: [],
};

function IconPlus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export default function ProjectTasks() {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [labels, setLabels] = useState<TaskLabel[]>([]);
    const [prefs, setPrefs] = useState<KanbanPrefs>({ showPriority: true, showLabels: true });
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    function fetchAll() {
        setLoading(true);
        Promise.all([getTasks(), getStatusesByProject(projectId), getLabelsByProject(projectId)])
            .then(([tasksData, statusesData, labelsData]) => {
                setTasks((tasksData as Task[]).filter((t) => t.project_id === projectId));
                setStatuses(statusesData);
                setLabels(labelsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchAll();
        setPrefs(getKanbanPrefs(projectId));
    }, [projectId]);

    const columns: KanbanColumn[] = statuses.map((s) => ({ chave: s.chave, nome: s.nome, cor: s.cor }));
    const labelsById = new Map(labels.map((l) => [l.id, l]));
    const firstStatus = statuses[0]?.chave ?? "pendente";

    function resolveLabels(task: Task) {
        return parseLabelIds(task.labels)
            .map((lid) => labelsById.get(lid))
            .filter((l): l is TaskLabel => Boolean(l))
            .map((l) => ({ nome: l.nome, cor: l.cor }));
    }

    function handleAdd(status?: string) {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, status: status ?? firstStatus });
        setFormError("");
        setModalOpen(true);
    }

    function handleEdit(task: Task) {
        setEditingId(task.id);
        setForm({
            titulo: task.titulo,
            descricao: task.descricao,
            status: task.status,
            project_id: String(task.project_id),
            priority: task.priority ?? "",
            labels: parseLabelIds(task.labels),
        });
        setFormError("");
        setModalOpen(true);
    }

    async function handleSave() {
        if (!form.titulo.trim() || !form.descricao.trim()) {
            setFormError("Título e Descrição são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                titulo: form.titulo,
                descricao: form.descricao,
                status: form.status,
                project_id: projectId,
                labels: stringifyLabelIds(form.labels),
                priority: form.priority || null,
            } as unknown as Task;

            if (editingId !== null) {
                await updateTask(editingId, payload);
            } else {
                await createTask(payload);
            }
            setModalOpen(false);
            fetchAll();
        } catch {
            setFormError("Erro ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(taskId: number) {
        if (!window.confirm("Deseja realmente excluir esta tarefa?")) return;
        try {
            await deleteTask(taskId);
            fetchAll();
        } catch (err) {
            console.error(err);
        }
    }

    async function handleMove(taskId: number, chave: string) {
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === chave) return;

        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: chave } : t)));
        try {
            await updateTask(taskId, { ...task, status: chave } as Task);
        } catch (err) {
            console.error(err);
            fetchAll();
        }
    }

    return (
        <div className="project-subpage">
            <div className="ep-subpage-header">
                <h2 className="project-subpage__heading">Tasks</h2>

                <div className="ep-subpage-toolbar">
                    <button className="ep-subpage-add-btn" onClick={() => handleAdd()}>
                        <IconPlus />
                        Nova Tarefa
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="project-subpage__empty-desc" style={{ padding: "1rem 0" }}>Carregando tarefas...</p>
            ) : (
                <KanbanBoard
                    tasks={tasks}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMove={handleMove}
                    onAddInColumn={handleAdd}
                    showPriority={prefs.showPriority}
                    showLabels={prefs.showLabels}
                    getLabels={resolveLabels}
                />
            )}

            <ModalDefault
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                title={editingId !== null ? "Editar Tarefa" : "Nova Tarefa"}
                description="Preencha os dados da tarefa."
                submitLabel={editingId !== null ? "Salvar Alterações" : "Criar Tarefa"}
                isLoading={saving}
            >
                <TaskForm
                    form={form}
                    error={formError}
                    statuses={columns}
                    availableLabels={labels}
                    onChange={(field, value) => {
                        setForm((p) => ({ ...p, [field]: value }));
                        setFormError("");
                    }}
                    onLabelsChange={(labelIds) => {
                        setForm((p) => ({ ...p, labels: labelIds }));
                        setFormError("");
                    }}
                />
            </ModalDefault>
        </div>
    );
}
