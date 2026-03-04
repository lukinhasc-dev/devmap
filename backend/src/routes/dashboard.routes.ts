import { Router } from "express";
import { DashboardController } from "../controllers/Dashboard.controller";

const router = Router();
const dashboardController = new DashboardController();

router.get("/", dashboardController.getDashboardStats);

export default router;