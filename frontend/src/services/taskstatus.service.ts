import api from "./api";
import type { TaskStatus } from "../models/TaskStatus.model";

export const getStatusesByProject = async (projectId: number) => {
    const response = await api.get(`/task-statuses?project_id=${projectId}`);
    return response.data;
};

export const createStatus = async (status: Partial<TaskStatus>) => {
    const response = await api.post("/task-statuses", status);
    return response.data;
};

export const updateStatus = async (id: number, status: Partial<TaskStatus>) => {
    const response = await api.put(`/task-statuses/${id}`, status);
    return response.data;
};

export const deleteStatus = async (id: number) => {
    const response = await api.delete(`/task-statuses/${id}`);
    return response.data;
};
