import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context

print("=== Alembic env.py starting ===")

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)
print(f"Backend dir: {backend_dir}")

# Load .env if available
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(backend_dir, ".env"))
except ImportError:
    pass

# Get DATABASE_URL from env
database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/waza_db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
print(f"Database URL: {database_url[:40]}...")

# Alembic config
config = context.config
config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import models — use Base directly from declarative_base, NOT from database.py
# This avoids triggering Redis connection during migrations
from sqlalchemy.ext.declarative import declarative_base

try:
    # Import Base and all models so metadata is populated
    from database import Base
    import models  # noqa: F401
    target_metadata = Base.metadata
    print(f"Models imported OK. Tables: {list(target_metadata.tables.keys())}")
except Exception as e:
    print(f"Models import failed: {e}")
    import traceback
    traceback.print_exc()
    raise


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args={"connect_timeout": 10},
    )
    print("Connecting to database for migration...")
    with connectable.connect() as connection:
        print("Connected. Running migrations...")
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()
    print("=== Migrations complete ===")


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
