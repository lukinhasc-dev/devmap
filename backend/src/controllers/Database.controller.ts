import { Request, Response } from "express";
import db from "../database/connection";
import { Database } from "../models/Database.model";

export default class DatabaseController {
    async getDatabases(req: Request, res: Response) {
        try {
            const result = db.prepare("SELECT * FROM databases").all()
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao buscar bancos de dados",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async getDatabaseById(req: Request, res: Response) {
        const id = Number(req.params.id)

        try {
            const result = db.prepare("SELECT * FROM databases WHERE id = ?").get(id)
            return res.status(200).json(result)

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao buscar banco de dados",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async createDatabase(req: Request, res: Response) {
        const database: Database = req.body;

        try {
            if (!database.nome.trim() || !database.tipo_bd.trim() || !database.query_bd.trim()) {
                return res.status(400).json({
                    message: "Nome, tipo e query do banco de dados são obrigatórios",
                    error: "Erro interno do servidor"
                });
            }

            const result = db.prepare("INSERT INTO databases (project_id, nome, tipo_bd, host, porta, query_bd, usuario, senha, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(database.project_id, database.nome, database.tipo_bd, database.host, database.porta, database.query_bd, database.usuario, database.senha, database.observacoes)
            return res.status(201).json({
                message: "Banco de dados criado com sucesso!",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao criar banco de dados",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async updateDatabase(req: Request, res: Response) {
        const database: Database = req.body;
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM databases WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({
                    message: "Banco de dados não encontrado",
                    error: "Erro interno do servidor"
                });
            }

            const result = db.prepare("UPDATE databases SET project_id = ?, nome = ?, tipo_bd = ?, host = ?, porta = ?, query_bd = ?, usuario = ?, senha = ?, observacoes = ? WHERE id = ?").run(database.project_id, database.nome, database.tipo_bd, database.host, database.porta, database.query_bd, database.usuario, database.senha, database.observacoes, id);
            return res.status(200).json({
                message: "Banco de dados atualizado com sucesso!",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao atualizar banco de dados",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async deleteDatabase(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM databases WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({
                    message: "Banco de dados não encontrado",
                    error: "Erro interno do servidor"
                });
            }

            const result = db.prepare("DELETE FROM databases WHERE id = ?").run(id);
            return res.status(200).json({
                message: "Banco de dados deletado com sucesso",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao deletar banco de dados",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }
}