import api from "./api";
import type { Tasks } from "../models/Tasks.model";

export const getTasks = async () => {
    const response = await api.get("/tasks");
    return response.data;
};

export const createTask = async (task: Tasks) => {
    const response = await api.post("/tasks", task);
    return response.data;
};

export const updateTask = async (id: number, task: Tasks) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
};

export const deleteTask = async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};
