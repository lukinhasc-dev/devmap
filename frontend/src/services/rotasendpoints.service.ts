import axios, { type Method } from "axios";

export type TestRouteRequest = {
    url: string;
    method: Method;
    body?: string;
    headers?: string;
    timeout?: number;
};

export type TestRouteResponse<T = any> = {
    ok: boolean;
    status: number;
    statusText: string;
    data: T | null;
    raw: string;
    error: any;
    durationMs: number;
    isHtml: boolean;
    contentType: string;
    responseHeaders: Record<string, string>;
    sizeBytes: number;
};

const STATUS_TEXT: Record<number, string> = {
    200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
    301: "Moved Permanently", 302: "Found", 304: "Not Modified",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
    422: "Unprocessable Entity", 429: "Too Many Requests",
    500: "Internal Server Error", 502: "Bad Gateway",
    503: "Service Unavailable", 504: "Gateway Timeout",
};

function byteSize(text: string): number {
    try {
        return new TextEncoder().encode(text).length;
    } catch {
        return text.length;
    }
}

function normalizeHeaders(raw: any): Record<string, string> {
    if (!raw) return {};
    try {
        if (typeof raw.toJSON === "function") return raw.toJSON();
    } catch {
        return {};
    }
    const out: Record<string, string> = {};
    for (const key of Object.keys(raw)) {
        out[key] = String(raw[key]);
    }
    return out;
}

export const testEndpointRoute = async <T = any>(
    req: TestRouteRequest
): Promise<TestRouteResponse<T>> => {
    const start = performance.now();

    let parsedBody: any = undefined;
    if (req.body && req.body.trim()) {
        try {
            parsedBody = JSON.parse(req.body);
        } catch {
            return {
                ok: false, status: 0, statusText: "Erro de parse",
                data: null, raw: "", error: "Body inválido: o JSON fornecido não é válido.",
                durationMs: 0, isHtml: false, contentType: "",
                responseHeaders: {}, sizeBytes: 0,
            };
        }
    }

    let extraHeaders: Record<string, string> = {};
    if (req.headers && req.headers.trim()) {
        try {
            extraHeaders = JSON.parse(req.headers);
        } catch {
            return {
                ok: false, status: 0, statusText: "Erro de parse",
                data: null, raw: "", error: "Headers inválidos: o JSON fornecido não é válido.",
                durationMs: 0, isHtml: false, contentType: "",
                responseHeaders: {}, sizeBytes: 0,
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
            validateStatus: () => true,
            transformResponse: (raw) => raw,
        });

        const durationMs = Math.round(performance.now() - start);
        const contentType = String(response.headers?.["content-type"] ?? "");
        const isHtml = contentType.includes("text/html");
        const raw = typeof response.data === "string" ? response.data : String(response.data ?? "");

        let data: any = null;
        if (raw.trim()) {
            try {
                data = JSON.parse(raw);
            } catch {
                data = raw;
            }
        }

        const status = response.status;
        const statusText = response.statusText || STATUS_TEXT[status] || `Status ${status}`;

        return {
            ok: status >= 200 && status < 300,
            status,
            statusText,
            data,
            raw,
            error: null,
            durationMs,
            isHtml,
            contentType,
            responseHeaders: normalizeHeaders(response.headers),
            sizeBytes: byteSize(raw),
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
            raw: "",
            error: isTimeout
                ? `Timeout após ${req.timeout ?? 10_000}ms`
                : (error?.message ?? "Erro desconhecido"),
            durationMs,
            isHtml: false,
            contentType: "",
            responseHeaders: normalizeHeaders(error?.response?.headers),
            sizeBytes: 0,
        };
    }
};
