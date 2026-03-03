import api from "./api";
import type { Github } from "../models/Github.model";

export const getGithubs = async () => {
    const response = await api.get("/github");
    return response.data;
};

export const getGithubById = async (id: number) => {
    const response = await api.get(`/github/${id}`);
    return response.data;
};

export const createGithub = async (github: Github) => {
    const response = await api.post("/github", github);
    return response.data;
};

export const updateGithub = async (id: number, github: Github) => {
    const response = await api.put(`/github/${id}`, github);
    return response.data;
};

export const deleteGithub = async (id: number) => {
    const response = await api.delete(`/github/${id}`);
    return response.data;
};