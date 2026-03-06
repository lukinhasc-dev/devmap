export interface Endpoint {
    id: number;
    project_id?: number;
    nome: string;
    descricao: string;
    rota: string;
    metodo: string;
    controller_nome: string;
    created_at: Date;
}
