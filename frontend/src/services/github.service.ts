import api from "./api";
import type { Github } from "../models/Github.model";

export const getGithubs = async (): Promise<Github[]> => {
    const response = await api.get("/github");
    return response.data;
};

export const getGithubsByProjectId = async (projectId: number): Promise<Github[]> => {
    const response = await api.get("/github");
    return response.data.filter((g: Github) => g.project_id === projectId);
};

export const getGithubById = async (id: number): Promise<Github> => {
    const response = await api.get(`/github/${id}`);
    return response.data;
};

export const createGithub = async (github: Omit<Github, "id" | "created_at">): Promise<Github> => {
    const payload = {
        ...github,
        created_at: new Date().toISOString(),
    };
    const response = await api.post("/github", payload);
    return response.data;
};

export const updateGithub = async (id: number, github: Partial<Github>): Promise<Github> => {
    const response = await api.put(`/github/${id}`, github);
    return response.data;
};

export const deleteGithub = async (id: number): Promise<void> => {
    await api.delete(`/github/${id}`);
};