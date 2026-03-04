import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

const dashboardService = new DashboardService();

export class DashboardController {
    getDashboardStats(req: Request, res: Response) {
        try {
            const stats = dashboardService.getDashboardStats();
            return res.status(200).json(stats);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro ao buscar estatísticas do dashboard",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    }
}