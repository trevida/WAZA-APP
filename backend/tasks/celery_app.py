from celery import Celery
from config import settings
import logging

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    'waza',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    worker_max_tasks_per_child=1000,
)

# Auto-discover tasks
celery_app.autodiscover_tasks(['tasks'])

logger.info("Celery app initialized")
