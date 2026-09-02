export interface Endpoint {
    id: number;
    project_id?: number;
    group_id?: number | null;
    nome: string;
    descricao?: string;
    rota: string;
    metodo: string;
    controller_nome?: string;
    headers?: string | null;
    body?: string | null;
    query_params?: string | null;
    auth_type?: string | null;
    auth_config?: string | null;
    ordem?: number;
    created_at: Date;
}
