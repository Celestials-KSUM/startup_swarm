from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.api import router
from app.core.config import settings
from app.core.db import connect_to_db, close_db_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB and create tables
    await connect_to_db()
    yield
    # Shutdown: Close connection
    await close_db_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Wire up CORS so the frontend is allowed to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Startup Swarm AI Orchestrator Running 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)