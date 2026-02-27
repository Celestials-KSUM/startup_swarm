from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.agents.startup_swarm import startup_agent, get_discovery_insight
from app.core.db import get_database
import uuid
import datetime
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    threadId: Optional[str] = None  # CamelCase to match frontend axios call

@router.post("/chat")
async def handle_chat(request: ChatRequest, db = Depends(get_database)):
    """
    Main endpoint for the frontend. Handles Discovery (text) and Blueprint (JSON).
    """
    try:
        # Check if this is a blueprint request
        # The frontend sends: "User is ready for the blueprint. Context idea: ... Here is the structured data: ..."
        is_blueprint_request = "blueprint" in request.message.lower() and "structured data" in request.message.lower()
        
        if is_blueprint_request:
            # Run the full Agent Swarm
            inputs = {
                "business_idea": request.message,
                "messages": [],
                "analysis": {},
                "blueprint": {}
            }
            
            result = await startup_agent.ainvoke(inputs)
            blueprint_data = result.get("blueprint", {})
            
            # Save to MongoDB
            history_record = {
                "thread_id": request.threadId,
                "type": "blueprint",
                "data": blueprint_data,
                "created_at": datetime.datetime.utcnow()
            }
            await db.analyses.insert_one(history_record)
            
            # The frontend expects the JSON as a string inside a 'response' field
            return {"response": json.dumps(blueprint_data)}
        
        else:
            # Discovery Phase
            insight = await get_discovery_insight(request.message)
            
            # Save interaction to MongoDB
            await db.chats.insert_one({
                "thread_id": request.threadId,
                "role": "assistant",
                "content": insight,
                "created_at": datetime.datetime.utcnow()
            })
            
            return {"response": insight}
            
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_legacy(request: ChatRequest, db = Depends(get_database)):
    # Keeping this for backward compatibility if needed
    # (Implementation omitted for brevity, but could just call handle_chat logic)
    return await handle_chat(request, db)

@router.get("/history/{thread_id}")
async def get_analysis_history(thread_id: str, db = Depends(get_database)):
    try:
        cursor = db.analyses.find({"thread_id": thread_id}).sort("created_at", -1)
        analyses = await cursor.to_list(length=10)
        
        for a in analyses:
            a["_id"] = str(a["_id"])
            if isinstance(a["created_at"], datetime.datetime):
                a["created_at"] = a["created_at"].isoformat()
            
        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
