export interface Database {
    id: number;
    project_id: number;
    nome: string;
    tipo_bd: string;
    host: string;
    porta: number;
    query_bd: string;
    usuario: string;
    senha: string;
    observacoes: string;
    created_at: string;
    updated_at: string
}