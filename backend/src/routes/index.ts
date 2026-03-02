import { Router } from "express";
import endpointRoutes from "./endpoint.routes";
import projectsRoutes from "./projects.routes";

const router = Router();

router.use("/endpoints", endpointRoutes);
router.use("/projects", projectsRoutes);

export default router;