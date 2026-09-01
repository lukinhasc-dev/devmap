import { useState } from "react";
import type { Tasks } from "../models/Tasks.model";
import "../styles/Cards.css";
import "../styles/Tasks.css";

export type KanbanColumn = { chave: string; nome: string; cor: string | null };
export type ResolvedLabel = { nome: string; cor: string | null };

export const PRIORITY_META: Record<string, { label: string; cor: string }> = {
    baixa: { label: "Baixa", cor: "#34d399" },
    media: { label: "Média", cor: "#fbbf24" },
    alta: { label: "Alta", cor: "#ef4444" },
};

export const PRIORITY_OPTIONS = [
    { value: "", label: "Sem criticidade" },
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
];

export function parseLabelIds(json?: string | null): number[] {
    if (!json) return [];
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) return parsed.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
    } catch {
        return [];
    }
    return [];
}

export function stringifyLabelIds(ids: number[]): string | null {
    if (!ids || ids.length === 0) return null;
    return JSON.stringify(ids);
}

type Props = {
    tasks: Tasks[];
    columns: KanbanColumn[];
    onEdit: (task: Tasks) => void;
    onDelete: (id: number) => void;
    onMove: (id: number, chave: string) => void;
    onAddInColumn: (chave: string) => void;
    showPriority?: boolean;
    showLabels?: boolean;
    getLabels?: (task: Tasks) => ResolvedLabel[];
    getProjectName?: (task: Tasks) => string | undefined;
};

function IconEdit() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function IconTrash() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

function IconPlus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export default function KanbanBoard({
    tasks,
    columns,
    onEdit,
    onDelete,
    onMove,
    onAddInColumn,
    showPriority = true,
    showLabels = true,
    getLabels,
    getProjectName,
}: Props) {
    const [dragOver, setDragOver] = useState<string | null>(null);

    function handleDragStart(e: React.DragEvent, task: Tasks) {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDrop(e: React.DragEvent, chave: string) {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData("text/plain"));
        setDragOver(null);
        if (id) onMove(id, chave);
    }

    return (
        <div className="kanban">
            {columns.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.chave);
                return (
                    <div
                        key={col.chave}
                        className={`kanban__col${dragOver === col.chave ? " kanban__col--over" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(col.chave); }}
                        onDragLeave={() => setDragOver((s) => (s === col.chave ? null : s))}
                        onDrop={(e) => handleDrop(e, col.chave)}
                    >
                        <div className="kanban__col-header">
                            <span className="kanban__col-title">
                                <span className="kanban__dot" style={{ background: col.cor ?? "#9ca3af" }} />
                                {col.nome}
                            </span>
                            <span className="kanban__col-count">{columnTasks.length}</span>
                            <button className="kanban__col-add" title="Nova tarefa" onClick={() => onAddInColumn(col.chave)}>
                                <IconPlus />
                            </button>
                        </div>

                        <div className="kanban__col-body">
                            {columnTasks.length === 0 ? (
                                <div className="kanban__empty">Arraste tarefas para cá</div>
                            ) : (
                                columnTasks.map((task) => {
                                    const priority = task.priority ? PRIORITY_META[task.priority] : undefined;
                                    const taskLabels = showLabels && getLabels ? getLabels(task) : [];
                                    const projectName = getProjectName?.(task);
                                    return (
                                        <div
                                            key={task.id}
                                            className="kanban__card"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task)}
                                        >
                                            <div className="kanban__card-top">
                                                <p className="kanban__card-title">{task.titulo}</p>
                                                <div className="kanban__card-actions">
                                                    <button className="card-icon-btn card-icon-btn--edit" title="Editar" onClick={() => onEdit(task)}>
                                                        <IconEdit />
                                                    </button>
                                                    <button className="card-icon-btn card-icon-btn--delete" title="Excluir" onClick={() => onDelete(task.id)}>
                                                        <IconTrash />
                                                    </button>
                                                </div>
                                            </div>

                                            {task.descricao && (
                                                <p className="kanban__card-desc">{task.descricao}</p>
                                            )}

                                            {(taskLabels.length > 0 || (showPriority && priority)) && (
                                                <div className="kanban__chips">
                                                    {showPriority && priority && (
                                                        <span className="kanban__priority" style={{ color: priority.cor, borderColor: priority.cor }}>
                                                            {priority.label}
                                                        </span>
                                                    )}
                                                    {taskLabels.map((l, idx) => (
                                                        <span key={idx} className="kanban__label" style={{ color: l.cor ?? "#b09ac7", borderColor: l.cor ?? "#b09ac7" }}>
                                                            {l.nome}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {projectName && (
                                                <span className="kanban__card-project">{projectName}</span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
