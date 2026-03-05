import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
    getGithubsByProjectId,
    createGithub,
    deleteGithub,
} from "../../services/github.service"
import {
    getFullRepositoryData,
    type GithubRepo,
    type GithubCommit,
    type GithubBranch,
    type GithubContributor,
} from "../../services/githubrepositories.service"
import type { Github } from "../../models/Github.model"
import "../../styles/ProjectGithub.css"

// ── helpers ───────────────────────────────────────────────────
function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "agora mesmo"
    if (m < 60) return `há ${m}min`
    const h = Math.floor(m / 60)
    if (h < 24) return `há ${h}h`
    const d = Math.floor(h / 24)
    if (d < 30) return `há ${d}d`
    const mo = Math.floor(d / 30)
    return `há ${mo} ${mo === 1 ? "mês" : "meses"}`
}

function shortSha(sha: string) {
    return sha.slice(0, 7)
}

// ── icons ─────────────────────────────────────────────────────
function IconGithub() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
    )
}

function IconPlus() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
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

function IconStar() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}

function IconFork() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
        </svg>
    )
}

function IconIssue() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}

function IconBranch() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
    )
}

function IconLink() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    )
}

function IconClose() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}

// ── sub-componentes reutilizados ──────────────────────────────
function RepoInfoCard({ info }: { info: GithubRepo }) {
    return (
        <div className="gh-repo-card">
            <div className="gh-repo-card__header">
                <span className="gh-repo-card__icon"><IconGithub /></span>
                <div>
                    <a className="gh-repo-card__name" href={info.html_url} target="_blank" rel="noreferrer">
                        {info.full_name}
                    </a>
                    {info.description && (
                        <p className="gh-repo-card__desc">{info.description}</p>
                    )}
                </div>
            </div>
            <div className="gh-repo-card__stats">
                <span className="gh-repo-card__stat"><IconStar /> {info.stargazers_count}</span>
                <span className="gh-repo-card__stat"><IconFork /> {info.forks_count}</span>
                <span className="gh-repo-card__stat"><IconIssue /> {info.open_issues_count} issues</span>
                {info.language && <span className="gh-repo-card__lang">{info.language}</span>}
                <span className="gh-repo-card__visibility">{info.visibility}</span>
            </div>
        </div>
    )
}

function CommitCard({ commit }: { commit: GithubCommit }) {
    const msg = commit.commit.message.split("\n")[0]
    return (
        <a className="gh-commit-card" href={commit.html_url} target="_blank" rel="noreferrer">
            <div className="gh-commit-card__left">
                {commit.author ? (
                    <img className="gh-commit-card__avatar" src={commit.author.avatar_url} alt={commit.author.login} />
                ) : (
                    <div className="gh-commit-card__avatar gh-commit-card__avatar--placeholder">?</div>
                )}
            </div>
            <div className="gh-commit-card__body">
                <p className="gh-commit-card__message">{msg}</p>
                <span className="gh-commit-card__meta">
                    {commit.author?.login ?? commit.commit.author.name}
                    &nbsp;·&nbsp;
                    {relativeTime(commit.commit.author.date)}
                </span>
            </div>
            <span className="gh-commit-card__sha">{shortSha(commit.sha)}</span>
            <span className="gh-commit-card__link-icon"><IconLink /></span>
        </a>
    )
}

function BranchList({ branches, defaultBranch }: { branches: GithubBranch[]; defaultBranch: string }) {
    return (
        <div className="gh-branches">
            {branches.map((b) => (
                <div key={b.name} className="gh-branch-item">
                    <IconBranch />
                    <span className="gh-branch-item__name">{b.name}</span>
                    {b.name === defaultBranch && <span className="gh-branch-item__badge">default</span>}
                    {b.protected && <span className="gh-branch-item__badge gh-branch-item__badge--protected">protected</span>}
                </div>
            ))}
        </div>
    )
}

function ContributorList({ contributors }: { contributors: GithubContributor[] }) {
    return (
        <div className="gh-contributors">
            {contributors.map((c) => (
                <a key={c.login} className="gh-contributor" href={c.html_url} target="_blank" rel="noreferrer">
                    <img className="gh-contributor__avatar" src={c.avatar_url} alt={c.login} />
                    <div>
                        <p className="gh-contributor__name">{c.login}</p>
                        <span className="gh-contributor__commits">{c.contributions} commits</span>
                    </div>
                </a>
            ))}
        </div>
    )
}

// ── Modal de cadastro ─────────────────────────────────────────
type RegisterFormData = {
    nome_repositorio: string
    link_repositorio: string
    stack: string
    observacoes: string
}

const EMPTY_FORM: RegisterFormData = {
    nome_repositorio: "",
    link_repositorio: "",
    stack: "",
    observacoes: "",
}

function RegisterModal({
    onClose,
    onSave,
    saving,
    error,
}: {
    onClose: () => void
    onSave: (form: RegisterFormData) => Promise<void>
    saving: boolean
    error: string
}) {
    const [form, setForm] = useState<RegisterFormData>(EMPTY_FORM)

    function change(field: keyof RegisterFormData, value: string) {
        setForm((p) => ({ ...p, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await onSave(form)
    }

    return (
        <div className="gh-modal-overlay" onClick={onClose}>
            <div className="gh-modal" onClick={(e) => e.stopPropagation()}>
                <div className="gh-modal__header">
                    <h2 className="gh-modal__title">Cadastrar Repositório</h2>
                    <button className="gh-modal__close" onClick={onClose}>
                        <IconClose />
                    </button>
                </div>

                <form className="gh-modal__form" onSubmit={handleSubmit}>
                    <div className="gh-modal__field">
                        <label className="gh-modal__label">Nome do Repositório *</label>
                        <input
                            className="gh-modal__input"
                            type="text"
                            placeholder="ex: devmap-frontend"
                            value={form.nome_repositorio}
                            onChange={(e) => change("nome_repositorio", e.target.value)}
                            required
                        />
                    </div>

                    <div className="gh-modal__field">
                        <label className="gh-modal__label">URL do Repositório *</label>
                        <input
                            className="gh-modal__input"
                            type="url"
                            placeholder="https://github.com/owner/repo"
                            value={form.link_repositorio}
                            onChange={(e) => change("link_repositorio", e.target.value)}
                            required
                        />
                    </div>

                    <div className="gh-modal__field">
                        <label className="gh-modal__label">Stack / Tecnologias</label>
                        <input
                            className="gh-modal__input"
                            type="text"
                            placeholder="ex: React, TypeScript, Node.js"
                            value={form.stack}
                            onChange={(e) => change("stack", e.target.value)}
                        />
                    </div>

                    <div className="gh-modal__field">
                        <label className="gh-modal__label">Observações</label>
                        <textarea
                            className="gh-modal__input gh-modal__textarea"
                            placeholder="Notas sobre o repositório..."
                            value={form.observacoes}
                            onChange={(e) => change("observacoes", e.target.value)}
                            rows={3}
                        />
                    </div>

                    {error && <div className="gh-error">{error}</div>}

                    <div className="gh-modal__actions">
                        <button type="button" className="gh-modal__btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="gh-modal__btn-save" disabled={saving}>
                            {saving ? <span className="gh-url-form__spinner" /> : "Salvar Repositório"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Repo card registrado ──────────────────────────────────────
type RepoData = {
    info: GithubRepo
    commits: GithubCommit[]
    branches: GithubBranch[]
    contributors: GithubContributor[]
}

function RegisteredRepo({
    record,
    onDelete,
}: {
    record: Github & { id: number }
    onDelete: (id: number) => void
}) {
    const [data, setData] = useState<RepoData | null>(null)
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")
    const [expanded, setExpanded] = useState(true)

    useEffect(() => {
        getFullRepositoryData(record.link_repositorio)
            .then(setData)
            .catch(() => setFetchError("Não foi possível carregar os dados do repositório."))
            .finally(() => setLoading(false))
    }, [record.link_repositorio])

    return (
        <div className="gh-registered-repo">
            {/* ── card header (sempre visível) ── */}
            <div className="gh-registered-repo__header">
                <div className="gh-registered-repo__meta">
                    <span className="gh-registered-repo__icon"><IconGithub /></span>
                    <div>
                        <p className="gh-registered-repo__name">{record.nome_repositorio}</p>
                        <a
                            className="gh-registered-repo__url"
                            href={record.link_repositorio}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {record.link_repositorio}
                        </a>
                    </div>
                    {record.stack && (
                        <span className="gh-registered-repo__stack">{record.stack}</span>
                    )}
                </div>
                <div className="gh-registered-repo__actions">
                    <button
                        className="gh-registered-repo__toggle"
                        onClick={() => setExpanded((v) => !v)}
                        title={expanded ? "Recolher" : "Expandir"}
                    >
                        {expanded ? "−" : "+"}
                    </button>
                    <button
                        className="gh-registered-repo__delete"
                        onClick={() => onDelete(record.id)}
                        title="Remover repositório"
                    >
                        <IconTrash />
                    </button>
                </div>
            </div>

            {/* ── dados expandidos ── */}
            {expanded && (
                <div className="gh-registered-repo__body">
                    {loading && (
                        <p className="gh-registered-repo__loading">Carregando dados do GitHub...</p>
                    )}
                    {fetchError && (
                        <div className="gh-error" style={{ margin: "0.75rem 1rem 1rem" }}>{fetchError}</div>
                    )}
                    {data && (
                        <div className="gh-results" style={{ padding: "0 1rem 1rem" }}>
                            <RepoInfoCard info={data.info} />
                            <div className="gh-columns">
                                <section className="gh-section">
                                    <h3 className="gh-section__title">
                                        Commits recentes
                                        <span className="gh-section__count">{data.commits.length}</span>
                                    </h3>
                                    <div className="gh-commit-list">
                                        {data.commits.map((c) => <CommitCard key={c.sha} commit={c} />)}
                                    </div>
                                </section>
                                <div className="gh-aside">
                                    <section className="gh-section">
                                        <h3 className="gh-section__title">
                                            Branches
                                            <span className="gh-section__count">{data.branches.length}</span>
                                        </h3>
                                        <BranchList branches={data.branches} defaultBranch={data.info.default_branch} />
                                    </section>
                                    <section className="gh-section">
                                        <h3 className="gh-section__title">
                                            Contribuidores
                                            <span className="gh-section__count">{data.contributors.length}</span>
                                        </h3>
                                        <ContributorList contributors={data.contributors} />
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── main component ────────────────────────────────────────────
export default function ProjectGithub() {
    const { id } = useParams<{ id: string }>()
    const projectId = Number(id)

    const [records, setRecords] = useState<(Github & { id: number })[]>([])
    const [loadingRecords, setLoadingRecords] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState("")

    function fetchRecords() {
        setLoadingRecords(true)
        getGithubsByProjectId(projectId)
            .then((data) => setRecords(data as (Github & { id: number })[]))
            .catch(console.error)
            .finally(() => setLoadingRecords(false))
    }

    useEffect(() => { fetchRecords() }, [projectId])

    async function handleSave(form: RegisterFormData) {
        if (!form.nome_repositorio.trim() || !form.link_repositorio.trim()) {
            setSaveError("Nome e URL do repositório são obrigatórios.")
            return
        }
        setSaving(true)
        setSaveError("")
        try {
            await createGithub({
                project_id: projectId,
                nome_repositorio: form.nome_repositorio,
                link_repositorio: form.link_repositorio,
                stack: form.stack,
                observacoes: form.observacoes,
            })
            setModalOpen(false)
            fetchRecords()
        } catch {
            setSaveError("Erro ao salvar repositório. Tente novamente.")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(repoId: number) {
        if (!window.confirm("Deseja remover este repositório?")) return
        await deleteGithub(repoId)
        fetchRecords()
    }

    return (
        <div className="project-subpage gh-page">

            {/* ── top bar ── */}
            <div className="gh-topbar">
                <div>
                    <h2 className="project-subpage__heading">GitHub</h2>
                    {records.length > 0 && (
                        <p className="gh-topbar__count">
                            {records.length} {records.length === 1 ? "repositório cadastrado" : "repositórios cadastrados"}
                        </p>
                    )}
                </div>
                <button className="gh-add-btn" onClick={() => { setSaveError(""); setModalOpen(true) }}>
                    <IconPlus />
                    Novo Repositório
                </button>
            </div>

            {/* ── content ── */}
            {loadingRecords ? (
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Carregando repositórios...</p>
            ) : records.length === 0 ? (
                <div className="project-subpage__empty">
                    <IconGithub />
                    <p className="project-subpage__empty-title">Nenhum repositório cadastrado</p>
                    <p className="project-subpage__empty-desc">
                        Clique em <strong>Novo Repositório</strong> para vincular um repositório do GitHub a este projeto.
                    </p>
                </div>
            ) : (
                <div className="gh-repo-list">
                    {records.map((r) => (
                        <RegisteredRepo key={r.id} record={r} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {/* ── modal ── */}
            {modalOpen && (
                <RegisterModal
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                    error={saveError}
                />
            )}
        </div>
    )
}
