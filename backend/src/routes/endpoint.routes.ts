import { Router } from "express";
import EndpointController from "../controllers/Endpoint.controller";

const router = Router();
const endpointController = new EndpointController();

router.get("/", endpointController.getEndpoints);
router.post("/", endpointController.createEndpoint);
router.put("/:id", endpointController.updateEndpoint);
router.delete("/:id", endpointController.deleteEndpoint);

export default router;