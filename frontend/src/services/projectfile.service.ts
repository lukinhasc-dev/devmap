import api from "./api";
import type { ProjectFile } from "../models/ProjectFile.model";

export const SERVER_ORIGIN = "http://localhost:5173";

export const getFilesByProjectId = async (projectId: number): Promise<ProjectFile[]> => {
    const response = await api.get("/project-files", { params: { project_id: projectId } });
    return response.data;
};

export const uploadFile = async (
    projectId: number,
    file: File,
    nome: string,
    descricao: string
): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", String(projectId));
    formData.append("nome", nome);
    formData.append("descricao", descricao);

    await api.post("/project-files", formData, {
        headers: { "Content-Type": undefined },
    });
};

export const deleteFile = async (id: number): Promise<void> => {
    await api.delete(`/project-files/${id}`);
};

export const fileUrl = (caminho: string): string => `${SERVER_ORIGIN}${caminho}`;
