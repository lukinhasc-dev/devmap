import { Router } from "express";
import ProjectSecretController from "../controllers/ProjectSecret.controller";

const router = Router();
const controller = new ProjectSecretController();

router.get("/", controller.getSecrets);
router.get("/:id/reveal", controller.revealSecret);
router.post("/", controller.createSecret);
router.put("/:id", controller.updateSecret);
router.delete("/:id", controller.deleteSecret);

export default router;
