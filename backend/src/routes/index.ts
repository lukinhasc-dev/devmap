import { Router } from "express";
import endpointRoutes from "./endpoint.routes";
import projectsRoutes from "./projects.routes";
import databaseRoutes from "./database.routes";

const router = Router();

router.use("/endpoints", endpointRoutes);
router.use("/projects", projectsRoutes);
router.use("/databases", databaseRoutes);

export default router;