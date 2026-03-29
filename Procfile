web: cd backend && alembic upgrade head && uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
worker: cd backend && celery -A tasks.celery_app worker --loglevel=info
