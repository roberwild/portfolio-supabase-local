# Local Development Environment Setup

This repository provides a script for setting up a local development environment with Supabase and AI services. The script handles the configuration and startup of Docker containers for these services.

## Prerequisites

- Python 3.6+
- Docker and Docker Compose
- Git

## Getting Started

1. Clone this repository
2. Create a `.env` file in the root directory with necessary environment variables
3. Run the startup script as described below

## Usage

The `start_services.py` script provides a flexible way to start and manage your development services.

### Basic Usage

To start all services with default settings:

```bash
python start_services.py
```

This will start both Supabase and the local AI services using the CPU profile.

### Command Line Arguments

The script supports the following command line arguments:

#### `--components`

Select which components to start:

- `all`: Start both Supabase and local AI services (default)
- `supabase`: Start only Supabase
- `localai`: Start only local AI services

Example:
```bash
python start_services.py --components supabase
```

#### `--profile`

Select the hardware profile for AI services:

- `cpu`: Use CPU for AI processing (default)
- `gpu-nvidia`: Use NVIDIA GPU for AI processing
- `gpu-amd`: Use AMD GPU for AI processing
- `none`: Don't use any specific hardware profile

Example:
```bash
python start_services.py --profile gpu-nvidia
```

### Combined Examples

Start only Supabase:
```bash
python start_services.py --components supabase
```

Start only local AI services with NVIDIA GPU support:
```bash
python start_services.py --components localai --profile gpu-nvidia
```

Start everything with AMD GPU support:
```bash
python start_services.py --components all --profile gpu-amd
```

## Environment Configuration

The script expects a `.env` file in the root directory, which it will copy to the Supabase docker directory. This file should contain all necessary environment variables for both Supabase and local AI services.

Required variables include:
- `POSTGRES_PASSWORD`
- `N8N_ENCRYPTION_KEY`
- `N8N_USER_MANAGEMENT_JWT_SECRET`

## Services

### Supabase Services

The script will set up the standard Supabase stack, including:
- PostgreSQL database
- PostgREST API
- GoTrue authentication
- Realtime subscriptions
- Storage API

### Local AI Services

The local AI stack includes:
- n8n (workflow automation)
- Ollama (local AI model serving)
- Qdrant (vector database)
- Open-WebUI (web interface for AI models)
- Flowise (visual programming for AI workflows)

## Troubleshooting

If you encounter issues:

1. Make sure Docker Desktop is running
2. Verify all required environment variables are set in your `.env` file
3. Check Docker logs for specific container issues:
   ```bash
   docker logs <container_name>
   ```
4. Try stopping all containers manually before running the script:
   ```bash
   docker compose -p localai down
   ```

## Notes

- All services use the same Docker Compose project name ("localai") so they appear together in Docker Desktop
- The script clones only the necessary parts of the Supabase repository using sparse checkout
- There is a brief pause between starting Supabase and local AI services to allow Supabase to initialize properly
