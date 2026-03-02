import { Request, Response } from "express";
import db from "../database/connection"
import type { Github } from "../models/Github.model";

export default class GithubController {
    async getGithubs(req: Request, res: Response) {
        try {
            const result = db.prepare("SELECT * FROM github").all()
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao buscar githubs",
                error: error instanceof Error ? error.message : "Erro inesperado"
            })
        }
    }

    async getGithubById(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const result = db.prepare("SELECT * FROM github WHERE id = ?").get(id)
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao buscar github",
                error: error instanceof Error ? error.message : "Erro inesperado"
            })
        }
    }

    async createGithub(req: Request, res: Response) {
        const github: Github = req.body;

        try {
            const result = db.prepare("INSERT INTO github (id, project_id, nome_repositorio, link_repositorio, stack, observacoes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(github.id, github.project_id, github.nome_repositorio, github.link_repositorio, github.stack, github.observacoes, github.created_at)
            return res.status(201).json({
                message: "Github criado com sucesso!",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao criar github",
                error: error instanceof Error ? error.message : "Erro inesperado"
            })
        }
    }

    async updateGithub(req: Request, res: Response) {
        const id = Number(req.params.id);
        const github: Github = req.body;

        try {
            const verificar = db.prepare("SELECT * FROM github WHERE id = ?").get(id)
            if (!verificar) {
                return res.status(404).json({
                    message: "Github não encontrado",
                    error: "Erro interno do servidor"
                })
            }

            const result = db.prepare("UPDATE github SET project_id = ?, nome_repositorio = ?, link_repositorio = ?, stack = ?, observacoes = ?, created_at = ? WHERE id = ?").run(github.project_id, github.nome_repositorio, github.link_repositorio, github.stack, github.observacoes, github.created_at, id)
            return res.status(200).json({
                message: "Github atualizado com sucesso!",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao atualizar github",
                error: error instanceof Error ? error.message : "Erro inesperado"
            })
        }
    }

    async deleteGithub(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM github WHERE id = ?").get(id)
            if (!verificar) {
                return res.status(404).json({
                    message: "Github não encontrado",
                    error: "Erro interno do servidor"
                })
            }

            const result = db.prepare("DELETE FROM github WHERE id = ?").run(id)
            return res.status(200).json({
                message: "Github deletado com sucesso!",
                result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Erro ao deletar github",
                error: error instanceof Error ? error.message : "Erro inesperado"
            })
        }
    }
}

