import { Router } from "express";
import endpointRoutes from "./endpoint.routes";
import endpointGroupRoutes from "./endpointgroup.routes";
import projectsRoutes from "./projects.routes";
import databaseRoutes from "./database.routes";
import githubRoutes from "./github.routes";
import tasksRoutes from "./tasks.routes";
import taskStatusRoutes from "./taskstatus.routes";
import taskLabelRoutes from "./tasklabel.routes";
import projectFileRoutes from "./projectfile.routes";
import projectLinkRoutes from "./projectlink.routes";
import projectSecretRoutes from "./projectsecret.routes";
import dashboardRoutes from "./dashboard.routes";
import schemaRoutes from "./schema.routes";

const router = Router();

router.use("/endpoints", endpointRoutes);
router.use("/endpoint-groups", endpointGroupRoutes);
router.use("/projects", projectsRoutes);
router.use("/databases", databaseRoutes);
router.use("/github", githubRoutes);
router.use("/tasks", tasksRoutes);
router.use("/task-statuses", taskStatusRoutes);
router.use("/task-labels", taskLabelRoutes);
router.use("/project-files", projectFileRoutes);
router.use("/project-links", projectLinkRoutes);
router.use("/project-secrets", projectSecretRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/schema", schemaRoutes);

export default router;