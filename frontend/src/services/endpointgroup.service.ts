import api from "./api";
import type { EndpointGroup } from "../models/EndpointGroup.model";

export const getGroupsByProject = async (projectId: number) => {
    const response = await api.get(`/endpoint-groups?project_id=${projectId}`);
    return response.data;
};

export const createGroup = async (group: Partial<EndpointGroup>) => {
    const response = await api.post("/endpoint-groups", group);
    return response.data;
};

export const updateGroup = async (id: number, group: Partial<EndpointGroup>) => {
    const response = await api.put(`/endpoint-groups/${id}`, group);
    return response.data;
};

export const deleteGroup = async (id: number) => {
    const response = await api.delete(`/endpoint-groups/${id}`);
    return response.data;
};
