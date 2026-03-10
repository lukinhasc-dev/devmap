import { Router } from "express";
import endpointRoutes from "./endpoint.routes";
import projectsRoutes from "./projects.routes";
import databaseRoutes from "./database.routes";
import githubRoutes from "./github.routes";
import tasksRoutes from "./tasks.routes";
import dashboardRoutes from "./dashboard.routes";
import schemaRoutes from "./schema.routes";

const router = Router();

router.use("/endpoints", endpointRoutes);
router.use("/projects", projectsRoutes);
router.use("/databases", databaseRoutes);
router.use("/github", githubRoutes);
router.use("/tasks", tasksRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/schema", schemaRoutes);

export default router;