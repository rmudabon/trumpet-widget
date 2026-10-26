# Trumpet Widget

A development scaffold with React, TypeScript, Vite, Django REST Framework, PostgreSQL, and Nginx.

## Requirements

- Docker Desktop with the Linux container engine running and Docker Compose v2.
- Port 80 available on your machine.
- Internet access for the first image build and dependency installation.

Node and Python do not need to be installed on the host.

## Quick start

Copy the example environment file from the repository root:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead. Then run:

```sh
docker compose up --build
```

Open **http://localhost**. The page checks the API and database and displays their status. The initial build downloads dependencies; Django waits for PostgreSQL readiness and applies migrations before starting. A brief proxy error during startup can be resolved by refreshing once the servers are ready.

The supplied credentials and Django debug configuration are for local development. This project does not include a production deployment configuration.

## Services and routing

| Service | Internal port | Purpose |
| --- | --- | --- |
| `nginx` | 80 | Only published host port: `http://localhost:80` |
| `frontend` | 5173 | React/Vite development server and hot reload |
| `backend` | 8000 | Django development server and REST API |
| `db` | 5432 | PostgreSQL 17 with persistent storage |

Nginx forwards `/api/` to Django without removing the prefix, redirects `/api` to `/api/`, and forwards other requests and Vite WebSockets to the frontend. Django connects to PostgreSQL at `db:5432`. Browser requests use a relative API URL and the same origin, so CORS configuration is unnecessary.

`GET /api/health/` runs `SELECT 1` against PostgreSQL:

- `200`: `{"status":"ok","database":"ok"}`
- `503` when the query fails: `{"status":"error","database":"unavailable"}`

You can open http://localhost/api/health/ directly or run:

```sh
curl http://localhost/api/health/
```

## Daily development

Source directories are mounted into the containers. Vite uses polling for Windows compatibility; Django reloads Python changes. Frontend dependencies live in a named volume, and Python dependencies live at `/opt/venv`, outside the source mount.

```sh
docker compose logs -f
docker compose logs -f backend
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py shell
```

Commit generated Django migration files. The backend starts with framework migrations but no application data model.

## Dependencies and lockfiles

Dependency downloads were unavailable in the scaffold creation environment, so `frontend/package-lock.json` and `backend/uv.lock` could not be generated. The Dockerfiles support installing from the manifests on the first build and use frozen installs when lockfiles exist. Generate and commit both lockfiles when network access is available:

```sh
docker compose run --rm --no-deps frontend npm install --package-lock-only
docker compose run --rm --no-deps backend uv lock
docker compose build frontend backend
docker compose run --rm --no-deps frontend npm ci
docker compose up -d --force-recreate frontend backend
```

The frontend install refreshes the dependency volume after a rebuild. The backend rebuild refreshes its image's virtual environment. For later dependency changes:

```sh
docker compose exec frontend npm install <package>
docker compose exec backend uv add <package>
docker compose build frontend backend
docker compose up -d --force-recreate frontend backend
```

Use `uv add --dev <package>` for backend development tools. Commit the manifests and lockfiles together. The initial frontend uses React 19, Vite 7, and TypeScript 5.9; the backend uses Python 3.13 and Django 5.2 LTS.

## Checks

### Frontend interaction tests

Vitest runs the React Testing Library suite in jsdom. From `frontend`, run:

```sh
npm test
npm run test:watch
```

Or run the suite in the frontend container after refreshing its dependencies:

```sh
docker compose run --rm --no-deps frontend npm ci
docker compose run --rm --no-deps frontend npm test
```

The tests use real React Query providers, forms, and toast UI, with mocked HTTP responses. They cover fetched widget values, adding widgets (including the first widget), independent edits, saving on blur, save errors that preserve drafts and allow retries, and deleting the intended widget. No running Django or PostgreSQL service is required. Use the Node version in the frontend Docker image; the installed jsdom version requires Node 22.22.2 or newer within Node 22.

### Static checks and backend tests

With services running:

```sh
docker compose config --quiet
docker compose exec backend ruff check .
docker compose exec backend ruff format --check .
docker compose exec backend pytest
docker compose exec backend python manage.py check
docker compose exec frontend npm run build
```

The frontend build includes TypeScript checking. Run `npm run typecheck` in the frontend container for type checking alone. Pytest verifies the health endpoint against PostgreSQL, checks a simulated connection failure without leaking error details, and rejects unsupported methods. The local PostgreSQL user can create the separate pytest database automatically.

To apply Python formatting:

```sh
docker compose exec backend ruff format .
```

Manual integration checks:

1. Edit frontend text and confirm it updates without a full page refresh; inspect the browser's Network panel for a successful Vite WebSocket connection.
2. Edit a Python view and confirm Django reloads.
3. Stop PostgreSQL with `docker compose stop db`, then retry the page's health check and confirm the unavailable state. Restore it with `docker compose start db` and retry.
4. Run `docker compose down` followed by `docker compose up -d`; database data should persist.

Compose configuration was validated during scaffolding. After startup from the host terminal, HTTP checks confirmed that Nginx serves the frontend and Vite source module with `200`, `/api` redirects to `/api/` with `308`, and `/api/health/` returns `200` with both API and database healthy. This agent's restricted environment still denies Docker engine access and dependency downloads, so pytest, Ruff, frontend build, hot reload, and persistence checks remain unverified; run the commands above from a terminal with Docker and network access.

## Shutdown and reset

Stop and remove containers while preserving data:

```sh
docker compose down
```

**The following deletes all local PostgreSQL data and the frontend dependency volume:**

```sh
docker compose down --volumes
docker compose up --build
```

If port 80 is occupied, stop the conflicting service or change the Nginx host mapping in `compose.yaml`. If database credentials are changed after initialization, update the existing PostgreSQL role/database explicitly or reset the database volume; changing `.env` alone does not change an existing database's credentials.

## Repository hygiene

The root `.gitignore` excludes local environment files, secrets, dependencies, Python environments, build output, tool caches, coverage reports, logs, and editor/OS artifacts. `.env.example`, lockfiles, and migrations remain trackable. Each application also has a `.dockerignore` to keep local secrets and generated files out of build contexts.
