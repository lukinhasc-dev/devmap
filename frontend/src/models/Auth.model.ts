export type AuthType = "none" | "bearer" | "basic" | "apikey";

export type ApiKeyAddTo = "header" | "query";

export interface AuthConfig {
    type: AuthType;
    token?: string;
    username?: string;
    password?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyAddTo?: ApiKeyAddTo;
}
