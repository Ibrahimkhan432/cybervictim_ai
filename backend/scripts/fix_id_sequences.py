"""
One-off repair: attach a sequence-backed DEFAULT to id columns that were
created without one. Safe to re-run — every step is idempotent.

Usage:
    cd backend && source .venv/bin/activate && python scripts/fix_id_sequences.py
"""
import asyncio
import logging
import sys
from pathlib import Path

# Make imports work when run from the backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core.database import db_manager  # noqa: E402
from sqlalchemy import text  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("fix_id_sequences")

TABLES = ["conversations", "messages"]


async def fix() -> None:
    await db_manager.init_db()
    async with db_manager.engine.begin() as conn:
        for table in TABLES:
            seq = f"{table}_id_seq"
            log.info(f"→ {table}: ensuring sequence '{seq}' and DEFAULT nextval(...)")
            await conn.execute(text(f'CREATE SEQUENCE IF NOT EXISTS "{seq}"'))
            await conn.execute(
                text(f'ALTER TABLE "{table}" ALTER COLUMN id SET DEFAULT nextval(\'{seq}\')')
            )
            await conn.execute(text(f'ALTER SEQUENCE "{seq}" OWNED BY "{table}".id'))
            # Advance the sequence past any existing max(id) so new inserts don't collide
            await conn.execute(
                text(
                    f"SELECT setval('{seq}', "
                    f"COALESCE((SELECT MAX(id) FROM \"{table}\"), 0) + 1, false)"
                )
            )
            log.info(f"  ✓ {table}.id is now sequence-backed")
    await db_manager.engine.dispose()
    log.info("Done.")


if __name__ == "__main__":
    asyncio.run(fix())
