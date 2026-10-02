# Docker Configuration & Deployment

## Overview

The QST backend uses Docker for containerization and Docker Compose to orchestrate multi-container deployments. This setup includes:
- **Django Web Service**: Python 3.12-based application running on Gunicorn
- **PostgreSQL Database**: PostgreSQL 15 Alpine image for data persistence

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         Docker Compose Environment (qst)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐              ┌─────────────────────┐  │
│  │  Django Web  │              │  PostgreSQL 15      │  │
│  │  (Gunicorn)  │◄────────────►│  (qst_postgres)     │  │
│  │  :8000       │              │  :5432 (→5434)      │  │
│  │ (qst_django) │              │                     │  │
│  └──────────────┘              └─────────────────────┘  │
│                                                           │
│  Volumes:                       Volumes:                 │
│  - Current directory            - postgres_data/        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Docker Compose Services

### 1. Database Service (`db`)
**Image**: `postgres:15-alpine`
**Container Name**: `qst_postgres`

**Configuration**:
- **Port Mapping**: `5434:5432` (external:internal)
- **Persistent Storage**: `postgres_data` volume
- **Environment Variables**:
  - `POSTGRES_DB`: Database name (from `.env`)
  - `POSTGRES_USER`: Database user (from `.env`)
  - `POSTGRES_PASSWORD`: Database password (from `.env`)

**Volume**: The `postgres_data` volume persists database files across container restarts.

### 2. Web Service (`web`)
**Build Context**: Current directory (builds from Dockerfile)
**Container Name**: `qst_django`

**Configuration**:
- **Port Mapping**: `8000:8000` (external:internal)
- **Command**: `gunicorn backdev.wsgi:application --bind 0.0.0.0:8000 --workers 3`
  - Uses 3 worker processes for production workloads
  - Binds to all interfaces on port 8000
- **Volume**: Current directory mounted to `/app` (live code reloading in dev)
- **Dependencies**: Depends on `db` service (waits for database startup)

**Environment Variables**:
- `DB_HOST`: Database hostname (from `.env`)
- `DB_NAME`: Database name (from `.env`)
- `DB_USER`: Database user (from `.env`)
- `DB_PASSWORD`: Database password (from `.env`)
- `DB_PORT`: Database port (hardcoded as 5432, internal)

## Dockerfile Details

**Base Image**: `python:3.12-slim`

**Key Optimizations**:
- `PYTHONDONTWRITEBYTECODE=1`: Prevents Python from creating `.pyc` files
- `PYTHONUNBUFFERED=1`: Ensures console output is not buffered for real-time logging
- Minimal Alpine-based Python image for smaller image size
- Multi-stage optimized dependencies installation

**Build Steps**:
1. Install system dependencies (`gcc`, `libpq-dev`) for PostgreSQL compatibility
2. Install Python dependencies from `requirements.txt`
3. Copy application code into `/app`
4. Make `entrypoint.sh` executable
5. Expose port 8000
6. Set entrypoint script for graceful initialization

**Entrypoint Script** (`entrypoint.sh`):
- Runs database migrations automatically on container startup
- Ensures database schema is up-to-date before starting the application
- Handles graceful shutdown with proper exit codes

## Environment Configuration

Create a `.env` file in the `backdev` directory:

```bash
# Database Configuration
DB_HOST=db
DB_NAME=qst_database
DB_USER=qst_user
DB_PASSWORD=your_secure_password_here
```

**Note**: Replace `your_secure_password_here` with a strong password. For production, use proper secret management tools.

## Getting Started with Docker

### Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 1.29+)

### Build and Run

**1. Build the Docker image**:
```bash
docker-compose build
```

**2. Start the services**:
```bash
docker-compose up -d
```

The `-d` flag runs services in the background (detached mode).

**3. Verify services are running**:
```bash
docker-compose ps
```

Expected output:
```
NAME           COMMAND                  SERVICE   STATUS      PORTS
qst_django     bash /app/entrypoint.sh  web       Up 2 sec    0.0.0.0:8000->8000/tcp
qst_postgres   postgres                 db        Up 3 sec    0.0.0.0:5434->5432/tcp
```

**4. Access the application**:
- Django API: `http://localhost:8000/`
- Database (from host): `localhost:5434`

### Stopping Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers (keep volumes)
docker-compose down

# Stop, remove containers AND volumes (full cleanup)
docker-compose down -v
```

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f web
```

### Execute Commands in Running Container
```bash
# Run Django management commands
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py shell

# Access database directly
docker-compose exec db psql -U qst_user -d qst_database
```

### Rebuild After Code Changes
```bash
# Rebuild the web service image
docker-compose build web

# Restart with new image
docker-compose up -d web
```

### Development Mode

For development with live code reloading:

```bash
# Run in foreground to see logs
docker-compose up
```

The volume mount (`volumes: - .:/app`) enables hot-reloading of Python code changes.

## Database Persistence

- Database files are stored in the `postgres_data` volume
- Data persists across container restarts
- To reset database: `docker-compose down -v` (removes volume)
- To backup: `docker-compose exec db pg_dump -U qst_user qst_database > backup.sql`
- To restore: `cat backup.sql | docker-compose exec -T db psql -U qst_user qst_database`

## Networking

- **Internal Network**: Services communicate via service names (`db`, `web`)
- **Port Forwarding**: 
  - Django: `localhost:8000` → container port 8000
  - PostgreSQL: `localhost:5434` → container port 5432
- Services are automatically discoverable by hostname within the Docker network

## Performance Tuning

### Gunicorn Workers
Currently configured with 3 workers. Adjust based on:
- CPU cores available: typically `2 * cpu_cores + 1`
- Memory constraints
- Expected concurrent requests

Modify in `docker-compose.yml`:
```yaml
command: gunicorn backdev.wsgi:application --bind 0.0.0.0:8000 --workers N
```

### Database Connection Pool
Configure in Django settings for optimized database connections.

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs web

# Verify environment variables
docker-compose config
```

### Port Already in Use
If port 8000 or 5434 is already in use, modify in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Use different host port
```

### Database Connection Failed
1. Verify `DB_HOST=db` in `.env`
2. Ensure database service is running: `docker-compose ps`
3. Check logs: `docker-compose logs db`

### Permission Denied on Linux
If you get permission errors, add your user to docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## Production Considerations

For production deployments:
- Use environment-specific `.env.production`
- Configure reverse proxy (nginx) for Django service
- Implement proper secret management (Docker Secrets, Vault)
- Configure resource limits in `docker-compose.yml`
- Use named volumes for better management
- Implement health checks for services
- Set up monitoring and logging aggregation
- Use multi-stage builds for smaller images
- Consider Kubernetes for orchestration at scale

## Security Notes

- Never commit `.env` files with sensitive information
- Use strong database passwords
- Restrict database access by binding to specific interfaces
- Keep base images updated regularly
- Scan images for vulnerabilities
- Use read-only filesystems where possible
