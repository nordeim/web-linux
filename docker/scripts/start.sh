#!/bin/bash
# =============================================================================
# UbuntuOS Web — Container Start Script
# =============================================================================
# Initializes and starts all services (nginx + backend)
# =============================================================================

set -e

echo "============================================"
echo "  UbuntuOS Web — Starting Container"
echo "============================================"

# ---- Environment Defaults ----
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3001}"
export JWT_SECRET="${JWT_SECRET:-change-me-in-production}"
export DOCKER_IMAGE="${DOCKER_IMAGE:-ubuntuos-terminal:latest}"
export SESSION_TTL="${SESSION_TTL:-3600}"
export GRACE_PERIOD="${GRACE_PERIOD:-300}"

echo "[1/4] Environment configured"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo "  DOCKER_IMAGE: $DOCKER_IMAGE"

# ---- Verify Backend Build ----
if [ ! -d "/app/backend/dist" ]; then
    echo "ERROR: Backend build not found at /app/backend/dist"
    exit 1
fi

echo "[2/4] Backend build verified"

# ---- Verify Frontend Build ----
if [ ! -d "/app/frontend/dist" ]; then
    echo "ERROR: Frontend build not found at /app/frontend/dist"
    exit 1
fi

echo "[3/4] Frontend build verified"

# ---- Check Docker Socket ----
if [ -S "/var/run/docker.sock" ]; then
    echo "  Docker socket detected — terminal containers enabled"
else
    echo "  WARNING: Docker socket not found — terminal feature disabled"
    echo "  Mount with: -v /var/run/docker.sock:/var/run/docker.sock"
fi

# ---- Start Services ----
echo "[4/4] Starting services (nginx + backend)..."

# Function to handle shutdown
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $NGINX_PID $BACKEND_PID 2>/dev/null
    wait $NGINX_PID $BACKEND_PID 2>/dev/null
    echo "Services stopped."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start nginx in background
echo "  Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Start backend in background
echo "  Starting backend..."
cd /app/backend
node dist/index.js &
BACKEND_PID=$!

echo ""
echo "============================================"
echo "  UbuntuOS Web is running!"
echo "============================================"
echo ""
echo "  Web Interface: http://localhost:8080"
echo "  Backend API:   http://localhost:3001"
echo "  Health Check:  http://localhost:8080/health"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Wait for any process to exit
wait -n $NGINX_PID $BACKEND_PID

# Exit with status of process that exited first
exit $?
