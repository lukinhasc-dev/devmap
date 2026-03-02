import { Router } from "express";
import endpointRoutes from "./endpoint.routes";
import projectsRoutes from "./projects.routes";
import databaseRoutes from "./database.routes";
import githubRoutes from "./github.routes";

const router = Router();

router.use("/endpoints", endpointRoutes);
router.use("/projects", projectsRoutes);
router.use("/databases", databaseRoutes);
router.use("/github", githubRoutes);

export default router;