import { Router } from "express";
import SchemaController from "../controllers/Schema.controller";

const router = Router();
const controller = new SchemaController();

// Parseia SQL enviado no body (preview sem precisar de um database cadastrado)
router.post("/parse", (req, res) => controller.parseSchema(req, res));

// Retorna o schema parseado de um database específico
router.get("/:id/schema", (req, res) => controller.getSchema(req, res));

export default router;
