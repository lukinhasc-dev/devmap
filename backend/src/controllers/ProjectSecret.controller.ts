import { Request, Response } from "express";
import db from "../database/connection";
import { encrypt, decrypt } from "../utils/crypto";
import type { ProjectSecret } from "../models/ProjectSecret.model";

export default class ProjectSecretController {
    async getSecrets(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;

        try {
            const result = projectId
                ? db.prepare("SELECT id, project_id, nome, tipo, descricao, created_at, updated_at FROM project_secrets WHERE project_id = ? ORDER BY created_at DESC").all(projectId)
                : db.prepare("SELECT id, project_id, nome, tipo, descricao, created_at, updated_at FROM project_secrets ORDER BY created_at DESC").all();
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao buscar segredos",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async revealSecret(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const registro = db.prepare("SELECT valor_cifrado FROM project_secrets WHERE id = ?").get(id) as { valor_cifrado: string } | undefined;
            if (!registro) {
                return res.status(404).json({ message: "Segredo não encontrado" });
            }

            const valor = decrypt(registro.valor_cifrado);
            return res.status(200).json({ valor });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao revelar segredo",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async createSecret(req: Request, res: Response) {
        const secret: ProjectSecret & { valor: string } = req.body;

        if (!secret.project_id || !secret.nome?.trim() || !secret.valor?.trim()) {
            return res.status(400).json({ message: "project_id, nome e valor são obrigatórios" });
        }

        try {
            const cifrado = encrypt(secret.valor);
            const now = new Date().toISOString();

            const result = db.prepare(
                "INSERT INTO project_secrets (project_id, nome, tipo, descricao, valor_cifrado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).run(secret.project_id, secret.nome, secret.tipo ?? null, secret.descricao ?? null, cifrado, now, now);

            return res.status(201).json({
                message: "Segredo criado com sucesso!",
                id: result.lastInsertRowid,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao criar segredo",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async updateSecret(req: Request, res: Response) {
        const id = Number(req.params.id);
        const secret: ProjectSecret & { valor?: string } = req.body;

        try {
            const verificar = db.prepare("SELECT * FROM project_secrets WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({ message: "Segredo não encontrado" });
            }

            const now = new Date().toISOString();

            if (secret.valor && secret.valor.trim()) {
                const cifrado = encrypt(secret.valor);
                db.prepare(
                    "UPDATE project_secrets SET nome = ?, tipo = ?, descricao = ?, valor_cifrado = ?, updated_at = ? WHERE id = ?"
                ).run(secret.nome, secret.tipo ?? null, secret.descricao ?? null, cifrado, now, id);
            } else {
                db.prepare(
                    "UPDATE project_secrets SET nome = ?, tipo = ?, descricao = ?, updated_at = ? WHERE id = ?"
                ).run(secret.nome, secret.tipo ?? null, secret.descricao ?? null, now, id);
            }

            return res.status(200).json({ message: "Segredo atualizado com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao atualizar segredo",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async deleteSecret(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const verificar = db.prepare("SELECT * FROM project_secrets WHERE id = ?").get(id);
            if (!verificar) {
                return res.status(404).json({ message: "Segredo não encontrado" });
            }

            db.prepare("DELETE FROM project_secrets WHERE id = ?").run(id);
            return res.status(200).json({ message: "Segredo removido com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao remover segredo",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }
}
