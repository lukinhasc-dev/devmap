import { Router } from "express";
import DatabaseController from "../controllers/Database.controller";

const router = Router();
const controller = new DatabaseController();

router.get("/", controller.getDatabases);
router.get("/:id", controller.getDatabaseById);
router.post("/", controller.createDatabase);
router.put("/:id", controller.updateDatabase);
router.delete("/:id", controller.deleteDatabase);

export default router;