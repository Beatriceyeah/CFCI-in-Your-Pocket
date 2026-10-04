"""Rules for the signed-in user's own profile."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import AuthUser
from app.data import users as user_repo
from app.data.models import User
from app.schemas.users import MeUpdate


async def get_me(session: AsyncSession, user: AuthUser) -> User:
    me = await user_repo.get(session, user.id)
    if me is None:
        raise ApiError("UNAUTHENTICATED", "Signed-in user no longer exists")
    return me


async def update_me(session: AsyncSession, user: AuthUser, payload: MeUpdate) -> User:
    """Directions only set the default gallery filter. Skipping onboarding = onboarded true alone."""
    me = await get_me(session, user)
    changes = payload.model_dump(exclude_unset=True)
    if "interested_directions" in changes:
        me.interested_directions = list(dict.fromkeys(changes["interested_directions"]))
    if "onboarded" in changes:
        me.onboarded = changes["onboarded"]
    return await user_repo.save(session, me)
