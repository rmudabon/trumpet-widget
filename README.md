# Trumpet Widget

A simple text-widget app built with React, TypeScript, Django REST Framework, and PostgreSQL.

## Run

Requires Docker Desktop with Compose and port 80 available.

```sh
docker compose up --build
```

Open [http://localhost](http://localhost). Nginx serves the frontend and routes `/api/` to Django. PostgreSQL data persists in a Docker volume. To stop the services, run `docker compose down`.

## Tests

With the services running, run the backend tests and checks:

```sh
docker compose exec backend pytest
docker compose exec backend ruff check .
docker compose exec backend ruff format --check .
```

Run the React Testing Library suite in the frontend container:

```sh
docker compose exec frontend npm run test
```

The tests cover loading, adding, inserting, editing, saving failures, and deleting widgets. Backend tests include long text and position changes.

## Approach

Each widget is its own database row with a text value and position. React renders a separate form for every row and saves edits when its text area loses focus. On page load, the frontend fetches the saved widgets from the API. PostgreSQL's `TextField` supports long text without a small application-level length limit.

Creating or deleting a widget shifts affected positions with a single database update using Django `F()` expressions. This avoids loading and saving each affected widget individually. The update work still grows with the number of shifted rows, which is a good tradeoff for this small ordered list.

Reusable buttons and text areas keep the UI consistent.

With more time, I would add browser-based end-to-end tests and evaluate autosaving drafts so edits do not depend on blur.
