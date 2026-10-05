"""Seed sample `live` products into the local dev database for the Browse demo.

The PRD says the MVP demo runs on sample product data and that CFCI approval is simulated by
listing status (docs/prd.md section 4; open item in docs/contract.md). New uploads always start
`pending_review` and there's no approval workflow yet (P2), so without this script Browse has
nothing to show.

This is a standalone dev helper, not an Alembic migration: migrations run against the test
database too (`alembic upgrade head` in CI), and several tests assert exact product `total`
counts, so seed data must stay out of that path. Run this only against your local dev database,
never the test database.

Usage (after `docker compose up`, from the repo root):
    DATABASE_URL=postgresql+asyncpg://app:app@localhost:5432/app python scripts/seed_sample_products.py

Safe to re-run: inserts are skipped if a product with the same id already exists.
"""

import asyncio
import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://app:app@localhost:5432/app")

SAMPLE_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4"

# Fixed ids so the script is idempotent. Each sample product gets its own placeholder owner
# account, since a user can own at most one product; these owners are never used to sign in.
SAMPLES = [
    {
        "owner_id": "00000000-0000-0000-0000-00000000a001",
        "owner_name": "Sample Owner — Loom",
        "owner_email": "seed.loom@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b001",
        "name": "Loom",
        "one_liner": "Clinical trial matching in minutes",
        "category": "health",
        "brief": (
            "Loom matches patients to open clinical trials using their existing medical records, "
            "cutting the search from weeks to minutes. Built by a team of Duke BME and CS students "
            "working with Duke Health researchers."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a002",
        "owner_name": "Sample Owner — VitalSign",
        "owner_email": "seed.vitalsign@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b002",
        "name": "VitalSign",
        "one_liner": "A $20 wearable vitals monitor for rural clinics",
        "category": "health",
        "brief": (
            "VitalSign is an open-hardware wristband that tracks heart rate, SpO2 and temperature "
            "and syncs over SMS where there's no reliable internet, designed with rural clinics in "
            "mind."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a003",
        "owner_name": "Sample Owner — CircuitSight",
        "owner_email": "seed.circuitsight@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b003",
        "name": "CircuitSight",
        "one_liner": "AI-powered PCB defect detection on a $40 camera rig",
        "category": "hardware",
        "brief": (
            "CircuitSight pairs a low-cost camera rig with an on-device vision model to catch "
            "solder defects on student and small-batch PCB runs before they ever reach a bench."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a004",
        "owner_name": "Sample Owner — Aether",
        "owner_email": "seed.aether@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b004",
        "name": "Aether",
        "one_liner": "Open-source flight controller for student rocketry",
        "category": "hardware",
        "brief": (
            "Aether is a flight controller board and firmware stack built for university rocketry "
            "teams, with redundant sensors and a telemetry radio tuned for high-altitude recovery."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a005",
        "owner_name": "Sample Owner — StudyBuddy",
        "owner_email": "seed.studybuddy@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b005",
        "name": "StudyBuddy",
        "one_liner": "Peer tutoring marketplace for Duke students",
        "category": "software",
        "brief": (
            "StudyBuddy connects students who've aced a course with students taking it now, with "
            "scheduling, light payments and course-specific session notes built in."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a006",
        "owner_name": "Sample Owner — Pulse",
        "owner_email": "seed.pulse@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b006",
        "name": "Pulse",
        "one_liner": "Real-time study-group matching for Duke courses",
        "category": "software",
        "brief": (
            "Pulse groups students in the same course section by availability and study style, "
            "then spins up a shared space automatically before every exam period."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a007",
        "owner_name": "Sample Owner — Helix",
        "owner_email": "seed.helix@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b007",
        "name": "Helix",
        "one_liner": "Turns lab notebooks into searchable datasets",
        "category": "research",
        "brief": (
            "Helix OCRs and structures handwritten and digital lab notebooks into a searchable, "
            "versioned dataset so labs stop losing results to someone's old notebook."
        ),
    },
    {
        "owner_id": "00000000-0000-0000-0000-00000000a008",
        "owner_name": "Sample Owner — GreenGrid",
        "owner_email": "seed.greengrid@sample.cfci.app",
        "product_id": "00000000-0000-0000-0000-00000000b008",
        "name": "GreenGrid",
        "one_liner": "Campus energy-use dashboards for sustainability teams",
        "category": "research",
        "brief": (
            "GreenGrid pulls building-level energy meter data into a single dashboard so campus "
            "sustainability teams can spot waste and track the impact of retrofits over time."
        ),
    },
]

INSERT_USER = text(
    """
    INSERT INTO users (id, name, email, auth_provider, role)
    VALUES (:id, :name, :email, 'duke_netid', 'student')
    ON CONFLICT (id) DO NOTHING
    """
)

INSERT_PRODUCT = text(
    """
    INSERT INTO products
        (id, owner_id, name, one_liner, cover_image_url, demo_video_url, brief, category, status)
    VALUES
        (:id, :owner_id, :name, :one_liner, :cover_image_url, :demo_video_url, :brief, :category, 'live')
    ON CONFLICT (id) DO NOTHING
    """
)


async def main() -> None:
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        for sample in SAMPLES:
            await conn.execute(
                INSERT_USER,
                {"id": sample["owner_id"], "name": sample["owner_name"], "email": sample["owner_email"]},
            )
            await conn.execute(
                INSERT_PRODUCT,
                {
                    "id": sample["product_id"],
                    "owner_id": sample["owner_id"],
                    "name": sample["name"],
                    "one_liner": sample["one_liner"],
                    "cover_image_url": f"https://picsum.photos/seed/{sample['name'].lower()}/800/600",
                    "demo_video_url": SAMPLE_VIDEO_URL,
                    "brief": sample["brief"],
                    "category": sample["category"],
                },
            )
    await engine.dispose()
    print(f"Seeded {len(SAMPLES)} sample products (existing rows left untouched).")


if __name__ == "__main__":
    asyncio.run(main())
