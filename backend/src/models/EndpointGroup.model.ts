export interface EndpointGroup {
    id: number;
    project_id: number;
    nome: string;
    descricao: string | null;
    base_url: string | null;
    ordem: number;
    created_at: Date;
    updated_at: Date;
}
