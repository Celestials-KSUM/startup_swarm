from fastapi import APIRouter
from app.api.endpoints import health, ai

router = APIRouter()

router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
