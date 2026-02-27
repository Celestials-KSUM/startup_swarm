import { Router } from "express";
import { invokeAgent } from "../agents/startupArchitect";

const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {
    try {
        const { message, threadId } = req.body;

        if (!message || !threadId) {
            res.status(400).json({ error: "message and threadId are required" });
            return;
        }

        const responseContent = await invokeAgent(threadId, message);

        res.json({ response: responseContent });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" });
    }
});

export default aiRouter;
