# Startup Swarm - Fullstack Guide

Startup Swarm is a platform designed to architect and validate startups using AI agents. It consists of three main parts:
1. **Client**: Next.js frontend.
2. **Server**: Node.js/Express main API and LangGraph orchestrator.
3. **Backend**: Python/FastAPI AI orchestrator (for specialized tasks).

---

## 🛠️ Global Setup

Ensure you have the following installed:
- Node.js (v18+)
- Python (3.10+)
- MongoDB (running locally or via Atlas)

---

## 1. 🟢 Main Server (Node.js)
The core API handling authentication, database, and primary AI graph.

```bash
cd server
npm install
npm run dev
```
**Required `.env` in `server/`:**
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/startup_swarm`
- `GROQ_API_KEY=your_key`
- `JWT_SECRET=your_secret`

---

## 2. 🐍 AI Orchestrator (Python)
The Python service for specialized AI processing.

```bash
cd backend
python -m venv venv
# Activate venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 3. 💻 Frontend (Client)
The Next.js user interface.

```bash
cd client
npm install
npm run dev
```

---

## 📂 Project Structure
- `client/`: Next.js frontend components and pages.
- `server/`: Node.js backend with Express and LangGraph.
- `backend/`: Python FastAPI service for AI workers.
- `.env` files are required in each directory.