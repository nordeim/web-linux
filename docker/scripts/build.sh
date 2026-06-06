#!/bin/sh
# =============================================================================
# UbuntuOS Web — Docker Build Script
# =============================================================================
# Builds the Docker image and optionally runs it
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DOCKER_DIR")"

IMAGE_NAME="ubuntuos-web"
IMAGE_TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

echo "============================================"
echo "  UbuntuOS Web — Docker Build"
echo "============================================"
echo ""
echo "  Project Root: $PROJECT_ROOT"
echo "  Docker Dir:   $DOCKER_DIR"
echo "  Image:        $FULL_IMAGE"
echo ""

# ---- Build Image ----
echo "[1/2] Building Docker image..."
cd "$PROJECT_ROOT"
docker build -t "$FULL_IMAGE" -f docker/Dockerfile.dev .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "  Image: $FULL_IMAGE"
    echo "  Size:  $(docker image inspect "$FULL_IMAGE" --format='{{.Size}}' | numfmt --to=iec-i 2>/dev/null || echo 'unknown')"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

# ---- Optional: Run Container ----
if [ "$1" = "--run" ]; then
    echo ""
    echo "[2/2] Starting container..."
    echo ""
    echo "  Web Interface: http://localhost:80"
    echo "  Backend API:   http://localhost:3001"
    echo "  Press Ctrl+C to stop"
    echo ""
    
    docker run -it --rm \
        -p 80:80 \
        -p 3001:3001 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -e JWT_SECRET="dev-secret-change-in-production" \
        "$FULL_IMAGE"
else
    echo ""
    echo "[2/2] To run the container:"
    echo ""
    echo "  # Using docker run:"
    echo "  docker run -d \\"
    echo "    -p 80:80 \\"
    echo "    -p 3001:3001 \\"
    echo "    -v /var/run/docker.sock:/var/run/docker.sock \\"
    echo "    -e JWT_SECRET=your-secret-here \\"
    echo "    $FULL_IMAGE"
    echo ""
    echo "  # Or using docker-compose:"
    echo "  cd docker && docker-compose up -d"
fi

echo ""
echo "============================================"
