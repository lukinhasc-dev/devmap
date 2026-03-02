import { Request, Response } from "express";
import type { Projects } from "../models/Projects.model";
import db from "../database/connection";

export default class ProjectsController {
    async getProjects(req: Request, res: Response) {
        try {
            const result = db.prepare("SELECT * FROM projects").all()
            return res.status(200).json(result)
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao buscar projetos",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async getProjectById(req: Request, res: Response) {
        const id = Number(req.params.id)

        try {
            const result = db.prepare("SELECT * FROM projects WHERE id = ?").get(id)

            if (!result) {
                return res.status(404).json({
                    message: "Projeto não encontrado",
                    error: "Erro ao buscar projeto"
                })
            }

            return res.status(200).json(result)
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao buscar projeto",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async createProject(req: Request, res: Response) {
        const projects: Projects = req.body

        try {
            if (!projects.nome || !projects.descricao || !projects.status) {
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios",
                    error: "Erro ao cadastrar projeto"
                })
            }

            const result = db.prepare("INSERT INTO projects (nome, descricao, status) VALUES (?, ?, ?)").run(projects.nome, projects.descricao, projects.status)
            return res.status(201).json({
                message: "Projeto criado com sucesso!",
                result
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao criar projeto",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async updateProject(req: Request, res: Response) {
        const id = Number(req.params.id)
        const projects: Projects = req.body

        try {
            const verificar = db.prepare("SELECT * FROM projects WHERE id = ?").get(id)

            if (!verificar) {
                return res.status(404).json({
                    message: "Projeto não encontrado"
                })
            }

            const result = db.prepare("UPDATE projects SET nome = ?, descricao = ?, status = ? WHERE id = ?").run(projects.nome, projects.descricao, projects.status, id)
            return res.status(200).json({
                message: "Projeto atualizado com sucesso!",
                result
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao atualizar projeto",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async deleteProject(req: Request, res: Response) {
        const id = Number(req.params.id)
        try {
            const verificar = db.prepare("SELECT * FROM projects WHERE id = ?").get(id)

            if (!verificar) {
                return res.status(404).json({
                    message: "Projeto não encontrado",
                    error: "Erro ao deletar projeto"
                })
            }

            const result = db.prepare("DELETE FROM projects WHERE id = ?").run(id)
            return res.status(200).json({
                message: "Projeto deletado com sucesso!",
                result
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao deletar projeto",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }
}