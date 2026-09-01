export interface Tasks {
    id: number;
    project_id: number;
    titulo: string;
    descricao: string;
    status: string;
    labels: string | null;
    priority: string | null;
    created_at: Date;
}
