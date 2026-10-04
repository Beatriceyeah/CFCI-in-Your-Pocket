from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import CurrentUser
from app.data.db import get_session
from app.schemas.envelope import Envelope, ok
from app.schemas.users import MeUpdate, UserOut
from app.services import users as user_service

router = APIRouter(tags=["me"])

Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("/me", response_model=Envelope[UserOut])
async def get_me(user: CurrentUser, session: Session) -> Envelope[UserOut]:
    return ok(UserOut.from_model(await user_service.get_me(session, user)))


@router.patch("/me", response_model=Envelope[UserOut])
async def update_me(payload: MeUpdate, user: CurrentUser, session: Session) -> Envelope[UserOut]:
    return ok(UserOut.from_model(await user_service.update_me(session, user, payload)))
