import api from "./api";
import type { TaskLabel } from "../models/TaskLabel.model";

export const getLabelsByProject = async (projectId: number) => {
    const response = await api.get(`/task-labels?project_id=${projectId}`);
    return response.data;
};

export const createLabel = async (label: Partial<TaskLabel>) => {
    const response = await api.post("/task-labels", label);
    return response.data;
};

export const updateLabel = async (id: number, label: Partial<TaskLabel>) => {
    const response = await api.put(`/task-labels/${id}`, label);
    return response.data;
};

export const deleteLabel = async (id: number) => {
    const response = await api.delete(`/task-labels/${id}`);
    return response.data;
};
