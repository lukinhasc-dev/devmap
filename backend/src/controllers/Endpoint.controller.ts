import { Request, Response } from "express";
import type { Endpoint } from "../models/Endpoint.model";
import db from "../database/connection";

export default class EndpointController {
    async getEndpoints(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;
        const groupId = req.query.group_id ? Number(req.query.group_id) : null;

        try {
            let result;

            if (projectId && groupId) {
                result = db.prepare("SELECT * FROM endpoints WHERE project_id = ? AND group_id = ? ORDER BY ordem, id").all(projectId, groupId);
            } else if (projectId) {
                result = db.prepare("SELECT * FROM endpoints WHERE project_id = ? ORDER BY ordem, id").all(projectId);
            } else {
                result = db.prepare("SELECT * FROM endpoints ORDER BY ordem, id").all();
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao buscar endpoints",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async createEndpoint(req: Request, res: Response) {
        const endpoint: Endpoint = req.body;

        try {
            if (!endpoint.nome?.trim() || !endpoint.rota?.trim() || !endpoint.metodo?.trim()) {
                return res.status(400).json({
                    message: "Nome, rota e método são obrigatórios",
                    error: "Dados inválidos"
                });
            }

            if (!endpoint.project_id) {
                return res.status(400).json({
                    message: "project_id é obrigatório",
                    error: "Dados inválidos"
                });
            }

            const result = db.prepare(
                "INSERT INTO endpoints (nome, descricao, rota, metodo, controller_nome, headers, body, query_params, auth_type, auth_config, project_id, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ).run(
                endpoint.nome,
                endpoint.descricao ?? null,
                endpoint.rota,
                endpoint.metodo,
                endpoint.controller_nome ?? null,
                endpoint.headers ?? null,
                endpoint.body ?? null,
                endpoint.query_params ?? null,
                endpoint.auth_type ?? null,
                endpoint.auth_config ?? null,
                endpoint.project_id,
                endpoint.group_id ?? null
            );

            return res.status(201).json({
                message: "Endpoint criado com sucesso!",
                result
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao criar endpoint",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async updateEndpoint(req: Request, res: Response) {
        const endpoint: Endpoint = req.body;
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM endpoints WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({
                    message: "Endpoint não encontrado",
                    error: "Erro interno do servidor"
                });
            }

            if (!endpoint.nome?.trim() || !endpoint.rota?.trim() || !endpoint.metodo?.trim()) {
                return res.status(400).json({
                    message: "Nome, rota e método são obrigatórios",
                    error: "Dados inválidos"
                });
            }

            const result = db.prepare(
                "UPDATE endpoints SET nome = ?, descricao = ?, rota = ?, metodo = ?, controller_nome = ?, headers = ?, body = ?, query_params = ?, auth_type = ?, auth_config = ?, group_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            ).run(
                endpoint.nome,
                endpoint.descricao ?? null,
                endpoint.rota,
                endpoint.metodo,
                endpoint.controller_nome ?? null,
                endpoint.headers ?? null,
                endpoint.body ?? null,
                endpoint.query_params ?? null,
                endpoint.auth_type ?? null,
                endpoint.auth_config ?? null,
                endpoint.group_id ?? null,
                id
            );

            return res.status(200).json({
                message: "Endpoint atualizado com sucesso!",
                result
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao atualizar endpoint",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async deleteEndpoint(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM endpoints WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({
                    message: "Endpoint não encontrado",
                    error: "Erro interno do servidor"
                });
            }

            const result = db.prepare("DELETE FROM endpoints WHERE id = ?").run(id);
            return res.status(200).json({
                message: "Endpoint deletado com sucesso!",
                result
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao deletar endpoint",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }
}
