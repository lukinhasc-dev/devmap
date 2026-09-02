import { Router } from "express";
import ProjectLinkController from "../controllers/ProjectLink.controller";

const router = Router();
const controller = new ProjectLinkController();

router.get("/", controller.getLinks);
router.post("/", controller.createLink);
router.put("/:id", controller.updateLink);
router.delete("/:id", controller.deleteLink);

export default router;
