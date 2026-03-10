import api from "./api";
import type { Endpoint } from "../models/Endpoint.model";

export const getEndpoints = async () => {
    const response = await api.get("/endpoints");
    return response.data;
};

export const getEndpointsByProject = async (projectId: number) => {
    const response = await api.get(`/endpoints?project_id=${projectId}`);
    return response.data;
};

export const createEndpoint = async (endpoint: Endpoint) => {
    const response = await api.post("/endpoints", endpoint);
    return response.data;
};

export const updateEndpoint = async (id: number, endpoint: Endpoint) => {
    const response = await api.put(`/endpoints/${id}`, endpoint);
    return response.data;
};

export const deleteEndpoint = async (id: number) => {
    const response = await api.delete(`/endpoints/${id}`);
    return response.data;
};