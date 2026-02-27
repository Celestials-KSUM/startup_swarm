# Startup Swarm - AI Orchestrator (Python Backend)

This is the Python-based AI orchestration service for Startup Swarm. It uses FastAPI for high-performance API delivery and is designed to host AI agents and long-running orchestration tasks.

## 🚀 Features
- **FastAPI Framework**: Modern, fast (high-performance) web framework.
- **Modular Structure**: Clean separation of routes, core config, and logic.
- **AI Ready**: Pre-configured with LangChain/LangGraph dependencies.

## 🛠️ Setup & Installation

### 1. Prerequisites
- Python 3.10 or higher
- `pip` (Python package installer)

### 2. Create a Virtual Environment
It is highly recommended to use a virtual environment.
```bash
# Navigate to the backend directory
cd backend

# Create venv
python -m venv venv

# Activate venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the `backend/` root:
```env
PROJECT_NAME="Startup Swarm AI"
GROQ_API_KEY=your_key_here
```

## 🏃 Running the Server

### Development Mode (with hot-reload)
```bash
uvicorn app.main:app --reload
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📍 API Endpoints
- **GET** `/`: Root health check message.
- **GET** `/api/v1/health`: Detailed health status.
- **POST** `/api/v1/ai/chat`: Chat with the AI orchestrator (discovery or blueprint).
- **POST** `/api/v1/ai/analyze`: Alias for `/ai/chat` (legacy compatibility).
- **GET** `/api/v1/ai/history/{thread_id}`: Fetch past analysis records.

## 📁 Directory Structure
```text
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/    # Route-specific logic
│   │   └── api.py         # Main router entry
│   ├── core/
│   │   └── config.py      # App settings & env vars
│   └── main.py            # FastAPI app entry point
├── requirements.txt
└── README.md
```
