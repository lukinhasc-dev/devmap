export interface Projects {
    nome: string;
    descricao: string;
    status: Status;
    created_at: Date;
    updated_at: Date;
}

type Status = "Em Andamento" | "Concluídos" | "Pausados" | string
