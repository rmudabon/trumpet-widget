# Trumpet Widget

A simple text-widget app built with React, TypeScript, Django REST Framework, and PostgreSQL.

## Run

Requires Docker Desktop with Compose and port 80 available.

```sh
docker compose up --build
```

Open [http://localhost](http://localhost). Nginx serves the frontend and routes `/api/` to Django. PostgreSQL data persists in a Docker volume. To stop the services, run `docker compose down`.

## Features

- Add text widgets at the end of the list or between existing widgets.
- Save edits when a text area loses focus and warn before leaving with unsaved changes.
- Load saved widgets after a refresh.
- Delete widgets while keeping positions in order.
- Show a retry option if widgets cannot be loaded.

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

The tests cover loading, adding, inserting, editing, saving failures, handling fetch errors, and deleting widgets. Backend tests include long text and position changes.

## Approach and Tradeoffs

I approached this project with user experience, developer experience, and simplicity in mind.

### Project Setup

I used Docker to make this project easier to run across all platforms and machines.

### Frontend

I used Zod schemas as API contracts so that they act as the source of truth when it comes to validation and typing.
This approach adds additional maintenance overhead when adding or updating API requests, but I believe it is worth the benefit of data integrity and better developer experience.

For data fetching, I used **TanStack Query** to manage API data fetching and caching.

I chose blur-to-save to send one request after the user leaves a field. The tradeoff is that a draft remains unsaved while the field is focused, so the app warns before leaving.

I used ShadCN as the UI kit and Tailwind CSS to easily set up the design system and accessibility elements.

Reusable UI elements like buttons and text areas keep the interface consistent.

### Testing

Tests focus on critical flows and behavior.
I opted to use integration and component tests.

Frontend component and interaction tests use Vitest and React Testing Library; backend API tests use pytest.

### Backend

Only one application model (`Widget`) is used for this project to keep architecture and functionality simple, testable, and maintainable given the constraints.

I initially considered three database entities for the database design (`Form`, `FormWidget`, `FormWidgetResponse`) to allow flexibility and scalability, but I scaled back to avoid unnecessary complexity.

Each widget is its own database row with a text value and position.

Creating or deleting a widget shifts affected positions with a single database update using Django `F()` expressions, avoiding loading and saving each widget individually in Python. The work still grows with the number of affected rows, which is acceptable for this list.

## Future Features

Given more time:

1. Add browser-based end-to-end tests via Playwright
2. Add a title field to the text widget
3. Support image widgets
4. Add drag-and-drop widget reordering
5. A more extensive token-based design system for custom branding
6. Evolve the database tables to support reusable widgets across forms or different widget lists
7. Improve autosaving behavior via debouncing and syncing save requests
