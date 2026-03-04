export interface Endpoint {
    id: number;
    nome: string;
    descricao: string;
    rota: string;
    metodo: string;
    controller_nome: string;
    project_id: number;
    created_at: Date;
}