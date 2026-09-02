import api from "./api";
import type { ProjectLink } from "../models/ProjectLink.model";

export const getLinksByProjectId = async (projectId: number): Promise<ProjectLink[]> => {
    const response = await api.get("/project-links", { params: { project_id: projectId } });
    return response.data;
};

export const createLink = async (link: Omit<ProjectLink, "id" | "created_at">): Promise<void> => {
    await api.post("/project-links", link);
};

export const updateLink = async (id: number, link: Partial<ProjectLink>): Promise<void> => {
    await api.put(`/project-links/${id}`, link);
};

export const deleteLink = async (id: number): Promise<void> => {
    await api.delete(`/project-links/${id}`);
};
