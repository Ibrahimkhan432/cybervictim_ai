"""
One-off: drop the `conversations` and `messages` tables in Neon and let
SQLAlchemy recreate them properly (with INTEGER SERIAL primary keys) on
the next backend startup.

WARNING: destroys any existing rows in those two tables. `users` is NOT
touched, so accounts remain intact.

Usage:
    cd backend && source .venv/bin/activate && python scripts/reset_chat_tables.py
"""
import asyncio
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core.database import Base, db_manager  # noqa: E402
# Import model modules so their tables register on Base.metadata
import models.conversations  # noqa: F401,E402
import models.messages  # noqa: F401,E402
from sqlalchemy import text  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("reset_chat_tables")

TABLES = ["messages", "conversations"]  # messages first (FK order)


async def main() -> None:
    await db_manager.init_db()
    async with db_manager.engine.begin() as conn:
        for t in TABLES:
            log.info(f"DROP TABLE IF EXISTS {t}")
            await conn.execute(text(f'DROP TABLE IF EXISTS "{t}" CASCADE'))
            # Sequences may or may not exist; drop just in case
            await conn.execute(text(f'DROP SEQUENCE IF EXISTS "{t}_id_seq" CASCADE'))

        log.info("Recreating from SQLAlchemy models...")
        # Only recreate the two tables we dropped
        target_tables = [Base.metadata.tables[t] for t in TABLES if t in Base.metadata.tables]
        await conn.run_sync(lambda sync_conn: Base.metadata.create_all(sync_conn, tables=target_tables))

    await db_manager.engine.dispose()
    log.info("Done. Restart the backend and try again.")


if __name__ == "__main__":
    asyncio.run(main())
