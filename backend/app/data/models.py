"""SQLAlchemy models. Import every model here so Alembic autogenerate sees it.

Models are added module by module (see AGENTS.md, "Data models").
"""

from app.data.db import Base

__all__ = ["Base"]
