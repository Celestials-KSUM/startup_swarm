from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.api import router
from app.core.config import settings
from app.core.db import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB
    await connect_to_mongo()
    yield
    # Shutdown: Close connection
    await close_mongo_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Startup Swarm AI Orchestrator Running 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)