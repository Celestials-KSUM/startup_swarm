# Startup Swarm — Complete Project Analysis (LLM Context Prompt)

> Use this document as a system-level context prompt for any LLM that needs to understand, modify, debug, or extend this codebase.

---

## 1. PROJECT OVERVIEW

**Startup Swarm** is a fullstack AI-powered startup validation platform. Users pitch a raw startup idea, an AI "swarm" of specialized agents analyzes it across multiple dimensions (market viability, competition, execution risk, product-market fit), and produces a structured Business Blueprint with scores, insights, and a strategic roadmap.

The platform has **three independently running services** + a shared Git repository:

| Service | Stack | Port | Purpose |
|---------|-------|------|---------|
| `client/` | Next.js 16 + React 19 + TypeScript + TailwindCSS 4 | 3000 | Frontend SPA — landing page + multi-step architect wizard |
| `server/` | Node.js + Express 5 + TypeScript + LangGraph JS | 5000 | Primary API server — auth scaffolding, AI agent (single-node graph), MongoDB checkpointing |
| `backend/` | Python 3.11 + FastAPI + LangGraph Python | 8000 | Secondary AI orchestrator — multi-agent parallel graph, PostgreSQL persistence |

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                     http://localhost:3000                         │
│                                                                  │
│  ┌──────────────┐   ┌─────────────────────────────────────────┐  │
│  │  Landing Page │   │  Architect Page (/architect)            │  │
│  │  (page.tsx)   │   │  pitch → discovery → wizard → blueprint │  │
│  └──────────────┘   └────────────┬────────────────────────────┘  │
│                                  │ axios POST                    │
└──────────────────────────────────┼───────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Python FastAPI Backend     │
                    │   http://localhost:8000      │
                    │   /api/v1/ai/chat            │
                    │                              │
                    │  ┌────────────────────────┐  │
                    │  │   LangGraph Agent      │  │
                    │  │   (Parallel Fan-out)   │  │
                    │  │                        │  │
                    │  │  ┌──────┐ ┌──────────┐ │  │
                    │  │  │Market│ │Competition│ │  │
                    │  │  └──┬───┘ └────┬─────┘ │  │
                    │  │     │          │        │  │
                    │  │  ┌──┴───┐ ┌────┴─────┐ │  │
                    │  │  │Execu-│ │   PMF    │ │  │
                    │  │  │tion  │ │          │ │  │
                    │  │  └──┬───┘ └────┬─────┘ │  │
                    │  │     └────┬─────┘        │  │
                    │  │     ┌───▼────┐          │  │
                    │  │     │Blueprint│          │  │
                    │  │     │ Node   │          │  │
                    │  │     └────────┘          │  │
                    │  └────────────────────────┘  │
                    │                              │
                    │  PostgreSQL (asyncpg)         │
                    │  Tables: chats, analyses      │
                    └──────────────────────────────┘

                    ┌──────────────────────────────┐
                    │   Node.js Express Server     │
                    │   http://localhost:5000       │
                    │   /api/ai/chat               │
                    │                              │
                    │  ┌────────────────────────┐  │
                    │  │  LangGraph Agent       │  │
                    │  │  (Single-node graph)   │  │
                    │  │  MongoDB Checkpointer  │  │
                    │  └────────────────────────┘  │
                    │                              │
                    │  Mongoose → MongoDB           │
                    │  JWT Auth scaffolding          │
                    └──────────────────────────────┘
```

**Current data flow:** The frontend (`client/`) currently talks **only** to the Python `backend/` on port 8000. The Node.js `server/` exists as a parallel implementation with its own LangGraph agent but is not currently called by the frontend.

---

## 3. FILE-BY-FILE BREAKDOWN

### 3.1 `client/` — Next.js Frontend

| File | Purpose |
|------|---------|
| `package.json` | Next.js 16, React 19, TailwindCSS 4, axios, gsap (animation), lucide-react (icons), react-markdown, uuid, zod |
| `src/app/layout.tsx` | Root layout. Loads Google Fonts: **Inter** (body) + **Outfit** (headings). Sets global metadata title and description. |
| `src/app/globals.css` | TailwindCSS import + CSS custom properties (design tokens). Defines `.ripple-bg`, `.enterprise-card`, `.btn-primary`, `.btn-secondary`, `.social-proof-bar`, `.gradient-text`, `.custom-scrollbar`, and keyframe animations. |
| `src/app/page.tsx` | **Landing page**. A polished marketing page with: hero section, 3 feature cards, 5 agent showcase cards, protocol visualization mockup, and a full footer. Uses lucide-react icons. All content is static/hardcoded. Links to `/architect`. |
| `src/app/architect/page.tsx` | **Core interactive page** — the multi-step AI architect wizard. This is the main functional page of the application. |
| `src/components/Navbar.tsx` | Sticky floating navbar with glassmorphism effect. Scroll-aware (shrinks on scroll). Contains logo, nav links (Solutions, Platform, Resources, Pricing — all placeholder `#` links), and CTA button. |
| `public/` | Static assets: `dashboard.png`, `light-bg.png` (hero background), SVG icons (file, globe, next, vercel, window). |

#### `architect/page.tsx` — Detailed State Machine

This page implements a 4-phase state machine:

```
"pitch" → "discovery" → "wizard" → "blueprint"
```

1. **Pitch Phase** (`appState === "pitch"`): A single textarea where the user types their raw startup idea. On submit, it POSTs to `http://localhost:8000/api/v1/ai/chat` with the idea wrapped in a discovery prompt. The LLM returns a "First Impression" text.

2. **Discovery Phase** (`appState === "discovery"`): Displays the LLM's markdown-formatted first impression using `react-markdown`. Shows two info cards ("Structural Prep" and "The 5-Step Deep-Dive"). Has a "Proceed to Structural Engineering" button.

3. **Wizard Phase** (`appState === "wizard"`): A 5-step questionnaire (QUESTIONS array) asking about:
   - Step 1: Core Blueprint (business model type)
   - Step 2: Market Domain (target customer)
   - Step 3: Defensibility Moat (competitive advantage)
   - Step 4: Builder Profile (team strengths)
   - Step 5: Traction Pulse (validation level)
   
   Each step has 4 radio-button options + a freeform textarea. Progress is tracked in a left sidebar with a completion percentage bar. On final step, triggers `generateBlueprint()`.

4. **Blueprint Phase** (`appState === "blueprint"`): Sends all wizard answers + original idea to the backend as a "blueprint" request. The backend runs the full agent swarm. The response JSON is parsed and rendered as:
   - 4 ScoreCards (Market Viability, Defensibility, Execution Risk, PMF Probability) — each with a progress bar
   - Mission Context card (business name, description, value proposition)
   - Strategic Roadmap (numbered steps)
   - Growth & Finance section (revenue model + monthly expenses)

**IMPORTANT FRONTEND NOTE**: Line 369 still references `blueprint.agentScoring?.marketReseach` (typo — missing 'r'). The backend was fixed to output `marketResearch`, so there is a **frontend-backend key mismatch** for this field. The ScoreCard for "Market Viability" will show `undefined` scores.

---

### 3.2 `backend/` — Python FastAPI AI Orchestrator

| File | Purpose |
|------|---------|
| `requirements.txt` | fastapi, uvicorn, pydantic-settings, langchain, langchain-groq, langgraph, sqlalchemy[asyncio], asyncpg, tavily-python |
| `.env` | Runtime config: `GROQ_API_KEY`, `DATABASE_URL` (PostgreSQL asyncpg connection string), `PROJECT_NAME` |
| `.env.example` | Template for `.env` with all required/optional variables documented |
| `app/main.py` | FastAPI app entry point. Configures lifespan (DB connect/disconnect), CORSMiddleware (allow all origins), mounts router with `/api/v1` prefix. Root GET `/` returns health message. |
| `app/core/config.py` | Pydantic BaseSettings loading from `.env`. Fields: `PROJECT_NAME`, `API_V1_STR`, `BACKEND_CORS_ORIGINS`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `TAVILY_API_KEY`, `DATABASE_URL`. |
| `app/core/db.py` | **PostgreSQL via SQLAlchemy async + asyncpg**. Defines two tables (`chats`, `analyses`) using SQLAlchemy Core `Table` objects. `connect_to_db()` creates engine + auto-creates tables. `get_database()` is a FastAPI dependency yielding an `AsyncSession` per request. |
| `app/api/api.py` | Router aggregator. Includes `health` router at `/health` and `ai` router at `/ai`. |
| `app/api/endpoints/health.py` | Simple `GET /` → `{"status": "ok"}` health check. |
| `app/api/endpoints/ai.py` | **Main AI endpoint**. Three routes: `POST /chat` (discovery or blueprint), `POST /analyze` (legacy alias), `GET /history/{thread_id}`. |
| `app/agents/startup_swarm.py` | **The AI agent swarm** — the core intelligence of the application. |

#### `startup_swarm.py` — Agent Architecture Detail

**LLM**: Groq `llama-3.3-70b-versatile` (temperature 0.1 for structured output, 0.7 for conversational)

**State Schema** (`AgentState`):
```python
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]       # append reducer
    analysis: Annotated[Dict[str, Any], merge_dicts]           # merge reducer
    business_idea: str
    blueprint: Dict[str, Any]
```

**Graph Topology** (LangGraph `StateGraph`):
```
        START
       / | | \
      /  | |  \
 market  comp  exec  pmf     ← 4 parallel analysis nodes
      \  | |  /
       \ | | /
      blueprint               ← single synthesis node
         |
        END
```

- **market_research_node**: Evaluates target customer, market size, existing competitors, differentiation. Returns `{"analysis": {"market": {"score": 1-100, "insight": "..."}}}`.
- **competition_intel_node**: Evaluates moat strength, network effects, switching costs, IP defensibility. Returns `{"analysis": {"competition": {"score": 1-100, "insight": "..."}}}`.
- **execution_risk_node**: Evaluates founder skill vs product, technical capability gap, time commitment. Returns `{"analysis": {"execution": {"score": 1-100, "insight": "..."}}}`.
- **pmf_node**: Evaluates user validation, urgency of problem, alternative solutions. Returns `{"analysis": {"pmf": {"score": 1-100, "insight": "..."}}}`.
- **blueprint_node**: Takes merged analysis from all 4 agents + original idea. Asks LLM to produce a complete Business Blueprint JSON.

**Discovery Mode** (`get_discovery_insight()`): A separate, simpler function that creates a standalone ChatGroq instance and returns a conversational "first impression" text (not the full swarm).

#### Database Schema (PostgreSQL)

```sql
-- Table: chats
CREATE TABLE chats (
    id          SERIAL PRIMARY KEY,
    thread_id   VARCHAR,
    role        VARCHAR NOT NULL,    -- always "assistant"
    content     TEXT NOT NULL,        -- LLM response text
    created_at  TIMESTAMP
);

-- Table: analyses
CREATE TABLE analyses (
    id          SERIAL PRIMARY KEY,
    thread_id   VARCHAR,
    type        VARCHAR NOT NULL,    -- always "blueprint"
    data        JSONB,               -- full blueprint JSON
    created_at  TIMESTAMP
);
```

#### Blueprint JSON Schema (LLM Output)

```json
{
  "businessOverview": {
    "name": "string",
    "description": "string",
    "targetAudience": "string",
    "valueProposition": "string"
  },
  "agentScoring": {
    "marketResearch": { "score": "number (1-100)", "insight": "string" },
    "competitionIntel": { "score": "number (1-100)", "insight": "string" },
    "executionRisk": { "score": "number (1-100)", "insight": "string" },
    "pmfProbability": { "score": "number (1-100)", "insight": "string" }
  },
  "services": [
    { "title": "string", "description": "string", "pricingModel": "string" }
  ],
  "revenueModel": ["string"],
  "costStructure": {
    "oneTimeSetup": ["string"],
    "monthlyExpenses": ["string"]
  },
  "strategicRoadmap": ["string"],
  "risks": ["string"],
  "growthOpportunities": ["string"]
}
```

---

### 3.3 `server/` — Node.js Express Server

| File | Purpose |
|------|---------|
| `package.json` | Express 5, @langchain/groq, @langchain/langgraph, @langchain/langgraph-checkpoint-mongodb, mongoose, jsonwebtoken, zod, helmet, cors, morgan, winston |
| `tsconfig.json` | TypeScript config: ES2020 target, CommonJS modules, decorators enabled, rootDir `./src`, outDir `./dist` |
| `src/index.ts` | Entry point. Loads dotenv, connects to MongoDB via Mongoose, starts Express on `PORT` (default 5000). |
| `src/app.ts` | Express app setup. Middleware: helmet, CORS (hardcoded to `http://localhost:3000` only), JSON body parser (10MB limit), cookie-parser, morgan (dev only). Routes: `/api/users` (placeholder), `/api/admin` (placeholder), `/api/ai` (active). Global error handler. |
| `src/config/db.ts` | MongoDB connection via Mongoose. Reads `MONGO_URI` from env. Exits process on failure. |
| `src/agents/startupArchitect.ts` | **The Node.js LangGraph agent**. Uses a single-node StateGraph with `MessagesAnnotation`. Uses `MongoDBSaver` for conversation checkpointing (persistent thread memory). Model: `llama-3.3-70b-versatile`. Has a comprehensive system prompt that handles both Discovery (conversational) and Blueprint (JSON) modes in a single agent node. |
| `src/routes/aiRouter.ts` | Single route: `POST /chat`. Requires `message` + `threadId` in body. Calls `invokeAgent()` and returns `{"response": content}`. |
| `src/routes/userRouter.ts` | Placeholder: `GET /` → `{"message": "User router placeholder"}` |
| `src/routes/adminRouter.ts` | Placeholder: `GET /` → `{"message": "Admin router placeholder"}` |
| `src/middlewares/error.middleware.ts` | Global Express error handler. Logs via Winston. Returns error JSON with stack trace in non-production. |
| `src/utils/logger.ts` | Winston logger. Console + file transports (`logs/error.log`, `logs/combined.log`). Colorized dev format, JSON production format. |
| `src/utils/customError.ts` | Custom error class extending `Error` with `statusCode` and `isOperational` fields. |
| `src/enums/statusCode.enums.ts` | HTTP status code enum (200, 201, 400, 401, 403, 404, 409, 422, 500, 501, 502, 503). |

**Key difference from `backend/`**: The Node.js server uses a **single LangGraph node** (not a multi-agent swarm) that handles both discovery and blueprint modes via a single system prompt. It uses **MongoDB checkpointing** for conversation persistence (remembers full thread history). The Python backend uses a **4-node parallel graph** for analysis but has no conversation memory.

---

## 4. INTER-SERVICE COMMUNICATION

```
Frontend (client:3000) ──POST──→ Python Backend (backend:8000)
                                  ├── /api/v1/ai/chat (discovery)
                                  ├── /api/v1/ai/chat (blueprint)
                                  └── /api/v1/ai/history/{thread_id}

Frontend (client:3000) ──NONE──→ Node.js Server (server:5000)
                                  (Not currently connected)
```

The frontend currently **only** communicates with the Python backend. The Node.js server is a **separate, standalone** implementation that could serve as an alternative or future primary backend.

---

## 5. ENVIRONMENT VARIABLES

### `backend/.env`
```env
PROJECT_NAME="Startup Swarm AI Orchestrator"
GROQ_API_KEY=<required>
OPENAI_API_KEY=<optional>
TAVILY_API_KEY=<optional>
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/startup_swarm
```

### `server/.env` (expected)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/startup_swarm
GROQ_API_KEY=<required>
JWT_SECRET=<required>
NODE_ENV=development
```

---

## 6. TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | TailwindCSS 4 + custom CSS |
| Animations | GSAP 3 |
| Icons | lucide-react |
| Markdown | react-markdown |
| HTTP Client | axios |
| Backend (Python) | FastAPI + Uvicorn |
| Backend (Node.js) | Express 5 + TypeScript |
| AI Framework | LangChain + LangGraph (both Python & JS) |
| LLM Provider | Groq API |
| LLM Model | `llama-3.3-70b-versatile` |
| Database (Python) | PostgreSQL via SQLAlchemy async + asyncpg |
| Database (Node.js) | MongoDB via Mongoose + native MongoClient |
| Validation | Pydantic (Python), Zod (TypeScript) |
| Auth | JWT (server-side scaffolding only, not implemented) |
| Logging | Winston (Node.js), print statements (Python) |

---

## 7. KNOWN ISSUES & INCONSISTENCIES

1. **Frontend-backend key mismatch**: `client/src/app/architect/page.tsx` line 369 references `blueprint.agentScoring?.marketReseach` (typo — missing 'r'), but the backend now outputs `marketResearch`. The Market Viability ScoreCard will show `undefined`.

2. **Server `startupArchitect.ts` also has the typo**: Line 29 has `"marketReseach"` in the system prompt JSON schema. If the Node.js server is ever connected to the frontend, the same mismatch will occur.

3. **Two competing backends**: Both `server/` and `backend/` implement the same AI chat functionality with different architectures. Only `backend/` is currently used by the frontend. This creates maintenance burden and potential confusion.

4. **No authentication on the Python backend**: The Node.js server has JWT scaffolding, but the Python backend (which the frontend actually uses) has zero auth — any client can call the API.

5. **Server CORS is restrictive**: The Node.js server only allows `http://localhost:3000`. If the frontend ever needs to talk to it, this is fine for dev but needs updating for production.

6. **No error handling for LLM JSON parsing on frontend**: `architect/page.tsx` line 138 does `JSON.parse(content)` directly. If the LLM returns malformed JSON (which happens), this will throw and trigger the generic "Strategic connection lost" alert with no recovery.

7. **Server creates a new agent instance per request**: `startupArchitect.ts` `invokeAgent()` calls `createAgent()` on every request, which creates a new `StateGraph` and compiles it each time. This is wasteful — the graph should be compiled once and reused.

---

## 8. DEVELOPMENT COMMANDS

```bash
# Frontend
cd client && npm install && npm run dev        # → http://localhost:3000

# Python Backend
cd backend
conda activate startupswarm
uvicorn app.main:app --reload                  # → http://localhost:8000

# Node.js Server
cd server && npm install && npm run dev        # → http://localhost:5000

# PostgreSQL (required for backend)
psql -U postgres -c "CREATE DATABASE startup_swarm;"
```

---

*This document was generated by analyzing every file in the repository. Last updated: 2026-02-27.*
