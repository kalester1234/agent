#!/bin/bash
# Start all services

# Activate the correct virtual environment
source .venv/bin/activate
# Ensure the project root is in PYTHONPATH for package imports
export PYTHONPATH=$PWD

# Start Docker containers (Postgres & Redis)
# Note: Docker Compose file should be at project root
docker compose up -d

# Start Celery worker in background
celery -A backend.core.celery_app worker --loglevel=info &
CELERY_PID=$!

# Start Uvicorn (FastAPI backend)
uvicorn backend.main:app --reload --port 8000 &
UVICORN_PID=$!

# Start Next.js frontend
cd frontend
npm run dev &
NEXT_PID=$!
cd ..

echo "All services started."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000/docs"
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill background processes
trap "kill $CELERY_PID $UVICORN_PID $NEXT_PID; exit" INT
wait
