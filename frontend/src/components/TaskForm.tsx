import type { Projects } from "../models/Projects.model";
import type { TaskLabel } from "../models/TaskLabel.model";
import { PRIORITY_OPTIONS, type KanbanColumn } from "./KanbanBoard";

export type TaskFormData = {
    titulo: string;
    descricao: string;
    status: string;
    project_id: string;
    priority: string;
    labels: number[];
};

type ProjectWithId = Projects & { id: number };

type Props = {
    form: TaskFormData;
    error: string;
    statuses: KanbanColumn[];
    projects?: ProjectWithId[];
    availableLabels?: TaskLabel[];
    onChange: (field: keyof TaskFormData, value: string) => void;
    onLabelsChange?: (labels: number[]) => void;
};

export default function TaskForm({ form, error, statuses, projects, availableLabels, onChange, onLabelsChange }: Props) {
    function toggleLabel(id: number) {
        if (!onLabelsChange) return;
        onLabelsChange(
            form.labels.includes(id)
                ? form.labels.filter((l) => l !== id)
                : [...form.labels, id]
        );
    }

    return (
        <div className="ep-form">
            {error && <p className="ep-form__error">{error}</p>}

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Título *
                    <input
                        className="ep-form__input"
                        type="text"
                        value={form.titulo}
                        placeholder="ex: Implementar login"
                        onChange={(e) => onChange("titulo", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row">
                <label className="ep-form__label">
                    Descrição *
                    <textarea
                        className="ep-form__input ep-form__textarea"
                        value={form.descricao}
                        rows={3}
                        placeholder="Detalhes da tarefa"
                        onChange={(e) => onChange("descricao", e.target.value)}
                    />
                </label>
            </div>

            <div className="ep-form__row ep-form__row--split">
                <label className="ep-form__label">
                    Status
                    <select
                        className="ep-form__input ep-form__select"
                        value={form.status}
                        onChange={(e) => onChange("status", e.target.value)}
                    >
                        {statuses.map((s) => (
                            <option key={s.chave} value={s.chave}>{s.nome}</option>
                        ))}
                    </select>
                </label>

                <label className="ep-form__label">
                    Criticidade
                    <select
                        className="ep-form__input ep-form__select"
                        value={form.priority}
                        onChange={(e) => onChange("priority", e.target.value)}
                    >
                        {PRIORITY_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            {projects && (
                <div className="ep-form__row">
                    <label className="ep-form__label">
                        Projeto *
                        <select
                            className="ep-form__input ep-form__select"
                            value={form.project_id}
                            onChange={(e) => onChange("project_id", e.target.value)}
                        >
                            <option value="">Selecione um projeto</option>
                            {projects.map((p) => (
                                <option key={p.id} value={String(p.id)}>{p.nome}</option>
                            ))}
                        </select>
                    </label>
                </div>
            )}

            {availableLabels && availableLabels.length > 0 && (
                <div className="ep-form__row">
                    <span className="ep-form__label">Labels</span>
                    <div className="task-label-picker">
                        {availableLabels.map((l) => {
                            const active = form.labels.includes(l.id);
                            return (
                                <button
                                    key={l.id}
                                    type="button"
                                    className={`task-label-chip${active ? " task-label-chip--active" : ""}`}
                                    style={active
                                        ? { background: l.cor ?? "#9d4edd", borderColor: l.cor ?? "#9d4edd", color: "#fff" }
                                        : { color: l.cor ?? "#b09ac7", borderColor: l.cor ?? "#b09ac7" }}
                                    onClick={() => toggleLabel(l.id)}
                                >
                                    {l.nome}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
