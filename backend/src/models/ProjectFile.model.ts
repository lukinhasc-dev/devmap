export interface ProjectFile {
    id: number;
    project_id: number;
    nome: string;
    descricao: string | null;
    caminho: string;
    original_name: string | null;
    mime: string | null;
    tamanho: number | null;
    created_at: string;
}
