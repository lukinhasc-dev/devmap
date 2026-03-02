import { Router } from "express";
import EndpointController from "../controllers/Endpoint.controller";

const router = Router();
const endpointController = new EndpointController();

router.get("/endpoints", endpointController.getEndpoints);
router.post("/endpoints", endpointController.createEndpoint);
router.put("/endpoints/:id", endpointController.updateEndpoint);
router.delete("/endpoints/:id", endpointController.deleteEndpoint);

export default router;