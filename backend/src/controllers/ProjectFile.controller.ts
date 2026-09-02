import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import db from "../database/connection";
import { uploadsDir } from "../middlewares/upload";

export default class ProjectFileController {
    async getFiles(req: Request, res: Response) {
        const projectId = req.query.project_id ? Number(req.query.project_id) : null;

        try {
            const result = projectId
                ? db.prepare("SELECT * FROM project_files WHERE project_id = ? ORDER BY created_at DESC").all(projectId)
                : db.prepare("SELECT * FROM project_files ORDER BY created_at DESC").all();
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao buscar arquivos",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async uploadFile(req: Request, res: Response) {
        const file = req.file;
        const { project_id, nome, descricao } = req.body;

        if (!file) {
            return res.status(400).json({ message: "Nenhum arquivo enviado" });
        }

        if (!project_id) {
            fs.unlink(file.path, () => {});
            return res.status(400).json({ message: "project_id é obrigatório" });
        }

        try {
            const caminho = `/uploads/${file.filename}`;
            const displayName = nome && String(nome).trim() ? String(nome).trim() : file.originalname;

            const result = db.prepare(
                "INSERT INTO project_files (project_id, nome, descricao, caminho, original_name, mime, tamanho, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            ).run(
                Number(project_id),
                displayName,
                descricao ?? null,
                caminho,
                file.originalname,
                file.mimetype,
                file.size,
                new Date().toISOString()
            );

            return res.status(201).json({
                message: "Arquivo enviado com sucesso!",
                id: result.lastInsertRowid,
            });
        } catch (error) {
            fs.unlink(file.path, () => {});
            console.log(error);
            return res.status(500).json({
                message: "Erro ao salvar arquivo",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }

    async deleteFile(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const registro = db.prepare("SELECT * FROM project_files WHERE id = ?").get(id) as { caminho: string } | undefined;
            if (!registro) {
                return res.status(404).json({ message: "Arquivo não encontrado" });
            }

            const fileName = path.basename(registro.caminho);
            const fullPath = path.join(uploadsDir, fileName);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }

            db.prepare("DELETE FROM project_files WHERE id = ?").run(id);
            return res.status(200).json({ message: "Arquivo removido com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Erro ao remover arquivo",
                error: error instanceof Error ? error.message : "Erro inesperado",
            });
        }
    }
}
