from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = "default-thread"

@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        # Placeholder for AI logic
        # In a real scenario, you'd call LangGraph or another agent framework here
        return {
            "response": f"AI Orchestrator received: {request.message}",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
