import { Router } from "express";
import TaskStatusController from "../controllers/TaskStatus.controller";

const router = Router();
const controller = new TaskStatusController();

router.get("/", controller.getStatuses);
router.post("/", controller.createStatus);
router.put("/:id", controller.updateStatus);
router.delete("/:id", controller.deleteStatus);

export default router;
