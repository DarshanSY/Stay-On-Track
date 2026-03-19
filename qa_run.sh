#!/bin/bash

BACKEND_LOG="qa_artifacts/backend.log"
FRONTEND_LOG="qa_artifacts/frontend.log"
BACKEND_TEST_LOG="qa_artifacts/backend_tests.log"

echo "Killing ports 5000 and 3000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Starting Backend..."
python backend/app.py > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "Starting Frontend..."
cd frontend
npm run dev > "../$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

wait_for_url() {
    local url=$1
    local retries=30
    for ((i=0; i<retries; i++)); do
        if curl -s -f -o /dev/null "$url"; then
            return 0
        fi
        sleep 1
    done
    return 1
}

echo "Waiting for Backend..."
if ! wait_for_url "http://localhost:5000/api/health"; then
    echo "Backend not ready. checking root..."
    if ! wait_for_url "http://localhost:5000"; then
        echo "Backend failed to start."
    fi
fi

echo "Waiting for Frontend..."
if ! wait_for_url "http://localhost:3000"; then
    echo "Frontend failed to start."
fi

echo "Running Backend Tests..."
export PYTHONPATH=backend
python -m pytest backend/tests/test_api.py --junitxml=qa_artifacts/pytest-report.xml | tee "$BACKEND_TEST_LOG"

echo "Running Frontend Tests..."
cd frontend
npx playwright test
cd ..

echo "Cleaning up..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
# Extra cleanup
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Done."
