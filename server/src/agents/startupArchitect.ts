import { ChatGroq } from "@langchain/groq";
import { START, END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { SystemMessage, BaseMessage } from "@langchain/core/messages";
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

const SYSTEM_PROMPT = `You are the Lead Startup Architect. You operate in two modes:

1. DISCOVERY MODE (Conversational):
If the user is just pitching an idea or asking questions, provide a strategic, founder-level "First Impression".
Show that you understand the niche. Provide 2-3 "Architect Tips" specific to that domain.
Be encouraging but realistic. 
Keep it concise (2-3 paragraphs max).

2. BLUEPRINT MODE (Structured):
If the user provides detailed data (usually via a structured list of parameters), generate a complete business blueprint in STRICT JSON.
NO markdown, NO explanations.

SPECIALIZED BOARD FOR BLUEPRINTS:
- Market Research Agent 📊: Viability, size, target persona.
- Competition Intelligence Agent 🛡️: Moats, network effects, defensibility.
- Execution Risk Agent 🏗️: Founder-market fit, technical gap.
- Product-Market Fit Agent 🎯: Urgency of problem, validation.

JSON SCHEMA:
{
  "businessOverview": { "name": "string", "description": "string", "targetAudience": "string", "valueProposition": "string" },
  "agentScoring": {
    "marketReseach": { "score": number, "insight": "string" },
    "competitionIntel": { "score": number, "insight": "string" },
    "executionRisk": { "score": number, "insight": "string" },
    "pmfProbability": { "score": number, "insight": "string" }
  },
  "services": [ { "title": "string", "description": "string", "pricingModel": "string" } ],
  "revenueModel": ["string"],
  "costStructure": { "oneTimeSetup": ["string"], "monthlyExpenses": ["string"] },
  "strategicRoadmap": ["string"],
  "risks": ["string"],
  "growthOpportunities": ["string"]
}

Rule: If responding with JSON, do NOT include any text outside the JSON object. Do NOT use markdown code blocks.`;

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
        model: "llama-3.3-70b-versatile",
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

    let content = finalMessage?.content as string || "";

    // Safety: strip markdown if LLM includes it
    if (content.includes("```")) {
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    return content;
}
