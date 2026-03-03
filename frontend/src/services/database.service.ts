import api from "./api";
import type { Database } from "../models/Database.model";

export const getDatabases = async () => {
    const response = await api.get("/databases");
    return response.data;
};

export const getDatabaseById = async (id: number) => {
    const response = await api.get(`/databases/${id}`);
    return response.data;
};

export const createDatabase = async (database: Database) => {
    const response = await api.post("/databases", database);
    return response.data;
};

export const updateDatabase = async (id: number, database: Database) => {
    const response = await api.put(`/databases/${id}`, database);
    return response.data;
};

export const deleteDatabase = async (id: number) => {
    const response = await api.delete(`/databases/${id}`);
    return response.data;
};