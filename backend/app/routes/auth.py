from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.db import get_session
from app.schemas.auth import AuthSession, DemoLoginRequest
from app.schemas.envelope import Envelope, ok
from app.schemas.users import UserOut
from app.services import auth as auth_service

router = APIRouter(tags=["auth"])

Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/auth/demo-login", response_model=Envelope[AuthSession])
async def demo_login(payload: DemoLoginRequest, session: Session) -> Envelope[AuthSession]:
    token, user = await auth_service.demo_login(session, payload.provider)
    return ok(AuthSession(access_token=token, user=UserOut.from_model(user)))
