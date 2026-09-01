export type TaskPriority = "baixa" | "media" | "alta";

export interface Tasks {
    id: number;
    project_id: number;
    titulo: string;
    descricao: string;
    status: string;
    labels?: string | null;
    priority?: TaskPriority | null;
    created_at: Date;
}
