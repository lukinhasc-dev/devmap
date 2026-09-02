import type { AuthConfig, AuthType } from "../models/Auth.model";

export const EMPTY_AUTH: AuthConfig = {
    type: "none",
    token: "",
    username: "",
    password: "",
    apiKeyName: "",
    apiKeyValue: "",
    apiKeyAddTo: "header",
};

const AUTH_LABELS: Record<AuthType, string> = {
    none: "Sem autenticação",
    bearer: "Bearer Token",
    basic: "Basic Auth",
    apikey: "API Key",
};

export function deserializeAuth(authType?: string | null, authConfig?: string | null): AuthConfig {
    const type = (authType ?? "none") as AuthType;
    let parsed: Partial<AuthConfig> = {};
    if (authConfig) {
        try {
            parsed = JSON.parse(authConfig);
        } catch {
            parsed = {};
        }
    }
    return { ...EMPTY_AUTH, ...parsed, type };
}

export function serializeAuth(auth: AuthConfig): { auth_type: string | null; auth_config: string | null } {
    if (!auth || auth.type === "none") {
        return { auth_type: "none", auth_config: null };
    }

    let config: Record<string, string> = {};
    if (auth.type === "bearer") {
        config = { token: auth.token ?? "" };
    } else if (auth.type === "basic") {
        config = { username: auth.username ?? "", password: auth.password ?? "" };
    } else if (auth.type === "apikey") {
        config = {
            apiKeyName: auth.apiKeyName ?? "",
            apiKeyValue: auth.apiKeyValue ?? "",
            apiKeyAddTo: auth.apiKeyAddTo ?? "header",
        };
    }

    return { auth_type: auth.type, auth_config: JSON.stringify(config) };
}

function base64(input: string): string {
    try {
        return btoa(unescape(encodeURIComponent(input)));
    } catch {
        return btoa(input);
    }
}

export function applyAuth(
    url: string,
    headers: Record<string, string>,
    auth: AuthConfig
): { url: string; headers: Record<string, string> } {
    const outHeaders = { ...headers };
    let outUrl = url;

    if (!auth || auth.type === "none") {
        return { url: outUrl, headers: outHeaders };
    }

    if (auth.type === "bearer" && auth.token?.trim()) {
        outHeaders["Authorization"] = `Bearer ${auth.token.trim()}`;
    } else if (auth.type === "basic" && (auth.username || auth.password)) {
        outHeaders["Authorization"] = `Basic ${base64(`${auth.username ?? ""}:${auth.password ?? ""}`)}`;
    } else if (auth.type === "apikey" && auth.apiKeyName?.trim()) {
        const name = auth.apiKeyName.trim();
        const value = auth.apiKeyValue ?? "";
        if (auth.apiKeyAddTo === "query") {
            const sep = outUrl.includes("?") ? "&" : "?";
            outUrl = `${outUrl}${sep}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        } else {
            outHeaders[name] = value;
        }
    }

    return { url: outUrl, headers: outHeaders };
}

type Props = {
    value: AuthConfig;
    onChange: (auth: AuthConfig) => void;
};

const AUTH_TYPES: AuthType[] = ["none", "bearer", "basic", "apikey"];

export default function AuthEditor({ value, onChange }: Props) {
    function set(field: keyof AuthConfig, fieldValue: string) {
        onChange({ ...value, [field]: fieldValue });
    }

    return (
        <div className="auth-editor">
            <div className="ep-form__row">
                <label className="ep-form__label">
                    Tipo de autenticação
                    <select
                        className="ep-form__input ep-form__select"
                        value={value.type}
                        onChange={(e) => onChange({ ...value, type: e.target.value as AuthType })}
                    >
                        {AUTH_TYPES.map((t) => (
                            <option key={t} value={t}>{AUTH_LABELS[t]}</option>
                        ))}
                    </select>
                </label>
            </div>

            {value.type === "bearer" && (
                <div className="ep-form__row">
                    <label className="ep-form__label">
                        Token
                        <input
                            className="ep-form__input ep-form__mono"
                            type="text"
                            value={value.token ?? ""}
                            placeholder="seu-token-de-acesso"
                            onChange={(e) => set("token", e.target.value)}
                        />
                    </label>
                    <span className="auth-editor__hint">Gera: Authorization: Bearer &lt;token&gt;</span>
                </div>
            )}

            {value.type === "basic" && (
                <div className="ep-form__row ep-form__row--split">
                    <label className="ep-form__label">
                        Usuário
                        <input
                            className="ep-form__input"
                            type="text"
                            value={value.username ?? ""}
                            placeholder="usuário"
                            onChange={(e) => set("username", e.target.value)}
                        />
                    </label>
                    <label className="ep-form__label">
                        Senha
                        <input
                            className="ep-form__input"
                            type="password"
                            value={value.password ?? ""}
                            placeholder="senha"
                            onChange={(e) => set("password", e.target.value)}
                        />
                    </label>
                </div>
            )}

            {value.type === "apikey" && (
                <>
                    <div className="ep-form__row ep-form__row--split">
                        <label className="ep-form__label">
                            Nome
                            <input
                                className="ep-form__input ep-form__mono"
                                type="text"
                                value={value.apiKeyName ?? ""}
                                placeholder="X-API-Key"
                                onChange={(e) => set("apiKeyName", e.target.value)}
                            />
                        </label>
                        <label className="ep-form__label">
                            Valor
                            <input
                                className="ep-form__input ep-form__mono"
                                type="text"
                                value={value.apiKeyValue ?? ""}
                                placeholder="valor-da-chave"
                                onChange={(e) => set("apiKeyValue", e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="ep-form__row">
                        <label className="ep-form__label">
                            Adicionar em
                            <select
                                className="ep-form__input ep-form__select"
                                value={value.apiKeyAddTo ?? "header"}
                                onChange={(e) => set("apiKeyAddTo", e.target.value)}
                            >
                                <option value="header">Header</option>
                                <option value="query">Query Params</option>
                            </select>
                        </label>
                    </div>
                </>
            )}
        </div>
    );
}
