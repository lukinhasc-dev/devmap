import { Router } from "express";

const router = Router();

router.get("/endpoints", (req, res) => {
    res.json({ message: "Endpoints funcionando! 🚀" });
});

export default router;