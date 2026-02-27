import { ChatGroq } from "@langchain/groq";
import { START, END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { SystemMessage, BaseMessage } from "@langchain/core/messages";
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a Startup Architect AI.

Your responsibility is to transform raw startup ideas into a structured, realistic, and executable business blueprint.

You must operate in 3 phases:

PHASE 1 – Clarification
If critical information is missing, ask focused follow-up questions.
Ask at most 5 questions at a time.
Do NOT generate the final blueprint until sufficient data is collected.
Be sure to clarify Budget, Location, Target customers, Solo or team, Pricing positioning, etc. if implicitly or explicitly missing.
Do NOT assume anything.

PHASE 2 – Structured Planning
Once enough information is gathered, generate a complete business blueprint in STRICT JSON format matching the required schema.
No explanations.
No markdown.
No extra commentary.
The schema you must output should be an object containing exactly these fields:
{"businessOverview": {"name": "...", "description": "...", "targetAudience": "...", "valueProposition": "..."}, "services": [{"title": "...", "description": "...", "pricingModel": "..."}], "revenueModel": ["..."], "costStructure": {"oneTimeSetup": ["..."], "monthlyExpenses": ["..."]}, "marketPositioning": "...", "initialExecutionSteps": ["..."], "risks": ["..."], "growthOpportunities": ["..."]}

PHASE 3 – Validation Awareness
If budget, location, or target audience is unclear, explicitly mark fields as "requires clarification" instead of guessing.
Be realistic. Avoid unrealistic revenue projections. Avoid hallucinating legal claims. Think strategically but practically.

Output Rules:
- During questioning phase → return conversational text only.
- During blueprint phase → return ONLY valid JSON.
- Never mix conversation and JSON.

Tone: Professional. Strategic. Founder-level clarity. Execution-focused.`;

let checkpointer: MongoDBSaver | undefined;
let mongoClient: MongoClient | undefined;

async function getCheckpointer() {
    if (checkpointer) return checkpointer;

    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || "mongodb://localhost:27017";
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();

    checkpointer = new MongoDBSaver({
        client: mongoClient as any,
        dbName: "startup_architect_agent",
    });
    return checkpointer;
}

export async function createAgent() {
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile", // Or specify whatever model is best
        temperature: 0.1,
    });

    const graphBuilder = new StateGraph(MessagesAnnotation)
        .addNode("agent", async (state) => {
            const messages = state.messages;
            const hasSystemMessage = messages.length > 0 && messages[0].getType() === "system";

            let allMessages = messages;
            if (!hasSystemMessage) {
                allMessages = [new SystemMessage(SYSTEM_PROMPT), ...messages];
            }

            const response = await llm.invoke(allMessages);
            return { messages: [response] };
        })
        .addEdge(START, "agent")
        .addEdge("agent", END);

    const saver = await getCheckpointer();

    return graphBuilder.compile({ checkpointer: saver });
}

export async function invokeAgent(threadId: string, userInput: string) {
    const agent = await createAgent();

    const config = { configurable: { thread_id: threadId } };

    const state = await agent.invoke(
        { messages: [{ role: "user", content: userInput }] },
        config
    );

    const messages = state.messages;
    const finalMessage = messages[messages.length - 1];

    return finalMessage?.content || "No response generated.";
}
