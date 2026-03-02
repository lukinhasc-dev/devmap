import { Router } from 'express';
import GithubController from '../controllers/Github.controller';

const router = Router();
const githubController = new GithubController();

router.get("/", githubController.getGithubs);
router.get("/:id", githubController.getGithubById);
router.post("/", githubController.createGithub);
router.put("/:id", githubController.updateGithub);
router.delete("/:id", githubController.deleteGithub);

export default router;
