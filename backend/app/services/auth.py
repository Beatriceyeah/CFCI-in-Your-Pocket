"""MVP mock sign-in. Real OAuth replaces this file and routes/auth.py only (see AGENTS.md)."""

from dataclasses import dataclass

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.data import users as user_repo
from app.data.models import User


@dataclass(frozen=True)
class DemoAccount:
    name: str
    email: str
    role: str


# One demo account per sign-in button. Duke NetID → student path; LinkedIn/Google → external path.
DEMO_ACCOUNTS = {
    "duke_netid": DemoAccount(name="Demo Student", email="demo.student@duke.edu", role="student"),
    "linkedin": DemoAccount(name="Demo Investor", email="demo.investor@example.com", role="external"),
    "google": DemoAccount(name="Demo Alum", email="demo.alum@example.com", role="external"),
}


async def demo_login(session: AsyncSession, provider: str) -> tuple[str, User]:
    """Sign in as the demo account for this provider, creating it on first use."""
    user = await _get_or_create_demo_user(session, provider)
    return create_access_token(user.id, user.role), user


async def _get_or_create_demo_user(session: AsyncSession, provider: str) -> User:
    account = DEMO_ACCOUNTS[provider]
    user = await user_repo.get_by_email(session, account.email)
    if user is not None:
        return user
    try:
        return await user_repo.add(
            session, User(name=account.name, email=account.email, auth_provider=provider, role=account.role)
        )
    except IntegrityError:
        # Two first-time sign-ins raced; the other one created the account.
        await session.rollback()
        user = await user_repo.get_by_email(session, account.email)
        assert user is not None, "demo user missing after unique violation"
        return user
