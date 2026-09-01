export interface TaskLabel {
    id: number;
    project_id: number;
    nome: string;
    cor: string | null;
    created_at: Date;
}
