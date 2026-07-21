#!/bin/bash
# Start Celery with a single worker process to save memory on 512MB instances
celery -A backend.core.celery_app worker --loglevel=info --concurrency=1 &

# Start Uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
