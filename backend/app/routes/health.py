from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.envelope import Envelope, ok

router = APIRouter(tags=["system"])


class HealthStatus(BaseModel):
    status: str


@router.get("/health", response_model=Envelope[HealthStatus])
async def health() -> Envelope[HealthStatus]:
    return ok(HealthStatus(status="ok"))
