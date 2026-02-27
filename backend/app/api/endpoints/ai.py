from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from app.agents.startup_swarm import startup_agent, get_discovery_insight
from app.core.db import get_database, chats_table, analyses_table
import uuid
import datetime
import json

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    threadId: Optional[str] = None  # CamelCase to match frontend axios call


@router.post("/chat")
async def handle_chat(request: ChatRequest, db: AsyncSession = Depends(get_database)):
    """
    Main endpoint for the frontend. Handles Discovery (text) and Blueprint (JSON).
    """
    try:
        thread_id = request.threadId or str(uuid.uuid4())

        # Check if this is a blueprint request
        # The frontend sends: "User is ready for the blueprint. Context idea: ... Here is the structured data: ..."
        is_blueprint_request = (
            "blueprint" in request.message.lower()
            and "structured data" in request.message.lower()
        )

        if is_blueprint_request:
            # Run the full Agent Swarm
            inputs = {
                "business_idea": request.message,
                "messages": [],
                "analysis": {},
                "blueprint": {},
            }

            result = await startup_agent.ainvoke(inputs)
            blueprint_data = result.get("blueprint", {})

            # Save to PostgreSQL → analyses table
            await db.execute(
                insert(analyses_table).values(
                    thread_id=thread_id,
                    type="blueprint",
                    data=blueprint_data,
                    created_at=datetime.datetime.utcnow(),
                )
            )
            await db.commit()

            # The frontend expects the JSON as a string inside a 'response' field
            return {"response": json.dumps(blueprint_data)}

        else:
            # Discovery Phase
            insight = await get_discovery_insight(request.message)

            # Save interaction to PostgreSQL → chats table
            await db.execute(
                insert(chats_table).values(
                    thread_id=thread_id,
                    role="assistant",
                    content=insight,
                    created_at=datetime.datetime.utcnow(),
                )
            )
            await db.commit()

            return {"response": insight}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze")
async def analyze_legacy(request: ChatRequest, db: AsyncSession = Depends(get_database)):
    # Keeping this for backward compatibility
    return await handle_chat(request, db)


@router.get("/history/{thread_id}")
async def get_analysis_history(thread_id: str, db: AsyncSession = Depends(get_database)):
    try:
        result = await db.execute(
            select(analyses_table)
            .where(analyses_table.c.thread_id == thread_id)
            .order_by(analyses_table.c.created_at.desc())
            .limit(10)
        )
        rows = result.mappings().all()

        analyses = []
        for row in rows:
            record = dict(row)
            record["id"] = str(record["id"])
            if isinstance(record.get("created_at"), datetime.datetime):
                record["created_at"] = record["created_at"].isoformat()
            analyses.append(record)

        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
