#!/bin/bash
# Start all services

# Activate the correct virtual environment
source .venv/bin/activate
export PYTHONPATH=$PWD

# Start Docker containers (Postgres & Redis)
docker compose up -d

echo "Cleaning up any old processes..."
lsof -ti:8000,3000 | xargs kill -9 2>/dev/null || true
sleep 1


# We pipe outputs through awk to prefix them and disable Next.js TTY clearing
celery -A backend.core.celery_app worker --loglevel=info 2>&1 | awk '{print "\033[34m[CELERY]\033[0m " $0}' &
CELERY_PID=$!

uvicorn backend.main:app --reload --port 8000 2>&1 | awk '{print "\033[32m[UVICORN]\033[0m " $0}' &
UVICORN_PID=$!

cd frontend
npm run dev 2>&1 | awk '{print "\033[35m[NEXTJS]\033[0m " $0}' &
NEXT_PID=$!
cd ..

echo "All services started."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000/docs"
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill all child processes
trap "kill 0" INT
wait
