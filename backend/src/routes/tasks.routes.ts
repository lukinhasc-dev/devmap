import { Router } from "express";
import TasksController from "../controllers/Tasks.controller";

const router = Router();
const tasksController = new TasksController();

router.get("/", tasksController.getTasks);
router.post("/", tasksController.createTask);
router.put("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);

export default router;
