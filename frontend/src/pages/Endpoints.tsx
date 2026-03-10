// ─── Endpoints.tsx ─────────────────────────────────────────────────────────
// Página global de Endpoints — apenas Painel de Testes de URL.
// O CRUD de endpoints fica em cada projeto: /projects/:id/endpoints

import { useState } from "react";
import DefaultPage from "./DefaultPage";
import JsonTextarea from "../components/JsonTextarea";
import { testEndpointRoute, type TestRouteResponse } from "../services/rotasendpoints.service";
import "../styles/DefaultPage.css";
import "../styles/Endpoints.css";

// ─── Constantes ───────────────────────────────────────────────────────────────

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

// ─── Componente de Resposta ───────────────────────────────────────────────────

function TesterResponse({ result }: { result: TestRouteResponse }) {
    return (
        <div className="ep-tester__response">
            {/* ── Meta: status + tempo ── */}
            <div className="ep-tester__response-meta">
                <span className={statusPillClass(result.status)}>
                    {result.status || "ERR"} {result.statusText}
                </span>
                <span className="ep-tester__duration">⏱ {result.durationMs}ms</span>
                {result.contentType && (
                    <span className="ep-tester__content-type">{result.contentType.split(";")[0]}</span>
                )}
            </div>

            {/* ── Corpo da resposta ── */}
            {result.isHtml ? (
                <div className="ep-tester__html-notice">
                    <span>⚠️</span>
                    <span>
                        O servidor retornou uma página HTML (provavelmente uma página de erro ou redirect).
                        Verifique se a URL está correta.
                    </span>
                </div>
            ) : result.error !== null ? (
                <div className="ep-tester__json-block ep-tester__json-block--error">
                    <pre>
                        {typeof result.error === "string"
                            ? result.error
                            : prettyJson(result.error)}
                    </pre>
                </div>
            ) : result.data !== null && result.data !== "" ? (
                <div className="ep-tester__json-block">
                    <pre>{prettyJson(result.data)}</pre>
                </div>
            ) : (
                <div className="ep-tester__empty" style={{ borderStyle: "solid" }}>
                    Sem corpo na resposta (ex: 204 No Content).
                </div>
            )}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Endpoints() {
    const [testerUrl, setTesterUrl] = useState("");
    const [testerMethod, setTesterMethod] = useState<string>("GET");
    const [testerBody, setTesterBody] = useState("");
    const [testerHeaders, setTesterHeaders] = useState("");
    const [testerTab, setTesterTab] = useState<"body" | "headers">("body");
    const [testerLoading, setTesterLoading] = useState(false);
    const [testerResult, setTesterResult] = useState<TestRouteResponse | null>(null);

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

    return (
        <DefaultPage
            tittle="Endpoints"
            description="Teste qualquer URL da sua API e veja a resposta em tempo real."
        >
            <div className="ep-tester">
                {/* ── Cabeçalho ── */}
                <div className="ep-tester__header">
                    <span className="ep-tester__title">
                        <IconZap />
                        Testar Endpoint
                    </span>
                    <span className="ep-tester__hint">
                        Para cadastrar endpoints, acesse um projeto → aba Endpoints.
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
                            placeholder="https://api.exemplo.com/rota"
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
                        <TesterResponse result={testerResult} />
                    ) : !testerLoading && (
                        <div className="ep-tester__empty">
                            Envie uma requisição para ver a resposta aqui.
                        </div>
                    )}
                </div>
            </div>
        </DefaultPage>
    );
}