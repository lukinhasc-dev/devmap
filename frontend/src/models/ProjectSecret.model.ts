export interface ProjectSecret {
    id: number;
    project_id: number;
    nome: string;
    tipo: string | null;
    descricao: string | null;
    created_at: string;
    updated_at: string;
}
