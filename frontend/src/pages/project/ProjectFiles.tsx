import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import {
    getFilesByProjectId,
    uploadFile,
    deleteFile,
    fileUrl,
} from "../../services/projectfile.service"
import {
    getLinksByProjectId,
    createLink,
    updateLink,
    deleteLink,
} from "../../services/projectlink.service"
import {
    getSecretsByProjectId,
    revealSecret,
    createSecret,
    updateSecret,
    deleteSecret,
} from "../../services/projectsecret.service"
import type { ProjectFile } from "../../models/ProjectFile.model"
import type { ProjectLink } from "../../models/ProjectLink.model"
import type { ProjectSecret } from "../../models/ProjectSecret.model"
import "../../styles/ProjectFiles.css"

type Tab = "arquivos" | "links" | "cofre"

const SECRET_TYPES = [
    { value: "senha", label: "Senha" },
    { value: "token", label: "Token" },
    { value: "api_key", label: "API Key" },
    { value: "env", label: ".env" },
    { value: "outro", label: "Outro" },
]

function formatBytes(bytes: number | null): string {
    if (!bytes && bytes !== 0) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mime: string | null): boolean {
    return !!mime && mime.startsWith("image/")
}

function IconPlus() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

function IconTrash() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    )
}

function IconFile() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    )
}

function IconLink() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    )
}

function IconLock() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function IconEye() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function IconCopy() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    )
}

function IconDownload() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    )
}

function IconEdit() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    )
}

function FilesTab({ projectId }: { projectId: number }) {
    const [files, setFiles] = useState<ProjectFile[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<File | null>(null)
    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    function fetchAll() {
        setLoading(true)
        getFilesByProjectId(projectId)
            .then(setFiles)
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchAll() }, [projectId])

    async function handleUpload() {
        if (!selected) {
            setError("Selecione um arquivo.")
            return
        }
        setUploading(true)
        setError("")
        try {
            await uploadFile(projectId, selected, nome, descricao)
            setSelected(null)
            setNome("")
            setDescricao("")
            if (inputRef.current) inputRef.current.value = ""
            fetchAll()
        } catch {
            setError("Erro ao enviar arquivo. Verifique o tamanho (máx. 100MB).")
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Remover este arquivo?")) return
        await deleteFile(id)
        fetchAll()
    }

    return (
        <div className="pf-tab">
            <div className="pf-upload-card">
                <div className="pf-upload-drop" onClick={() => inputRef.current?.click()}>
                    <IconFile />
                    <span>{selected ? selected.name : "Clique para selecionar um arquivo"}</span>
                    <input
                        ref={inputRef}
                        type="file"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0] ?? null
                            setSelected(f)
                            setError("")
                        }}
                    />
                </div>
                <div className="pf-upload-fields">
                    <input
                        className="pf-input"
                        placeholder="Nome (opcional, usa o original)"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <input
                        className="pf-input"
                        placeholder="Descrição (opcional)"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                    <button className="pf-btn-primary" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Enviando..." : "Enviar"}
                    </button>
                </div>
                {error && <div className="pf-error">{error}</div>}
            </div>

            {loading ? (
                <p className="pf-muted">Carregando arquivos...</p>
            ) : files.length === 0 ? (
                <div className="project-subpage__empty">
                    <IconFile />
                    <p className="project-subpage__empty-title">Nenhum arquivo</p>
                    <p className="project-subpage__empty-desc">Envie .env, imagens, diagramas ou qualquer arquivo do projeto.</p>
                </div>
            ) : (
                <div className="pf-grid">
                    {files.map((f) => (
                        <div key={f.id} className="pf-card">
                            {isImage(f.mime) ? (
                                <a href={fileUrl(f.caminho)} target="_blank" rel="noreferrer" className="pf-thumb">
                                    <img src={fileUrl(f.caminho)} alt={f.nome} />
                                </a>
                            ) : (
                                <div className="pf-thumb pf-thumb--icon"><IconFile /></div>
                            )}
                            <div className="pf-card-body">
                                <p className="pf-card-title" title={f.nome}>{f.nome}</p>
                                {f.descricao && <p className="pf-card-desc">{f.descricao}</p>}
                                <span className="pf-card-meta">{formatBytes(f.tamanho)}</span>
                            </div>
                            <div className="pf-card-actions">
                                <a className="pf-icon-btn" href={fileUrl(f.caminho)} download title="Baixar">
                                    <IconDownload />
                                </a>
                                <button className="pf-icon-btn pf-icon-btn--danger" onClick={() => handleDelete(f.id)} title="Remover">
                                    <IconTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function LinksTab({ projectId }: { projectId: number }) {
    const [links, setLinks] = useState<ProjectLink[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [titulo, setTitulo] = useState("")
    const [url, setUrl] = useState("")
    const [descricao, setDescricao] = useState("")
    const [error, setError] = useState("")

    function fetchAll() {
        setLoading(true)
        getLinksByProjectId(projectId)
            .then(setLinks)
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchAll() }, [projectId])

    function reset() {
        setOpen(false)
        setEditingId(null)
        setTitulo("")
        setUrl("")
        setDescricao("")
        setError("")
    }

    function startEdit(l: ProjectLink) {
        setEditingId(l.id)
        setTitulo(l.titulo)
        setUrl(l.url)
        setDescricao(l.descricao ?? "")
        setOpen(true)
        setError("")
    }

    async function handleSave() {
        if (!titulo.trim() || !url.trim()) {
            setError("Título e URL são obrigatórios.")
            return
        }
        try {
            if (editingId !== null) {
                await updateLink(editingId, { titulo, url, descricao })
            } else {
                await createLink({ project_id: projectId, titulo, url, descricao })
            }
            reset()
            fetchAll()
        } catch {
            setError("Erro ao salvar link.")
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Remover este link?")) return
        await deleteLink(id)
        fetchAll()
    }

    return (
        <div className="pf-tab">
            <div className="pf-tab-toolbar">
                <button className="pf-btn-primary" onClick={() => (open ? reset() : setOpen(true))}>
                    <IconPlus /> Novo Link
                </button>
            </div>

            {open && (
                <div className="pf-form-card">
                    <input className="pf-input" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    <input className="pf-input" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
                    <input className="pf-input" placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                    {error && <div className="pf-error">{error}</div>}
                    <div className="pf-form-actions">
                        <button className="pf-btn-ghost" onClick={reset}>Cancelar</button>
                        <button className="pf-btn-primary" onClick={handleSave}>{editingId !== null ? "Salvar" : "Adicionar"}</button>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="pf-muted">Carregando links...</p>
            ) : links.length === 0 ? (
                <div className="project-subpage__empty">
                    <IconLink />
                    <p className="project-subpage__empty-title">Nenhum link</p>
                    <p className="project-subpage__empty-desc">Guarde links de deploy, docs, dashboards e referências.</p>
                </div>
            ) : (
                <div className="pf-list">
                    {links.map((l) => (
                        <div key={l.id} className="pf-row">
                            <span className="pf-row-icon"><IconLink /></span>
                            <div className="pf-row-body">
                                <a className="pf-row-title" href={l.url} target="_blank" rel="noreferrer">{l.titulo}</a>
                                <span className="pf-row-sub">{l.url}</span>
                                {l.descricao && <span className="pf-row-desc">{l.descricao}</span>}
                            </div>
                            <div className="pf-card-actions">
                                <button className="pf-icon-btn" onClick={() => startEdit(l)} title="Editar"><IconEdit /></button>
                                <button className="pf-icon-btn pf-icon-btn--danger" onClick={() => handleDelete(l.id)} title="Remover"><IconTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function SecretRow({ secret, onEdit, onDelete }: { secret: ProjectSecret; onEdit: (s: ProjectSecret) => void; onDelete: (id: number) => void }) {
    const [revealed, setRevealed] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    async function toggleReveal() {
        if (revealed !== null) {
            setRevealed(null)
            return
        }
        setLoading(true)
        try {
            const valor = await revealSecret(secret.id)
            setRevealed(valor)
        } catch {
            setRevealed("(erro ao descriptografar)")
        } finally {
            setLoading(false)
        }
    }

    async function copy() {
        try {
            const valor = revealed ?? (await revealSecret(secret.id))
            await navigator.clipboard.writeText(valor)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            console.error("Erro ao copiar")
        }
    }

    return (
        <div className="pf-row">
            <span className="pf-row-icon"><IconLock /></span>
            <div className="pf-row-body">
                <div className="pf-secret-head">
                    <span className="pf-row-title">{secret.nome}</span>
                    {secret.tipo && <span className="pf-secret-tag">{secret.tipo}</span>}
                </div>
                <span className="pf-secret-value">{revealed !== null ? revealed : "••••••••••••"}</span>
                {secret.descricao && <span className="pf-row-desc">{secret.descricao}</span>}
            </div>
            <div className="pf-card-actions">
                <button className="pf-icon-btn" onClick={toggleReveal} title={revealed !== null ? "Ocultar" : "Revelar"} disabled={loading}>
                    <IconEye />
                </button>
                <button className="pf-icon-btn" onClick={copy} title={copied ? "Copiado!" : "Copiar"}><IconCopy /></button>
                <button className="pf-icon-btn" onClick={() => onEdit(secret)} title="Editar"><IconEdit /></button>
                <button className="pf-icon-btn pf-icon-btn--danger" onClick={() => onDelete(secret.id)} title="Remover"><IconTrash /></button>
            </div>
        </div>
    )
}

function CofreTab({ projectId }: { projectId: number }) {
    const [secrets, setSecrets] = useState<ProjectSecret[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [nome, setNome] = useState("")
    const [tipo, setTipo] = useState("senha")
    const [descricao, setDescricao] = useState("")
    const [valor, setValor] = useState("")
    const [error, setError] = useState("")

    function fetchAll() {
        setLoading(true)
        getSecretsByProjectId(projectId)
            .then(setSecrets)
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchAll() }, [projectId])

    function reset() {
        setOpen(false)
        setEditingId(null)
        setNome("")
        setTipo("senha")
        setDescricao("")
        setValor("")
        setError("")
    }

    function startEdit(s: ProjectSecret) {
        setEditingId(s.id)
        setNome(s.nome)
        setTipo(s.tipo ?? "outro")
        setDescricao(s.descricao ?? "")
        setValor("")
        setOpen(true)
        setError("")
    }

    async function handleSave() {
        if (!nome.trim()) {
            setError("Nome é obrigatório.")
            return
        }
        if (editingId === null && !valor.trim()) {
            setError("Valor é obrigatório.")
            return
        }
        try {
            if (editingId !== null) {
                await updateSecret(editingId, { nome, tipo, descricao, ...(valor.trim() ? { valor } : {}) })
            } else {
                await createSecret({ project_id: projectId, nome, tipo, descricao, valor })
            }
            reset()
            fetchAll()
        } catch {
            setError("Erro ao salvar segredo.")
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Remover este segredo?")) return
        await deleteSecret(id)
        fetchAll()
    }

    return (
        <div className="pf-tab">
            <div className="pf-tab-toolbar">
                <p className="pf-cofre-note"><IconLock /> Valores cifrados com AES-256 e guardados só na sua máquina.</p>
                <button className="pf-btn-primary" onClick={() => (open ? reset() : setOpen(true))}>
                    <IconPlus /> Novo Segredo
                </button>
            </div>

            {open && (
                <div className="pf-form-card">
                    <div className="pf-form-grid">
                        <input className="pf-input" placeholder="Nome (ex: DB_PASSWORD)" value={nome} onChange={(e) => setNome(e.target.value)} />
                        <select className="pf-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            {SECRET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <textarea
                        className="pf-input pf-textarea"
                        placeholder={editingId !== null ? "Novo valor (deixe vazio para manter o atual)" : "Valor secreto"}
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        rows={3}
                    />
                    <input className="pf-input" placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                    {error && <div className="pf-error">{error}</div>}
                    <div className="pf-form-actions">
                        <button className="pf-btn-ghost" onClick={reset}>Cancelar</button>
                        <button className="pf-btn-primary" onClick={handleSave}>{editingId !== null ? "Salvar" : "Adicionar"}</button>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="pf-muted">Carregando cofre...</p>
            ) : secrets.length === 0 ? (
                <div className="project-subpage__empty">
                    <IconLock />
                    <p className="project-subpage__empty-title">Cofre vazio</p>
                    <p className="project-subpage__empty-desc">Guarde senhas, tokens e variáveis de ambiente com segurança.</p>
                </div>
            ) : (
                <div className="pf-list">
                    {secrets.map((s) => (
                        <SecretRow key={s.id} secret={s} onEdit={startEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ProjectFiles() {
    const { id } = useParams<{ id: string }>()
    const projectId = Number(id)
    const [tab, setTab] = useState<Tab>("arquivos")

    return (
        <div className="project-subpage">
            <h2 className="project-subpage__heading">Arquivos</h2>

            <div className="pf-tabs">
                <button className={"pf-tab-btn" + (tab === "arquivos" ? " active" : "")} onClick={() => setTab("arquivos")}>
                    <IconFile /> Arquivos
                </button>
                <button className={"pf-tab-btn" + (tab === "links" ? " active" : "")} onClick={() => setTab("links")}>
                    <IconLink /> Links
                </button>
                <button className={"pf-tab-btn" + (tab === "cofre" ? " active" : "")} onClick={() => setTab("cofre")}>
                    <IconLock /> Cofre
                </button>
            </div>

            {tab === "arquivos" && <FilesTab projectId={projectId} />}
            {tab === "links" && <LinksTab projectId={projectId} />}
            {tab === "cofre" && <CofreTab projectId={projectId} />}
        </div>
    )
}
