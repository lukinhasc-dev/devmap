export interface ProjectSecret {
    id: number;
    project_id: number;
    nome: string;
    tipo: string | null;
    descricao: string | null;
    valor_cifrado: string;
    created_at: string;
    updated_at: string;
}
