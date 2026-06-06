# UbuntuOS Web — Docker Deployment

This directory contains Docker configuration for deploying UbuntuOS Web as a single container.

## Quick Start

### Option 1: Using the Build Script

```bash
# Build the image
./scripts/build.sh

# Build and run
./scripts/build.sh --run
```

### Option 2: Using Docker Compose

```bash
# Copy and customize environment variables
cp .env.docker .env

# Edit .env with your settings (especially JWT_SECRET)

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Using Docker Directly

```bash
# Build the image
docker build -t ubuntuos-web -f Dockerfile.dev ..

# Run the container
docker run -d \
  -p 80:80 \
  -p 3001:3001 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e JWT_SECRET=your-secret-here \
  --name ubuntuos-web \
  ubuntuos-web
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `80` | Port for web interface |
| `BACKEND_PORT` | `3001` | Port for backend API |
| `JWT_SECRET` | (required) | JWT secret for terminal sessions |
| `DOCKER_IMAGE` | `ubuntuos-terminal:latest` | Terminal container image |
| `SESSION_TTL` | `3600` | Session TTL in seconds |
| `GRACE_PERIOD` | `300` | Disconnect grace period in seconds |
| `NODE_ENV` | `production` | Node environment |

## Architecture

The container runs two services via supervisord:

1. **Nginx** (port 80)
   - Serves frontend static files
   - Proxies `/ws` to backend WebSocket
   - Proxies `/auth/` to backend API

2. **Backend** (port 3001)
   - Express server with WebSocket support
   - JWT authentication
   - Docker container management for terminal

## Terminal Feature

The Real Terminal feature requires Docker socket access. Mount the Docker socket:

```bash
-v /var/run/docker.sock:/var/run/docker.sock
```

Without Docker socket, the terminal feature will be disabled but all other apps work.

## Building the Terminal Image

The terminal containers use a custom hardened image. Build it first:

```bash
cd ../backend
npm run docker:build
```

## Health Check

The container includes a health check endpoint:

```bash
curl http://localhost/health
# Returns: OK
```

## Troubleshooting

### Container won't start
- Check logs: `docker logs ubuntuos-web`
- Verify JWT_SECRET is set
- Verify Docker socket is mounted

### Terminal not working
- Ensure Docker socket is mounted
- Ensure `ubuntuos-terminal:latest` image is built
- Check Docker daemon is running

### Build fails
- Ensure Docker has enough memory (2GB+)
- Clear Docker cache: `docker system prune`
