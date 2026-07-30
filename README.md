# AutoStock — Car Dealership Inventory System

A full-stack dealership inventory system: a FastAPI + PostgreSQL backend and a React + Tailwind single-page frontend, with JWT authentication, role-based access control (admin vs. regular user), vehicle CRUD, search/filtering/sorting, purchasing, and restocking.

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Setup & running locally](#setup--running-locally)
- [API reference](#api-reference)
- [Screenshots](#screenshots)
- [Test report](#test-report)
- [My AI Usage](#my-ai-usage)

## Tech stack

**Backend**
- Python, FastAPI
- PostgreSQL + SQLAlchemy ORM
- Alembic migrations
- JWT auth (`python-jose`) + `passlib`/`bcrypt` password hashing
- Pytest + `httpx` test client

**Frontend**
- React (Vite)
- Tailwind CSS v4
- React Router DOM
- Axios
- React Hook Form
- React Toastify
- Lucide React icons
- Context API for auth state

## Features

- Register / login with JWT, role-aware session (admin vs. regular user)
- Browse, search, filter (category, fuel type, transmission, price range, year range, in-stock only) and sort the inventory
- Purchase a vehicle (disabled once stock hits zero), with a purchase-confirmation screen
- Admin: create, edit, delete, and restock vehicles; dashboard with live stats (total models, total stock, inventory value, out-of-stock count), recent listings, and low-stock alerts

## Project structure

```
Car_Dealership_Inventory_System/
├── backend/            FastAPI app (auth + vehicles modules, Alembic migrations, tests)
├── frontend/            React + Vite SPA
├── test-report/         Generated test report (see below)
└── README.md
```

## Setup & running locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- A running PostgreSQL instance

### Backend

```bash
cd backend
python -m venv ../.venv
../.venv/Scripts/activate        # Windows; use `source ../.venv/bin/activate` on macOS/Linux
pip install -r requirements.txt

# Create backend/.env — see backend/.env.example-style keys below
```

`backend/.env`:
```
APP_NAME=Car Dealership Inventory System
APP_VERSION=1.0.0
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/car_dealership
SECRET_KEY=<a-long-random-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

```bash
# Create the database schema
alembic upgrade head

# Run the API (http://localhost:8000, docs at /docs)
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

```bash
npm run dev   # http://localhost:3000 (or the next free port)
```

### Running the backend tests

```bash
cd backend
pytest
```

See [`test-report/TEST_REPORT.md`](test-report/TEST_REPORT.md) for the latest results and coverage.

## API reference

Base URL: `/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Log in, returns a JWT (OAuth2 form: `username`=email, `password`) |
| GET | `/auth/me` | Bearer | Current user's profile (incl. `is_admin`) |
| GET | `/vehicles` | — | List vehicles — supports `make`, `model`, `category`, `fuel_type`, `transmission`, `year`, `min_price`, `max_price`, `search`, `min_year`, `max_year`, `in_stock`, `sort_by`, `order`, `skip`, `limit`; returns the true total count across all pages in the `X-Total-Count` response header |
| GET | `/vehicles/{id}` | — | Get one vehicle |
| POST | `/vehicles` | Admin | Create a vehicle |
| PUT | `/vehicles/{id}` | Admin | Update a vehicle |
| DELETE | `/vehicles/{id}` | Admin | Delete a vehicle |
| POST | `/vehicles/{id}/purchase` | Bearer | Purchase (decrements stock) |
| POST | `/vehicles/{id}/restock` | Admin | Restock (increments stock) |
| GET | `/vehicles/stats` | Admin | Aggregate inventory stats |
| GET | `/vehicles/low-stock` | Admin | Vehicles at/under a stock threshold |

Full interactive docs at `http://localhost:8000/docs` once the backend is running.

## Screenshots

> Add screenshots of the running app here (Inventory page, vehicle detail modal, admin dashboard, login/register). Drop image files into `docs/screenshots/` and reference them below, e.g.:
>
> `![Inventory](docs/screenshots/inventory.png)`

## Test report

- 17/17 backend tests passing, 88% statement coverage.
- Full report: [`test-report/TEST_REPORT.md`](test-report/TEST_REPORT.md) and [`test-report/backend-test-report.html`](test-report/backend-test-report.html).

## My AI Usage

This project was built with AI assistance at every stage, used transparently and reviewed at each step rather than accepted blindly.

**Backend (initial build) — ChatGPT.** The FastAPI backend (auth module, vehicle module, JWT security, SQLAlchemy models, Alembic migrations, and the initial pytest suite) was built with ChatGPT assisting on endpoint design, SQLAlchemy/Pydantic schema structure, and debugging.

**Frontend (initial build) — v0.dev.** The entire React + Tailwind SPA (components, pages, layout, routing, forms) was generated with v0.dev from a detailed frontend specification, then handed off for backend integration.

**Integration, bug-fixing, and polish — Claude Code (Anthropic), this session.** The backend and v0-generated frontend were built independently and didn't actually talk to each other correctly out of the box. Claude Code was used to:
- Diagnose and fix real contract mismatches between the two: missing CORS middleware, a login endpoint that expected OAuth2 form-encoded data while the frontend sent JSON, a register form missing the backend's required `mobile` field, frontend dropdown values (categories/fuel types/transmissions) that didn't match the backend's enums and would have caused validation errors, a required `color` field missing from the vehicle form entirely, and no way for the frontend to learn a logged-in user's admin status (added a `GET /auth/me` endpoint).
- Extend the backend's list endpoint with `search`, year-range, and in-stock filters the UI already exposed but the API didn't support, plus a `created_at` sort option.
- Fix a body-scroll-lock bug in the shared `Modal` component (multiple modals independently toggling `document.body.style.overflow` could leave the page permanently unscrollable) by replacing it with a reference-counted lock.
- Add a proper purchase-confirmation screen instead of a bare toast.
- Fix a pagination bug where the vehicle count shown ("N vehicles available") only reflected the current page instead of the true total, by adding an `X-Total-Count` response header.
- Replace leftover v0.dev boilerplate assets (a generic "V0" wordmark favicon, unused placeholder logo files) with a car-themed favicon.
- Clean up and replace placeholder test data (Swagger UI default "string"/$1 rows) with a realistic seeded inventory.
- Verify the finished project against the kata's requirements PDF, run and report on the backend test suite, and write this README and `PROMPTS.md`.

**Reflection.** AI made it realistic to build a working full-stack app end-to-end quickly — but the backend and frontend, each built independently by different AI tools from different specs, did not actually integrate cleanly on the first try. The most valuable part of the AI-assisted workflow here wasn't code generation, it was the systematic pass of *reading both sides of the contract* (Pydantic schemas vs. what the UI actually sent, enum values, auth flow shape) and fixing the mismatches with real verification (running the test suite, exercising the app in a live browser session) rather than assuming generated code was correct.
