import { Request, Response } from "express";
import type { EndpointGroup } from "../models/EndpointGroup.model";
import db from "../database/connection";

export default class EndpointGroupController {
    async getGroups(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;

        try {
            const result = projectId
                ? db.prepare("SELECT * FROM endpoint_groups WHERE project_id = ? ORDER BY ordem, id").all(projectId)
                : db.prepare("SELECT * FROM endpoint_groups ORDER BY ordem, id").all();

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao buscar grupos",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async createGroup(req: Request, res: Response) {
        const group: EndpointGroup = req.body;

        try {
            if (!group.nome?.trim()) {
                return res.status(400).json({
                    message: "O nome do grupo é obrigatório",
                    error: "Dados inválidos"
                });
            }

            if (!group.project_id) {
                return res.status(400).json({
                    message: "project_id é obrigatório",
                    error: "Dados inválidos"
                });
            }

            const result = db.prepare(
                "INSERT INTO endpoint_groups (project_id, nome, descricao, base_url) VALUES (?, ?, ?, ?)"
            ).run(
                group.project_id,
                group.nome,
                group.descricao ?? null,
                group.base_url ?? null
            );

            return res.status(201).json({
                message: "Grupo criado com sucesso!",
                result
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao criar grupo",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async updateGroup(req: Request, res: Response) {
        const group: EndpointGroup = req.body;
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM endpoint_groups WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({
                    message: "Grupo não encontrado",
                    error: "Erro interno do servidor"
                });
            }

            if (!group.nome?.trim()) {
                return res.status(400).json({
                    message: "O nome do grupo é obrigatório",
                    error: "Dados inválidos"
                });
            }

            const result = db.prepare(
                "UPDATE endpoint_groups SET nome = ?, descricao = ?, base_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            ).run(
                group.nome,
                group.descricao ?? null,
                group.base_url ?? null,
                id
            );

            return res.status(200).json({
                message: "Grupo atualizado com sucesso!",
                result
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao atualizar grupo",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async deleteGroup(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM endpoint_groups WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({
                    message: "Grupo não encontrado",
                    error: "Erro interno do servidor"
                });
            }

            const transaction = db.transaction(() => {
                db.prepare("UPDATE endpoints SET group_id = NULL WHERE group_id = ?").run(id);
                db.prepare("DELETE FROM endpoint_groups WHERE id = ?").run(id);
            });

            transaction();

            return res.status(200).json({
                message: "Grupo deletado com sucesso! Os endpoints ficaram sem grupo."
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao deletar grupo",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }
}
