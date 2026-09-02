import { Router } from "express";
import EndpointGroupController from "../controllers/EndpointGroup.controller";

const router = Router();
const endpointGroupController = new EndpointGroupController();

router.get("/", endpointGroupController.getGroups);
router.post("/", endpointGroupController.createGroup);
router.put("/:id", endpointGroupController.updateGroup);
router.delete("/:id", endpointGroupController.deleteGroup);

export default router;
