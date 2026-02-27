import { Router } from "express";

const router = Router();

// Placeholder route
router.get("/", (req, res) => {
    res.json({ message: "User router placeholder" });
});

export default router;
