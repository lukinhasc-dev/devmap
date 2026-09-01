import { Router } from "express";
import TaskLabelController from "../controllers/TaskLabel.controller";

const router = Router();
const controller = new TaskLabelController();

router.get("/", controller.getLabels);
router.post("/", controller.createLabel);
router.put("/:id", controller.updateLabel);
router.delete("/:id", controller.deleteLabel);

export default router;
