import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import JsonTextarea from "./JsonTextarea";
import JsonHighlight from "./JsonHighlight";
import AuthEditor, { EMPTY_AUTH, applyAuth } from "./AuthEditor";
import KeyValueEditor, { type KeyValuePair, parsePairs, appendQuery } from "./KeyValueEditor";
import type { AuthConfig } from "../models/Auth.model";
import { testEndpointRoute, type TestRouteResponse } from "../services/rotasendpoints.service";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export type LoadRequestInput = {
    url: string;
    method?: string;
    headers?: string;
    body?: string;
    params?: string;
    auth?: AuthConfig;
};

export type EndpointTesterHandle = {
    loadRequest: (req: LoadRequestInput) => void;
};

type Props = {
    hint?: ReactNode;
};

function statusPillClass(status: number): string {
    if (status === 0) return "ep-status-pill ep-status-pill--net";
    if (status < 300) return "ep-status-pill ep-status-pill--ok";
    if (status < 500) return "ep-status-pill ep-status-pill--warn";
    return "ep-status-pill ep-status-pill--error";
}

function formatBytes(bytes: number): string {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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

function IconCopy() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

const EndpointTester = forwardRef<EndpointTesterHandle, Props>(function EndpointTester({ hint }, ref) {
    const [url, setUrl] = useState("");
    const [method, setMethod] = useState<string>("GET");
    const [body, setBody] = useState("");
    const [headers, setHeaders] = useState("");
    const [params, setParams] = useState<KeyValuePair[]>([]);
    const [auth, setAuth] = useState<AuthConfig>(EMPTY_AUTH);
    const [reqTab, setReqTab] = useState<"params" | "body" | "headers" | "auth">("body");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TestRouteResponse | null>(null);
    const [respTab, setRespTab] = useState<"pretty" | "raw" | "headers">("pretty");
    const [copied, setCopied] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        loadRequest(req: LoadRequestInput) {
            setUrl(req.url ?? "");
            setMethod((req.method ?? "GET").toUpperCase());
            setBody(req.body ?? "");
            setHeaders(req.headers ?? "");
            setParams(parsePairs(req.params));
            setAuth(req.auth ?? EMPTY_AUTH);
            setReqTab(req.body ? "body" : "headers");
            setResult(null);
            setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        },
    }));

    async function handleSend() {
        if (!url.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            let finalUrl = appendQuery(url.trim(), params);
            let finalHeaders = headers;

            let headersObj: Record<string, string> = {};
            let headersOk = true;
            if (headers.trim()) {
                try {
                    headersObj = JSON.parse(headers);
                } catch {
                    headersOk = false;
                }
            }

            if (headersOk) {
                const applied = applyAuth(finalUrl, headersObj, auth);
                finalUrl = applied.url;
                finalHeaders = Object.keys(applied.headers).length ? JSON.stringify(applied.headers) : "";
            }

            const res = await testEndpointRoute({
                url: finalUrl,
                method: method as any,
                body: body || undefined,
                headers: finalHeaders || undefined,
            });
            setResult(res);
            setRespTab(res.error !== null ? "raw" : "pretty");
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy() {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.raw || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    const headerEntries = result ? Object.entries(result.responseHeaders) : [];

    return (
        <div className="ep-tester" ref={rootRef}>
            <div className="ep-tester__header">
                <span className="ep-tester__title">
                    <IconZap />
                    Testar Endpoint
                </span>
                {hint && <span className="ep-tester__hint">{hint}</span>}
            </div>

            <div className="ep-tester__body">
                <div className="ep-tester__url-bar">
                    <select
                        className="ep-tester__method-select"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        {HTTP_METHODS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        className="ep-tester__url-input"
                        placeholder="https://api.exemplo.com/rota ou /api/rota"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                    />

                    <button
                        className="ep-tester__send-btn"
                        onClick={handleSend}
                        disabled={loading || !url.trim()}
                    >
                        {loading ? <span className="ep-spinner" /> : <IconSend />}
                        {loading ? "Enviando..." : "Enviar"}
                    </button>
                </div>

                <div>
                    <div className="ep-tester__tabs">
                        <button
                            className={`ep-tester__tab${reqTab === "params" ? " ep-tester__tab--active" : ""}`}
                            onClick={() => setReqTab("params")}
                        >
                            Params{params.some((p) => p.key.trim()) ? " ●" : ""}
                        </button>
                        <button
                            className={`ep-tester__tab${reqTab === "body" ? " ep-tester__tab--active" : ""}`}
                            onClick={() => setReqTab("body")}
                        >
                            Body (JSON)
                        </button>
                        <button
                            className={`ep-tester__tab${reqTab === "headers" ? " ep-tester__tab--active" : ""}`}
                            onClick={() => setReqTab("headers")}
                        >
                            Headers
                        </button>
                        <button
                            className={`ep-tester__tab${reqTab === "auth" ? " ep-tester__tab--active" : ""}`}
                            onClick={() => setReqTab("auth")}
                        >
                            Auth{auth.type !== "none" ? " ●" : ""}
                        </button>
                    </div>

                    {reqTab === "params" ? (
                        <div style={{ marginTop: "0.6rem" }}>
                            <KeyValueEditor
                                pairs={params}
                                onChange={setParams}
                                keyPlaceholder="page"
                                valuePlaceholder="1"
                            />
                        </div>
                    ) : reqTab === "body" ? (
                        <JsonTextarea
                            className="ep-tester__textarea"
                            style={{ marginTop: "0.6rem", width: "100%" }}
                            placeholder={'{\n  "chave": "valor"\n}'}
                            value={body}
                            onChange={setBody}
                            rows={5}
                        />
                    ) : reqTab === "headers" ? (
                        <JsonTextarea
                            className="ep-tester__textarea"
                            style={{ marginTop: "0.6rem", width: "100%" }}
                            placeholder={'{\n  "Accept": "application/json"\n}'}
                            value={headers}
                            onChange={setHeaders}
                            rows={4}
                        />
                    ) : (
                        <div style={{ marginTop: "0.6rem" }}>
                            <AuthEditor value={auth} onChange={setAuth} />
                        </div>
                    )}
                </div>

                {result ? (
                    <div className="ep-tester__response">
                        <div className="ep-tester__response-meta">
                            <span className={statusPillClass(result.status)}>
                                {result.status || "ERR"} {result.statusText}
                            </span>
                            <span className="ep-tester__duration">⏱ {result.durationMs}ms</span>
                            <span className="ep-tester__duration">⬇ {formatBytes(result.sizeBytes)}</span>
                            {result.contentType && (
                                <span className="ep-tester__content-type">
                                    {result.contentType.split(";")[0]}
                                </span>
                            )}
                        </div>

                        {result.error !== null ? (
                            <div className="ep-tester__json-block ep-tester__json-block--error">
                                <pre className="jh-pre">
                                    {typeof result.error === "string" ? result.error : String(result.error)}
                                </pre>
                            </div>
                        ) : (
                            <>
                                <div className="ep-tester__resp-toolbar">
                                    <div className="ep-tester__tabs ep-tester__tabs--resp">
                                        <button
                                            className={`ep-tester__tab${respTab === "pretty" ? " ep-tester__tab--active" : ""}`}
                                            onClick={() => setRespTab("pretty")}
                                        >
                                            Formatado
                                        </button>
                                        <button
                                            className={`ep-tester__tab${respTab === "raw" ? " ep-tester__tab--active" : ""}`}
                                            onClick={() => setRespTab("raw")}
                                        >
                                            Raw
                                        </button>
                                        <button
                                            className={`ep-tester__tab${respTab === "headers" ? " ep-tester__tab--active" : ""}`}
                                            onClick={() => setRespTab("headers")}
                                        >
                                            Headers ({headerEntries.length})
                                        </button>
                                    </div>

                                    <button className="ep-tester__copy-btn" onClick={handleCopy} title="Copiar resposta">
                                        <IconCopy />
                                        {copied ? "Copiado!" : "Copiar"}
                                    </button>
                                </div>

                                {result.isHtml && respTab === "pretty" ? (
                                    <div className="ep-tester__html-notice">
                                        <span>⚠️</span>
                                        <span>
                                            O servidor retornou HTML (página de erro ou redirect).
                                            Veja o conteúdo bruto na aba "Raw".
                                        </span>
                                    </div>
                                ) : respTab === "headers" ? (
                                    headerEntries.length === 0 ? (
                                        <div className="ep-tester__empty" style={{ borderStyle: "solid" }}>
                                            Nenhum header retornado.
                                        </div>
                                    ) : (
                                        <div className="ep-tester__json-block">
                                            <table className="ep-tester__headers-table">
                                                <tbody>
                                                    {headerEntries.map(([k, v]) => (
                                                        <tr key={k}>
                                                            <td className="ep-tester__header-key">{k}</td>
                                                            <td className="ep-tester__header-val">{v}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                ) : respTab === "raw" ? (
                                    result.raw ? (
                                        <div className="ep-tester__json-block">
                                            <pre className="jh-pre"><span className="jh-plain">{result.raw}</span></pre>
                                        </div>
                                    ) : (
                                        <div className="ep-tester__empty" style={{ borderStyle: "solid" }}>
                                            Sem corpo na resposta (ex: 204 No Content).
                                        </div>
                                    )
                                ) : result.data !== null && result.data !== "" ? (
                                    <div className="ep-tester__json-block">
                                        <JsonHighlight value={result.data} raw={result.raw} />
                                    </div>
                                ) : (
                                    <div className="ep-tester__empty" style={{ borderStyle: "solid" }}>
                                        Sem corpo na resposta (ex: 204 No Content).
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : !loading && (
                    <div className="ep-tester__empty">
                        Clique em ▶ em um endpoint ou preencha a URL acima e envie.
                    </div>
                )}
            </div>
        </div>
    );
});

export default EndpointTester;
