"""Sample data for the MVP demo (made up; no real student products).

Run from backend/: `python -m app.data.seed`. Safe to run again: existing sample owners are skipped.
"""

import asyncio

from app.data.db import get_sessionmaker
from app.data.models import Product, User
from app.data.users import get_by_email

VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

SAMPLES = [
    ("Team Loom", "Loom", "Clinical trial matching in minutes", "health"),
    ("Team Pulse", "Pulse", "Wearable that flags heat stress for outdoor workers", "hardware"),
    ("Team Shelf", "Shelf", "Course-material swap marketplace for Duke students", "software"),
    ("Team Atlas", "Atlas", "Open dataset of Durham air quality, block by block", "research"),
    ("Team Sprout", "Sprout", "Low-cost soil sensor for community gardens", "hardware"),
    ("Team Cadence", "Cadence", "AI study planner that adapts to your syllabus", "software"),
    ("Team Mend", "Mend", "Peer-support app for student-athlete injury recovery", "health"),
    ("Team Lumen", "Lumen", "Microscopy image labeling tool for biology labs", "research"),
]


async def seed() -> int:
    created = 0
    async with get_sessionmaker()() as session:
        for team, name, one_liner, category in SAMPLES:
            email = f"sample.{name.lower()}@duke.edu"
            if await get_by_email(session, email) is not None:
                continue
            owner = User(name=team, email=email, auth_provider="duke_netid", role="student", onboarded=True)
            session.add(owner)
            await session.flush()
            session.add(
                Product(
                    owner_id=owner.id,
                    name=name,
                    one_liner=one_liner,
                    cover_image_url=f"https://picsum.photos/seed/{name.lower()}/800/600",
                    demo_video_url=VIDEO,
                    brief=f"{name}: {one_liner}. Sample product for the CFCI in Your Pocket demo.",
                    category=category,
                    status="live",
                )
            )
            created += 1
        await session.commit()
    return created


if __name__ == "__main__":
    print(f"Created {asyncio.run(seed())} sample products")
