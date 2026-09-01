import { Request, Response } from "express";
import type { TaskStatus } from "../models/TaskStatus.model";
import db from "../database/connection";

const DEFAULT_STATUSES = [
    { chave: "pendente", nome: "Pendente", cor: "#9ca3af", ordem: 0 },
    { chave: "em andamento", nome: "Em Andamento", cor: "#60a5fa", ordem: 1 },
    { chave: "concluida", nome: "Concluída", cor: "#34d399", ordem: 2 },
];

function seedDefaults(projectId: number) {
    const insert = db.prepare("INSERT INTO task_statuses (project_id, chave, nome, cor, ordem) VALUES (?, ?, ?, ?, ?)");
    const tx = db.transaction(() => {
        for (const s of DEFAULT_STATUSES) {
            insert.run(projectId, s.chave, s.nome, s.cor, s.ordem);
        }
    });
    tx();
}

function slugify(text: string): string {
    const base = text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return base || "status";
}

function uniqueChave(projectId: number, nome: string): string {
    const existing = db.prepare("SELECT chave FROM task_statuses WHERE project_id = ?").all(projectId) as { chave: string }[];
    const taken = new Set(existing.map((e) => e.chave));
    const base = slugify(nome);
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
}

export default class TaskStatusController {
    async getStatuses(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;

        try {
            if (!projectId) {
                return res.status(400).json({ message: "project_id é obrigatório", error: "Dados inválidos" });
            }

            let rows = db.prepare("SELECT * FROM task_statuses WHERE project_id = ? ORDER BY ordem, id").all(projectId);

            if (rows.length === 0) {
                seedDefaults(projectId);
                rows = db.prepare("SELECT * FROM task_statuses WHERE project_id = ? ORDER BY ordem, id").all(projectId);
            }

            return res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao buscar status",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async createStatus(req: Request, res: Response) {
        const status: TaskStatus = req.body;

        try {
            if (!status.nome?.trim()) {
                return res.status(400).json({ message: "O nome do status é obrigatório", error: "Dados inválidos" });
            }
            if (!status.project_id) {
                return res.status(400).json({ message: "project_id é obrigatório", error: "Dados inválidos" });
            }

            const chave = uniqueChave(status.project_id, status.nome);
            const maxOrdem = db.prepare("SELECT COALESCE(MAX(ordem), -1) as m FROM task_statuses WHERE project_id = ?").get(status.project_id) as { m: number };

            const result = db.prepare(
                "INSERT INTO task_statuses (project_id, chave, nome, cor, ordem) VALUES (?, ?, ?, ?, ?)"
            ).run(status.project_id, chave, status.nome, status.cor ?? null, maxOrdem.m + 1);

            return res.status(201).json({ message: "Status criado com sucesso!", result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao criar status",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async updateStatus(req: Request, res: Response) {
        const status: TaskStatus = req.body;
        const id = Number(req.params.id);

        try {
            const found = db.prepare("SELECT * FROM task_statuses WHERE id = ?").get(id);
            if (!found) {
                return res.status(404).json({ message: "Status não encontrado", error: "Erro interno do servidor" });
            }
            if (!status.nome?.trim()) {
                return res.status(400).json({ message: "O nome do status é obrigatório", error: "Dados inválidos" });
            }

            const result = db.prepare(
                "UPDATE task_statuses SET nome = ?, cor = ?, ordem = ? WHERE id = ?"
            ).run(status.nome, status.cor ?? null, status.ordem ?? 0, id);

            return res.status(200).json({ message: "Status atualizado com sucesso!", result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao atualizar status",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }

    async deleteStatus(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const found = db.prepare("SELECT * FROM task_statuses WHERE id = ?").get(id) as TaskStatus | undefined;
            if (!found) {
                return res.status(404).json({ message: "Status não encontrado", error: "Erro interno do servidor" });
            }

            const inUse = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE project_id = ? AND status = ?").get(found.project_id, found.chave) as { n: number };
            if (inUse.n > 0) {
                return res.status(409).json({
                    message: `Não é possível excluir: há ${inUse.n} tarefa(s) nesse status. Mova-as antes.`,
                    error: "Status em uso"
                });
            }

            const result = db.prepare("DELETE FROM task_statuses WHERE id = ?").run(id);
            return res.status(200).json({ message: "Status deletado com sucesso!", result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao deletar status",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }
}
