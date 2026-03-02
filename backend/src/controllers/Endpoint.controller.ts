import { Request, Response } from "express";
import type { Endpoint } from "../models/Endpoint.model";
import db from "../database/connection";

export default class EndpointController {
    async getEndpoints(req: Request, res: Response) {
        try {
            const result = db.prepare("SELECT * FROM endpoints").all();
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
            if (!endpoint.nome || !endpoint.descricao || !endpoint.rota || !endpoint.metodo || !endpoint.controller_nome) {
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios",
                    error: "Erro interno do servidor"
                });
            }

            const result = db.prepare("INSERT INTO endpoints (nome, descricao, rota, metodo, controller_nome) VALUES (?, ?, ?, ?, ?)").run(endpoint.nome, endpoint.descricao, endpoint.rota, endpoint.metodo, endpoint.controller_nome);
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

            const result = db.prepare("UPDATE endpoints SET nome = ?, descricao = ?, rota = ?, metodo = ?, controller_nome = ? WHERE id = ?").run(endpoint.nome, endpoint.descricao, endpoint.rota, endpoint.metodo, endpoint.controller_nome, id);
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