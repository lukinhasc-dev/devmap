import { Request, Response } from "express";
import type { TaskLabel } from "../models/TaskLabel.model";
import db from "../database/connection";

export default class TaskLabelController {
    async getLabels(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;

        try {
            if (!projectId) {
                return res.status(400).json({ message: "project_id é obrigatório", error: "Dados inválidos" });
            }

            const rows = db.prepare("SELECT * FROM task_labels WHERE project_id = ? ORDER BY id").all(projectId);
            return res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao buscar labels",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async createLabel(req: Request, res: Response) {
        const label: TaskLabel = req.body;

        try {
            if (!label.nome?.trim()) {
                return res.status(400).json({ message: "O nome da label é obrigatório", error: "Dados inválidos" });
            }
            if (!label.project_id) {
                return res.status(400).json({ message: "project_id é obrigatório", error: "Dados inválidos" });
            }

            const result = db.prepare(
                "INSERT INTO task_labels (project_id, nome, cor) VALUES (?, ?, ?)"
            ).run(label.project_id, label.nome, label.cor ?? null);

            return res.status(201).json({ message: "Label criada com sucesso!", result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao criar label",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async updateLabel(req: Request, res: Response) {
        const label: TaskLabel = req.body;
        const id = Number(req.params.id);

        try {
            const found = db.prepare("SELECT * FROM task_labels WHERE id = ?").get(id);
            if (!found) {
                return res.status(404).json({ message: "Label não encontrada", error: "Erro interno do servidor" });
            }
            if (!label.nome?.trim()) {
                return res.status(400).json({ message: "O nome da label é obrigatório", error: "Dados inválidos" });
            }

            const result = db.prepare(
                "UPDATE task_labels SET nome = ?, cor = ? WHERE id = ?"
            ).run(label.nome, label.cor ?? null, id);

            return res.status(200).json({ message: "Label atualizada com sucesso!", result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao atualizar label",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async deleteLabel(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const found = db.prepare("SELECT * FROM task_labels WHERE id = ?").get(id);
            if (!found) {
                return res.status(404).json({ message: "Label não encontrada", error: "Erro interno do servidor" });
            }

            const result = db.prepare("DELETE FROM task_labels WHERE id = ?").run(id);
            return res.status(200).json({ message: "Label deletada com sucesso!", result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao deletar label",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }
}
