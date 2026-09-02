import api from "./api";
import type { ProjectSecret } from "../models/ProjectSecret.model";

export type SecretPayload = {
    project_id: number;
    nome: string;
    tipo: string | null;
    descricao: string | null;
    valor: string;
};

export const getSecretsByProjectId = async (projectId: number): Promise<ProjectSecret[]> => {
    const response = await api.get("/project-secrets", { params: { project_id: projectId } });
    return response.data;
};

export const revealSecret = async (id: number): Promise<string> => {
    const response = await api.get(`/project-secrets/${id}/reveal`);
    return response.data.valor;
};

export const createSecret = async (secret: SecretPayload): Promise<void> => {
    await api.post("/project-secrets", secret);
};

export const updateSecret = async (id: number, secret: Partial<SecretPayload>): Promise<void> => {
    await api.put(`/project-secrets/${id}`, secret);
};

export const deleteSecret = async (id: number): Promise<void> => {
    await api.delete(`/project-secrets/${id}`);
};
