import { Router } from "express";
import ProjectsController from "../controllers/Projects.controller";

const router = Router()
const projectsController = new ProjectsController()

router.get("/projects", projectsController.getProjects)
router.get("/projects/:id", projectsController.getProjectById)
router.post("/projects", projectsController.createProject)
router.put("/projects/:id", projectsController.updateProject)
router.delete("/projects/:id", projectsController.deleteProject)

export default router