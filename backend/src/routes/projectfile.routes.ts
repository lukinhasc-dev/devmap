import { Router } from "express";
import ProjectFileController from "../controllers/ProjectFile.controller";
import upload from "../middlewares/upload";

const router = Router();
const controller = new ProjectFileController();

router.get("/", controller.getFiles);
router.post("/", upload.single("file"), controller.uploadFile);
router.delete("/:id", controller.deleteFile);

export default router;
