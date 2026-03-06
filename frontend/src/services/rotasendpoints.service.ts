import axios, { type Method } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TestRouteRequest = {
    url: string;
    method: Method;
    body?: string;     // JSON string
    headers?: string;  // JSON string ex: { "Authorization": "Bearer token" }
    timeout?: number;  // ms, default 10000
};

export type TestRouteResponse<T = any> = {
    ok: boolean;
    status: number;
    statusText: string;
    data: T | null;
    error: any;
    durationMs: number;
    isHtml: boolean;       // true quando o servidor retornou HTML
    contentType: string;   // Content-Type original da resposta
};

// ─── Mapeamento de status HTTP ────────────────────────────────────────────────

const STATUS_TEXT: Record<number, string> = {
    200: "OK", 201: "Created", 204: "No Content",
    301: "Moved Permanently", 302: "Found", 304: "Not Modified",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
    422: "Unprocessable Entity", 429: "Too Many Requests",
    500: "Internal Server Error", 502: "Bad Gateway",
    503: "Service Unavailable", 504: "Gateway Timeout",
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const testEndpointRoute = async <T = any>(
    req: TestRouteRequest
): Promise<TestRouteResponse<T>> => {
    const start = performance.now();

    // Parseia body JSON
    let parsedBody: any = undefined;
    if (req.body && req.body.trim()) {
        try {
            parsedBody = JSON.parse(req.body);
        } catch {
            return {
                ok: false, status: 0, statusText: "Erro de parse",
                data: null, error: "Body inválido: o JSON fornecido não é válido.",
                durationMs: 0, isHtml: false, contentType: "",
            };
        }
    }

    // Parseia headers extras
    let extraHeaders: Record<string, string> = {};
    if (req.headers && req.headers.trim()) {
        try {
            extraHeaders = JSON.parse(req.headers);
        } catch {
            return {
                ok: false, status: 0, statusText: "Erro de parse",
                data: null, error: "Headers inválidos: o JSON fornecido não é válido.",
                durationMs: 0, isHtml: false, contentType: "",
            };
        }
    }

    try {
        const response = await axios({
            url: req.url,
            method: req.method,
            data: parsedBody,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
                ...extraHeaders,
            },
            timeout: req.timeout ?? 10_000,
            validateStatus: () => true,      // nunca lança exceção em 4xx/5xx
            transformResponse: (raw) => raw, // recebe como string bruta, sem parse automático
        });

        const durationMs = Math.round(performance.now() - start);
        const contentType = String(response.headers?.["content-type"] ?? "");
        const isHtml = contentType.includes("text/html");

        // Tenta parsear JSON; se não conseguir, mantém como texto
        let data: any = null;
        if (isHtml) {
            data = null; // HTML não será exibido como conteúdo
        } else if (typeof response.data === "string" && response.data.trim()) {
            try {
                data = JSON.parse(response.data);
            } catch {
                data = response.data; // mantém como texto simples
            }
        } else {
            data = response.data;
        }

        const status = response.status;
        const statusText = response.statusText || STATUS_TEXT[status] || `Status ${status}`;

        return {
            ok: status >= 200 && status < 300,
            status,
            statusText,
            data,
            error: null,
            durationMs,
            isHtml,
            contentType,
        };
    } catch (error: any) {
        const durationMs = Math.round(performance.now() - start);
        const isTimeout = error.code === "ECONNABORTED";
        const isCors =
            error.message?.toLowerCase().includes("network") ||
            error.code === "ERR_NETWORK";

        return {
            ok: false,
            status: error?.response?.status ?? 0,
            statusText: isTimeout ? "Timeout" : isCors ? "Erro de Rede / CORS" : "Erro",
            data: null,
            error: isTimeout
                ? `Timeout após ${req.timeout ?? 10_000}ms`
                : (error?.message ?? "Erro desconhecido"),
            durationMs,
            isHtml: false,
            contentType: "",
        };
    }
};
