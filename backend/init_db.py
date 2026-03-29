#!/usr/bin/env python3
"""Initialize database tables directly using SQLAlchemy.
Fallback if Alembic migrations fail on Railway.
Usage: python init_db.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import engine, Base
import models  # noqa: F401 - registers all models with Base

def init_database():
    print("=== WAZA Database Initialization ===")
    print(f"Database URL: {os.getenv('DATABASE_URL', 'using default')[:50]}...")
    try:
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully!")
        
        # Stamp alembic to mark migration as done
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config("alembic.ini")
        alembic_cfg.set_main_option("sqlalchemy.url", str(engine.url))
        command.stamp(alembic_cfg, "head")
        print("Alembic stamped to head")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
