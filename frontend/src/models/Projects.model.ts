export interface Projects {
    id: number;
    nome: string;
    descricao: string;
    status: Status;
    data_inicio: string;
    data_entrega?: string;
    responsavel: string;
    created_at?: Date;
    updated_at?: Date;
}

export type Status = "Em Andamento" | "Concluídos" | "Pausados" | string
