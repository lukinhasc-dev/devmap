export interface Projects {
    nome: string;
    descricao: string;
    status: Status;
    data_inicio: Date;
    data_entrega: Date;
    responsavel: string;
    created_at: Date;
    updated_at: Date;
}

type Status = "Em Andamento" | "Concluídos" | "Pausados" | string
