export interface TaskStatus {
    id: number;
    project_id: number;
    chave: string;
    nome: string;
    cor: string | null;
    ordem: number;
    created_at: Date;
}
