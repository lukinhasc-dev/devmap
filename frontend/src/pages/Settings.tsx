import { useEffect, useState } from "react";
import DefaultPage from "./DefaultPage";
import ModalDefault from "../components/ModalDefault";
import Switch from "../components/Switch";
import { getProjects } from "../services/projects.service";
import {
    getStatusesByProject,
    createStatus,
    updateStatus,
    deleteStatus,
} from "../services/taskstatus.service";
import {
    getLabelsByProject,
    createLabel,
    updateLabel,
    deleteLabel,
} from "../services/tasklabel.service";
import { getKanbanPrefs, setKanbanPrefs, type KanbanPrefs } from "../services/preferences";
import type { Projects } from "../models/Projects.model";
import type { TaskStatus } from "../models/TaskStatus.model";
import type { TaskLabel } from "../models/TaskLabel.model";
import "../styles/DefaultPage.css";
import "../styles/Settings.css";

type ProjectWithId = Projects & { id: number };

const COLOR_PRESETS = ["#9d4edd", "#60a5fa", "#34d399", "#fbbf24", "#ef4444", "#a78bfa", "#f472b6", "#9ca3af"];

type ItemForm = { nome: string; cor: string };
const EMPTY_ITEM: ItemForm = { nome: "", cor: "#9d4edd" };

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="settings-color">
            <div className="settings-color__swatches">
                {COLOR_PRESETS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        className={`settings-color__swatch${value === c ? " settings-color__swatch--active" : ""}`}
                        style={{ background: c }}
                        onClick={() => onChange(c)}
                        title={c}
                    />
                ))}
            </div>
            <input
                type="color"
                className="settings-color__input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
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

function IconUp() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
        </svg>
    );
}

function IconDown() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function IconChevron() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

export default function Settings() {
    const [projects, setProjects] = useState<ProjectWithId[]>([]);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [labels, setLabels] = useState<TaskLabel[]>([]);
    const [prefs, setPrefs] = useState<KanbanPrefs>({ showPriority: true, showLabels: true });
    const [loading, setLoading] = useState(true);

    const [expanded, setExpanded] = useState<"status" | "labels" | null>(null);

    const [statusModal, setStatusModal] = useState(false);
    const [statusForm, setStatusForm] = useState<ItemForm>(EMPTY_ITEM);
    const [statusEditingId, setStatusEditingId] = useState<number | null>(null);
    const [statusError, setStatusError] = useState("");
    const [statusSaving, setStatusSaving] = useState(false);

    const [labelModal, setLabelModal] = useState(false);
    const [labelForm, setLabelForm] = useState<ItemForm>(EMPTY_ITEM);
    const [labelEditingId, setLabelEditingId] = useState<number | null>(null);
    const [labelError, setLabelError] = useState("");
    const [labelSaving, setLabelSaving] = useState(false);

    useEffect(() => {
        getProjects()
            .then((data: ProjectWithId[]) => {
                setProjects(data);
                if (data.length > 0) setProjectId(data[0].id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    function fetchConfig(pid: number) {
        Promise.all([getStatusesByProject(pid), getLabelsByProject(pid)])
            .then(([statusesData, labelsData]) => {
                setStatuses(statusesData);
                setLabels(labelsData);
            })
            .catch(console.error);
    }

    useEffect(() => {
        if (projectId) {
            fetchConfig(projectId);
            setPrefs(getKanbanPrefs(projectId));
        }
    }, [projectId]);

    function updatePref(key: keyof KanbanPrefs, value: boolean) {
        if (!projectId) return;
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        setKanbanPrefs(projectId, next);
    }

    function openAddStatus() {
        setStatusEditingId(null);
        setStatusForm(EMPTY_ITEM);
        setStatusError("");
        setStatusModal(true);
    }

    function openEditStatus(s: TaskStatus) {
        setStatusEditingId(s.id);
        setStatusForm({ nome: s.nome, cor: s.cor ?? "#9d4edd" });
        setStatusError("");
        setStatusModal(true);
    }

    async function saveStatus() {
        if (!statusForm.nome.trim()) {
            setStatusError("O nome é obrigatório.");
            return;
        }
        if (!projectId) return;
        setStatusSaving(true);
        try {
            if (statusEditingId !== null) {
                const current = statuses.find((s) => s.id === statusEditingId);
                await updateStatus(statusEditingId, { nome: statusForm.nome, cor: statusForm.cor, ordem: current?.ordem ?? 0 });
            } else {
                await createStatus({ nome: statusForm.nome, cor: statusForm.cor, project_id: projectId });
            }
            setStatusModal(false);
            fetchConfig(projectId);
        } catch {
            setStatusError("Erro ao salvar. Tente novamente.");
        } finally {
            setStatusSaving(false);
        }
    }

    async function removeStatus(s: TaskStatus) {
        if (!window.confirm(`Excluir o status "${s.nome}"?`)) return;
        try {
            await deleteStatus(s.id);
            if (projectId) fetchConfig(projectId);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Erro ao excluir status.";
            window.alert(msg);
        }
    }

    async function moveStatus(index: number, dir: -1 | 1) {
        const target = index + dir;
        if (target < 0 || target >= statuses.length) return;
        const a = statuses[index];
        const b = statuses[target];
        try {
            await Promise.all([
                updateStatus(a.id, { nome: a.nome, cor: a.cor, ordem: b.ordem }),
                updateStatus(b.id, { nome: b.nome, cor: b.cor, ordem: a.ordem }),
            ]);
            if (projectId) fetchConfig(projectId);
        } catch (err) {
            console.error(err);
        }
    }

    function openAddLabel() {
        setLabelEditingId(null);
        setLabelForm(EMPTY_ITEM);
        setLabelError("");
        setLabelModal(true);
    }

    function openEditLabel(l: TaskLabel) {
        setLabelEditingId(l.id);
        setLabelForm({ nome: l.nome, cor: l.cor ?? "#9d4edd" });
        setLabelError("");
        setLabelModal(true);
    }

    async function saveLabel() {
        if (!labelForm.nome.trim()) {
            setLabelError("O nome é obrigatório.");
            return;
        }
        if (!projectId) return;
        setLabelSaving(true);
        try {
            if (labelEditingId !== null) {
                await updateLabel(labelEditingId, { nome: labelForm.nome, cor: labelForm.cor });
            } else {
                await createLabel({ nome: labelForm.nome, cor: labelForm.cor, project_id: projectId });
            }
            setLabelModal(false);
            fetchConfig(projectId);
        } catch {
            setLabelError("Erro ao salvar. Tente novamente.");
        } finally {
            setLabelSaving(false);
        }
    }

    async function removeLabel(l: TaskLabel) {
        if (!window.confirm(`Excluir a label "${l.nome}"?`)) return;
        try {
            await deleteLabel(l.id);
            if (projectId) fetchConfig(projectId);
        } catch (err) {
            console.error(err);
        }
    }

    function toggleSection(section: "status" | "labels") {
        setExpanded((s) => (s === section ? null : section));
    }

    return (
        <DefaultPage tittle="Configurações" description="Personalize o Kanban e o comportamento de cada projeto.">
            {loading ? (
                <p style={{ color: "var(--color-muted)", padding: "1rem 0" }}>Carregando...</p>
            ) : projects.length === 0 ? (
                <p style={{ color: "var(--color-muted)" }}>Nenhum projeto cadastrado ainda.</p>
            ) : (
                <>
                    <div className="settings-project-bar">
                        <label className="ep-form__label" style={{ maxWidth: 360 }}>
                            Projeto
                            <select
                                className="ep-form__input ep-form__select"
                                value={projectId ?? ""}
                                onChange={(e) => { setProjectId(Number(e.target.value)); setExpanded(null); }}
                            >
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="settings-card">
                        <div className="settings-row">
                            <div className="settings-row__main">
                                <span className="settings-row__title">Exibir criticidade nos cards</span>
                                <span className="settings-row__desc">Mostra o nível (Baixa/Média/Alta) como um selo no card da tarefa.</span>
                            </div>
                            <div className="settings-row__control">
                                <Switch checked={prefs.showPriority} onChange={(v) => updatePref("showPriority", v)} />
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-row__main">
                                <span className="settings-row__title">Exibir labels nos cards</span>
                                <span className="settings-row__desc">Mostra as etiquetas coloridas (ex: Bug, Resolver) no card da tarefa.</span>
                            </div>
                            <div className="settings-row__control">
                                <Switch checked={prefs.showLabels} onChange={(v) => updatePref("showLabels", v)} />
                            </div>
                        </div>

                        <div className="settings-section">
                            <button
                                className={`settings-row settings-row--button${expanded === "status" ? " settings-row--open" : ""}`}
                                onClick={() => toggleSection("status")}
                            >
                                <div className="settings-row__main">
                                    <span className="settings-row__title">Status do Kanban</span>
                                    <span className="settings-row__desc">As colunas do board deste projeto. Crie, renomeie, reordene e defina cores.</span>
                                </div>
                                <div className="settings-row__control">
                                    <span className="settings-row__count">{statuses.length}</span>
                                    <span className="settings-row__chevron"><IconChevron /></span>
                                </div>
                            </button>

                            {expanded === "status" && (
                                <div className="settings-row__body">
                                    <div className="settings-list">
                                        {statuses.map((s, i) => (
                                            <div className="settings-item" key={s.id}>
                                                <span className="settings-item__swatch" style={{ background: s.cor ?? "#9ca3af" }} />
                                                <span className="settings-item__name">{s.nome}</span>
                                                <span className="settings-item__chave">{s.chave}</span>
                                                <div className="settings-item__actions">
                                                    <button className="card-icon-btn" title="Mover para cima" onClick={() => moveStatus(i, -1)} disabled={i === 0}>
                                                        <IconUp />
                                                    </button>
                                                    <button className="card-icon-btn" title="Mover para baixo" onClick={() => moveStatus(i, 1)} disabled={i === statuses.length - 1}>
                                                        <IconDown />
                                                    </button>
                                                    <button className="card-icon-btn card-icon-btn--edit" title="Editar" onClick={() => openEditStatus(s)}>
                                                        <IconEdit />
                                                    </button>
                                                    <button className="card-icon-btn card-icon-btn--delete" title="Excluir" onClick={() => removeStatus(s)}>
                                                        <IconTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="settings-add-btn" onClick={openAddStatus}>
                                        <IconPlus />
                                        Novo Status
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="settings-section">
                            <button
                                className={`settings-row settings-row--button${expanded === "labels" ? " settings-row--open" : ""}`}
                                onClick={() => toggleSection("labels")}
                            >
                                <div className="settings-row__main">
                                    <span className="settings-row__title">Labels</span>
                                    <span className="settings-row__desc">Etiquetas para marcar tarefas (ex: Bug, Resolver), cada uma com sua cor.</span>
                                </div>
                                <div className="settings-row__control">
                                    <span className="settings-row__count">{labels.length}</span>
                                    <span className="settings-row__chevron"><IconChevron /></span>
                                </div>
                            </button>

                            {expanded === "labels" && (
                                <div className="settings-row__body">
                                    <div className="settings-list">
                                        {labels.length === 0 ? (
                                            <p className="settings-empty">Nenhuma label ainda. Crie ex: "Bug", "Resolver".</p>
                                        ) : (
                                            labels.map((l) => (
                                                <div className="settings-item" key={l.id}>
                                                    <span className="settings-item__swatch" style={{ background: l.cor ?? "#9ca3af" }} />
                                                    <span className="settings-item__name">{l.nome}</span>
                                                    <div className="settings-item__actions">
                                                        <button className="card-icon-btn card-icon-btn--edit" title="Editar" onClick={() => openEditLabel(l)}>
                                                            <IconEdit />
                                                        </button>
                                                        <button className="card-icon-btn card-icon-btn--delete" title="Excluir" onClick={() => removeLabel(l)}>
                                                            <IconTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <button className="settings-add-btn" onClick={openAddLabel}>
                                        <IconPlus />
                                        Nova Label
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <ModalDefault
                isOpen={statusModal}
                onClose={() => setStatusModal(false)}
                onSubmit={saveStatus}
                title={statusEditingId !== null ? "Editar Status" : "Novo Status"}
                description="Uma coluna do seu Kanban."
                submitLabel={statusEditingId !== null ? "Salvar" : "Criar"}
                isLoading={statusSaving}
            >
                <div className="ep-form">
                    {statusError && <p className="ep-form__error">{statusError}</p>}
                    <div className="ep-form__row">
                        <label className="ep-form__label">
                            Nome *
                            <input
                                className="ep-form__input"
                                type="text"
                                value={statusForm.nome}
                                placeholder="ex: Em Revisão"
                                onChange={(e) => { setStatusForm((p) => ({ ...p, nome: e.target.value })); setStatusError(""); }}
                            />
                        </label>
                    </div>
                    <div className="ep-form__row">
                        <span className="ep-form__label">Cor</span>
                        <ColorField value={statusForm.cor} onChange={(cor) => setStatusForm((p) => ({ ...p, cor }))} />
                    </div>
                </div>
            </ModalDefault>

            <ModalDefault
                isOpen={labelModal}
                onClose={() => setLabelModal(false)}
                onSubmit={saveLabel}
                title={labelEditingId !== null ? "Editar Label" : "Nova Label"}
                description="Uma etiqueta para marcar tarefas."
                submitLabel={labelEditingId !== null ? "Salvar" : "Criar"}
                isLoading={labelSaving}
            >
                <div className="ep-form">
                    {labelError && <p className="ep-form__error">{labelError}</p>}
                    <div className="ep-form__row">
                        <label className="ep-form__label">
                            Nome *
                            <input
                                className="ep-form__input"
                                type="text"
                                value={labelForm.nome}
                                placeholder="ex: Bug"
                                onChange={(e) => { setLabelForm((p) => ({ ...p, nome: e.target.value })); setLabelError(""); }}
                            />
                        </label>
                    </div>
                    <div className="ep-form__row">
                        <span className="ep-form__label">Cor</span>
                        <ColorField value={labelForm.cor} onChange={(cor) => setLabelForm((p) => ({ ...p, cor }))} />
                    </div>
                </div>
            </ModalDefault>
        </DefaultPage>
    );
}
