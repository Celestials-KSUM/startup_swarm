import { Router } from "express";

const router = Router();

// Placeholder route
router.get("/", (req, res) => {
    res.json({ message: "Admin router placeholder" });
});

export default router;
