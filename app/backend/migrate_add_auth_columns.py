"""
Migration script to add missing authentication columns to users table
Run this once to upgrade the schema
"""
import asyncio
import logging
from core.database import db_manager
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def migrate_add_auth_columns():
    """Add missing authentication columns to users table"""
    await db_manager.init_db()

    async with db_manager.async_session_maker() as session:
        try:
            # Check if password_hash column exists
            result = await session.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash'")
            )
            if not result.fetchone():
                logger.info("Adding password_hash column...")
                await session.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL"))
                logger.info("✅ password_hash column added")

            # Check if is_active column exists
            result = await session.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='is_active'")
            )
            if not result.fetchone():
                logger.info("Adding is_active column...")
                await session.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true"))
                logger.info("✅ is_active column added")

            # Check if language_preference column exists
            result = await session.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='language_preference'")
            )
            if not result.fetchone():
                logger.info("Adding language_preference column...")
                await session.execute(text("ALTER TABLE users ADD COLUMN language_preference VARCHAR(10) DEFAULT 'english'"))
                logger.info("✅ language_preference column added")

            # Check if last_login_at column exists
            result = await session.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at'")
            )
            if not result.fetchone():
                logger.info("Adding last_login_at column...")
                await session.execute(text("ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE NULL"))
                logger.info("✅ last_login_at column added")

            await session.commit()
            logger.info("✅ All migrations completed successfully!")

        except Exception as e:
            logger.error(f"Migration failed: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(migrate_add_auth_columns())
