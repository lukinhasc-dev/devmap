import { Router } from "express";
import endpointRoutes from "./endpoint.routes";

const router = Router();

router.use("/endpoints", endpointRoutes);

export default router;