import { Request, Response } from "express";
import schemaService from "../services/schema.service";

export default class SchemaController {

    /**
     * GET /databases/:id/schema
     * Retorna a estrutura parseada do schema de um database.
     */
    async getSchema(req: Request, res: Response) {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        try {
            const result = schemaService.getSchemaByDatabaseId(id);

            if (!result) {
                return res.status(404).json({ message: "Database não encontrado." });
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao processar schema.",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            });
        }
    }

    /**
     * POST /schema/parse
     * Parseia um schema SQL enviado diretamente no body (útil para preview).
     */
    async parseSchema(req: Request, res: Response) {
        const { sql } = req.body as { sql?: string };

        if (!sql || !sql.trim()) {
            return res.status(400).json({ message: "O campo 'sql' é obrigatório." });
        }

        try {
            const result = schemaService.parseSchema(sql);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao parsear schema.",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            });
        }
    }
}
