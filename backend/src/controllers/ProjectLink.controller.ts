import { Request, Response } from "express";
import db from "../database/connection";
import type { ProjectLink } from "../models/ProjectLink.model";

export default class ProjectLinkController {
    async getLinks(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;

        try {
            const result = projectId
                ? db.prepare("SELECT * FROM project_links WHERE project_id = ? ORDER BY created_at DESC").all(projectId)
                : db.prepare("SELECT * FROM project_links ORDER BY created_at DESC").all();
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao buscar links",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async createLink(req: Request, res: Response) {
        const link: ProjectLink = req.body;

        if (!link.project_id || !link.titulo?.trim() || !link.url?.trim()) {
            return res.status(400).json({ message: "project_id, titulo e url são obrigatórios" });
        }

        try {
            const result = db.prepare(
                "INSERT INTO project_links (project_id, titulo, url, descricao, created_at) VALUES (?, ?, ?, ?, ?)"
            ).run(link.project_id, link.titulo, link.url, link.descricao ?? null, new Date().toISOString());

            return res.status(201).json({
                message: "Link criado com sucesso!",
                id: result.lastInsertRowid,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao criar link",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async updateLink(req: Request, res: Response) {
        const id = Number(req.params.id);
        const link: ProjectLink = req.body;

        try {
            const verificar = db.prepare("SELECT * FROM project_links WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({ message: "Link não encontrado" });
            }

            db.prepare(
                "UPDATE project_links SET titulo = ?, url = ?, descricao = ? WHERE id = ?"
            ).run(link.titulo, link.url, link.descricao ?? null, id);

            return res.status(200).json({ message: "Link atualizado com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao atualizar link",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async deleteLink(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM project_links WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({ message: "Link não encontrado" });
            }

            db.prepare("DELETE FROM project_links WHERE id = ?").run(id);
            return res.status(200).json({ message: "Link removido com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao remover link",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }
}
