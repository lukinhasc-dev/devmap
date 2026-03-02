import { Request, Response } from "express";
import type { Tasks } from "../models/Tasks.model";
import db from "../database/connection";

export default class TasksController {
    async getTasks(req: Request, res: Response) {
        try {
            const result = db.prepare("SELECT * FROM tasks").all();
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao buscar tarefas",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async createTask(req: Request, res: Response) {
        const tasks: Tasks = req.body;

        try {
            if (!tasks.titulo.trim() || !tasks.descricao.trim() || !tasks.status.trim()) {
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios",
                    error: "Erro ao cadastrar tarefa"
                })
            }

            const result = db.prepare("INSERT INTO tasks (project_id, titulo, descricao, status) VALUES (?, ?, ?, ?)").run(tasks.project_id, tasks.titulo, tasks.descricao, tasks.status)
            return res.status(201).json({
                message: "Tarefa criada com sucesso!",
                result
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao criar tarefa",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async updateTask(req: Request, res: Response) {
        const id = Number(req.params.id)
        const tasks: Tasks = req.body

        try {
            const verificar = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)

            if (!verificar) {
                return res.status(404).json({
                    message: "Tarefa não encontrada",
                    error: "Erro ao atualizar tarefa"
                })
            }

            const result = db.prepare("UPDATE tasks SET project_id = ?, titulo = ?, descricao = ?, status = ? WHERE id = ?").run(tasks.project_id, tasks.titulo, tasks.descricao, tasks.status, id)
            return res.status(200).json({
                message: "Tarefa atualizada com sucesso!",
                result
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao atualizar tarefa",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async deleteTask(req: Request, res: Response) {
        const id = Number(req.params.id)
        try {
            const verificar = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)

            if (!verificar) {
                return res.status(404).json({
                    message: "Tarefa não encontrada",
                    error: "Erro ao deletar tarefa"
                })
            }

            const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id)
            return res.status(200).json({
                message: "Tarefa deletada com sucesso!",
                result
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao deletar tarefa",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

}
