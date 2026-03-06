// ─── ProjectEndpoints.tsx ─────────────────────────────────────────────────────
// Sub-página de endpoints vinculada a um projeto específico.
// Inclui: CRUD de endpoints + Painel de Testes de URL.

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ModalDefault from "../../components/ModalDefault";
import EndpointCard from "../../components/EndpointCard";
import EndpointForm, { type EndpointFormData } from "../../components/EndpointForm";
import JsonTextarea from "../../components/JsonTextarea";
import {
    getEndpointsByProject,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
} from "../../services/endpoint.service";
import { testEndpointRoute, type TestRouteResponse } from "../../services/rotasendpoints.service";
import type { Endpoint } from "../../models/Endpoint.model";
import "../../styles/Endpoints.css";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EMPTY_FORM: EndpointFormData = {
    nome: "",
    descricao: "",
    rota: "",
    metodo: "GET",
    controller_nome: "",
};

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusPillClass(status: number): string {
    if (status === 0) return "ep-status-pill ep-status-pill--net";
    if (status < 300) return "ep-status-pill ep-status-pill--ok";
    if (status < 500) return "ep-status-pill ep-status-pill--warn";
    return "ep-status-pill ep-status-pill--error";
}

function prettyJson(value: any): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

// ─── Ícones ───────────────────────────────────────────────────────────────────

function IconSend() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

function IconZap() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

function IconPlus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectEndpoints() {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id);

    // ── Estado: lista ──
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [filtered, setFiltered] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // ── Estado: modal CRUD ──
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EndpointFormData>(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    // ── Estado: painel de testes ──
    const [testerUrl, setTesterUrl] = useState("");
    const [testerMethod, setTesterMethod] = useState<string>("GET");
    const [testerBody, setTesterBody] = useState("");
    const [testerHeaders, setTesterHeaders] = useState("");
    const [testerTab, setTesterTab] = useState<"body" | "headers">("body");
    const [testerLoading, setTesterLoading] = useState(false);
    const [testerResult, setTesterResult] = useState<TestRouteResponse | null>(null);
    const testerRef = useRef<HTMLDivElement>(null);

    // ── Fetch ──
    function fetchEndpoints() {
        setLoading(true);
        getEndpointsByProject(projectId)
            .then((data) => { setEndpoints(data); setFiltered(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => { fetchEndpoints(); }, [projectId]);

    // ── Busca local ──
    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            q
                ? endpoints.filter((ep) =>
                    ep.nome.toLowerCase().includes(q) ||
                    ep.rota.toLowerCase().includes(q) ||
                    ep.metodo.toLowerCase().includes(q)
                )
                : endpoints
        );
    }, [search, endpoints]);

    // ── CRUD: Novo ──
    function handleAdd() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setModalOpen(true);
    }

    // ── CRUD: Editar ──
    function handleEdit(ep: Endpoint) {
        setEditingId(ep.id);
        setForm({
            nome: ep.nome,
            descricao: ep.descricao,
            rota: ep.rota,
            metodo: ep.metodo,
            controller_nome: ep.controller_nome,
        });
        setFormError("");
        setModalOpen(true);
    }

    // ── CRUD: Salvar ──
    async function handleSave() {
        if (!form.nome.trim() || !form.rota.trim()) {
            setFormError("Nome e Rota são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, project_id: projectId } as unknown as Endpoint;
            if (editingId !== null) {
                await updateEndpoint(editingId, payload);
            } else {
                await createEndpoint(payload);
            }
            setModalOpen(false);
            fetchEndpoints();
        } catch {
            setFormError("Erro ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    // ── CRUD: Deletar ──
    async function handleDelete(id: number) {
        if (!window.confirm("Deseja realmente excluir este endpoint?")) return;
        try {
            await deleteEndpoint(id);
            fetchEndpoints();
        } catch (err) {
            console.error(err);
        }
    }

    // ── Tester: preencher a partir do card ──
    function handleTest(ep: Endpoint) {
        setTesterUrl(ep.rota);
        setTesterMethod(ep.metodo.toUpperCase());
        setTesterBody("");
        setTesterHeaders("");
        setTesterResult(null);
        setTimeout(() => testerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }

    // ── Tester: enviar request ──
    async function handleSendTest() {
        if (!testerUrl.trim()) return;
        setTesterLoading(true);
        setTesterResult(null);
        try {
            const result = await testEndpointRoute({
                url: testerUrl.trim(),
                method: testerMethod as any,
                body: testerBody || undefined,
                headers: testerHeaders || undefined,
            });
            setTesterResult(result);
        } finally {
            setTesterLoading(false);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="project-subpage">
            {/* ── Topo: título + busca + botão novo ── */}
            <div className="ep-subpage-header">
                <h2 className="project-subpage__heading">Endpoints</h2>

                <div className="ep-subpage-toolbar">
                    <div className="ep-subpage-search">
                        <svg className="ep-subpage-search__icon" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="ep-subpage-search__input"
                            placeholder="Pesquisar endpoint..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button className="ep-subpage-add-btn" onClick={handleAdd}>
                        <IconPlus />
                        Novo Endpoint
                    </button>
                </div>
            </div>

            {/* ── Lista de cards ── */}
            {loading ? (
                <p className="project-subpage__empty-desc" style={{ padding: "1rem 0" }}>Carregando endpoints...</p>
            ) : filtered.length === 0 ? (
                <div className="project-subpage__empty">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <p className="project-subpage__empty-title">
                        {search ? "Nenhum endpoint encontrado." : "Nenhum endpoint cadastrado"}
                    </p>
                    {!search && (
                        <p className="project-subpage__empty-desc">
                            Documente e teste os endpoints deste projeto.
                        </p>
                    )}
                </div>
            ) : (
                <div className="endpoints-grid">
                    {filtered.map((ep) => (
                        <EndpointCard
                            key={ep.id}
                            endpoint={ep}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onTest={handleTest}
                        />
                    ))}
                </div>
            )}

            {/* ══════════════════════════════════════════
                PAINEL DE TESTES
            ══════════════════════════════════════════ */}
            <div className="ep-tester" ref={testerRef} style={{ marginTop: "1.5rem" }}>
                <div className="ep-tester__header">
                    <span className="ep-tester__title">
                        <IconZap />
                        Testar Endpoint
                    </span>
                </div>

                <div className="ep-tester__body">
                    {/* ── URL Bar ── */}
                    <div className="ep-tester__url-bar">
                        <select
                            className="ep-tester__method-select"
                            value={testerMethod}
                            onChange={(e) => setTesterMethod(e.target.value)}
                        >
                            {HTTP_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            className="ep-tester__url-input"
                            placeholder="https://api.exemplo.com/rota ou /api/rota"
                            value={testerUrl}
                            onChange={(e) => setTesterUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSendTest(); }}
                        />

                        <button
                            className="ep-tester__send-btn"
                            onClick={handleSendTest}
                            disabled={testerLoading || !testerUrl.trim()}
                        >
                            {testerLoading ? <span className="ep-spinner" /> : <IconSend />}
                            {testerLoading ? "Enviando..." : "Enviar"}
                        </button>
                    </div>

                    {/* ── Tabs Body / Headers ── */}
                    <div>
                        <div className="ep-tester__tabs">
                            <button
                                className={`ep-tester__tab${testerTab === "body" ? " ep-tester__tab--active" : ""}`}
                                onClick={() => setTesterTab("body")}
                            >
                                Body (JSON)
                            </button>
                            <button
                                className={`ep-tester__tab${testerTab === "headers" ? " ep-tester__tab--active" : ""}`}
                                onClick={() => setTesterTab("headers")}
                            >
                                Headers
                            </button>
                        </div>

                        {testerTab === "body" ? (
                            <JsonTextarea
                                className="ep-tester__textarea"
                                style={{ marginTop: "0.6rem", width: "100%" }}
                                placeholder={'{\n  "chave": "valor"\n}'}
                                value={testerBody}
                                onChange={setTesterBody}
                                rows={5}
                            />
                        ) : (
                            <JsonTextarea
                                className="ep-tester__textarea"
                                style={{ marginTop: "0.6rem", width: "100%" }}
                                placeholder={'{\n  "Authorization": "Bearer seu-token"\n}'}
                                value={testerHeaders}
                                onChange={setTesterHeaders}
                                rows={4}
                            />
                        )}
                    </div>

                    {/* ── Resposta ── */}
                    {testerResult ? (
                        <div className="ep-tester__response">
                            {/* Meta: status + tempo + content-type */}
                            <div className="ep-tester__response-meta">
                                <span className={statusPillClass(testerResult.status)}>
                                    {testerResult.status || "ERR"} {testerResult.statusText}
                                </span>
                                <span className="ep-tester__duration">⏱ {testerResult.durationMs}ms</span>
                                {testerResult.contentType && (
                                    <span className="ep-tester__content-type">
                                        {testerResult.contentType.split(";")[0]}
                                    </span>
                                )}
                            </div>

                            {/* Corpo */}
                            {testerResult.isHtml ? (
                                <div className="ep-tester__html-notice">
                                    <span>⚠️</span>
                                    <span>
                                        O servidor retornou HTML (página de erro ou redirect).
                                        Verifique se a URL está correta.
                                    </span>
                                </div>
                            ) : testerResult.error !== null ? (
                                <div className="ep-tester__json-block ep-tester__json-block--error">
                                    <pre>
                                        {typeof testerResult.error === "string"
                                            ? testerResult.error
                                            : prettyJson(testerResult.error)}
                                    </pre>
                                </div>
                            ) : testerResult.data !== null && testerResult.data !== "" ? (
                                <div className="ep-tester__json-block">
                                    <pre>{prettyJson(testerResult.data)}</pre>
                                </div>
                            ) : (
                                <div className="ep-tester__empty" style={{ borderStyle: "solid" }}>
                                    Sem corpo na resposta (ex: 204 No Content).
                                </div>
                            )}
                        </div>
                    ) : !testerLoading && (
                        <div className="ep-tester__empty">
                            Clique em ▶ em um endpoint ou preencha a URL acima e envie.
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal CRUD ── */}
            <ModalDefault
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                title={editingId !== null ? "Editar Endpoint" : "Novo Endpoint"}
                description="Preencha os dados do endpoint."
                submitLabel={editingId !== null ? "Salvar Alterações" : "Criar Endpoint"}
                isLoading={saving}
            >
                <EndpointForm
                    form={form}
                    error={formError}
                    onChange={(field, value) => {
                        setForm((p) => ({ ...p, [field]: value }));
                        setFormError("");
                    }}
                />
            </ModalDefault>
        </div>
    );
}
