export interface Endpoint {
    id: number;
    nome: string;
    descricao: string | null;
    rota: string;
    metodo: string;
    controller_nome: string | null;
    headers: string | null;
    body: string | null;
    query_params: string | null;
    auth_type: string | null;
    auth_config: string | null;
    project_id: number;
    group_id: number | null;
    ordem: number;
    created_at: Date;
    updated_at: Date;
}
