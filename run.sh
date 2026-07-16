#!/bin/bash
# Start all services

# Start Docker containers (Postgres & Redis)
docker compose up -d

# Start FastAPI backend
source backend/venv/bin/activate
export PYTHONPATH=$PWD

# Start celery worker in background
celery -A backend.core.celery_app worker --loglevel=info &
CELERY_PID=$!

# Start Uvicorn
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
