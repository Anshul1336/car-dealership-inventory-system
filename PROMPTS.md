# PROMPTS.md

This document contains the major AI prompts used during the development of the Car Dealership Inventory System — the backend (built phase-by-phase with ChatGPT, one commit per phase), the frontend (generated with v0.dev from a single spec), and the integration pass that connected the two (done with Claude Code).

---

## Part 1 — Backend (ChatGPT)

The backend was planned and built phase-by-phase with ChatGPT, committing after each phase.

### Prompt 1 — Project Setup

```
I am building a Car Dealership Inventory System.

Tech Stack:

- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Alembic
- pytest

Help me create a scalable backend folder structure and install the required dependencies following best practices.
```

### Prompt 2 — Database Design

```
Design a relational database schema for a Car Dealership Inventory System.

Requirements:
- Vehicle inventory
- Authentication
- Admin/User roles
- PostgreSQL
- SQLAlchemy ORM

Generate the SQLAlchemy models with proper relationships and constraints.
```

### Prompt 3 — Authentication

```
Implement JWT Authentication using FastAPI.

Requirements:
- User Registration
- Login
- Password Hashing
- JWT Access Token
- OAuth2PasswordBearer
- Protected Routes

Follow FastAPI best practices.
```

### Prompt 4 — Role-Based Authorization

```
Implement Role-Based Access Control.

Requirements:

Admin:
- Create Vehicle
- Update Vehicle
- Delete Vehicle
- Restock Vehicle
- View Inventory Statistics

User:
- View Vehicles
- Purchase Vehicles

Create reusable dependencies for authentication and authorization.
```

### Prompt 5 — Vehicle CRUD

```
Create complete CRUD APIs for vehicle inventory.

Vehicle should contain:

- Make
- Model
- Year
- Category
- Fuel Type
- Transmission
- Color
- Price
- Quantity

Use SQLAlchemy services and Pydantic schemas.
```

### Prompt 6 — Inventory Features

```
Implement inventory management features.

Requirements:

- Vehicle Purchase
- Vehicle Restock
- Inventory Statistics
- Low Stock Vehicles

Purchase should reduce stock.

Restock should increase stock.

Inventory statistics should return:

- Total Vehicle Models
- Total Stock
- Inventory Value
- Out Of Stock Count
```

### Prompt 7 — Filtering & Pagination

```
Implement inventory listing with:

- Search
- Filtering
- Pagination
- Sorting

Support filtering by:

- Make
- Model
- Category
- Fuel Type
- Transmission
- Price Range

Support sorting by:

- Make
- Model
- Year
- Price
- Quantity
```

### Prompt 8 — API Validation

```
Create Pydantic request and response schemas for all APIs.

Ensure proper validation for:

- Required fields
- Enum values
- Numeric ranges
- Response models
```

### Prompt 9 — Backend Testing

```
Generate pytest test cases for the FastAPI backend.

Cover:

- Authentication
- Vehicle CRUD
- Purchase
- Restock
- Inventory Statistics
- Low Stock APIs

Use SQLite as the test database and override dependencies.
```

### Prompt 10 — Debugging

```
Analyze failing FastAPI backend tests.

Identify the root cause.

Suggest fixes while preserving the existing architecture.

Do not rewrite the project structure unless necessary.
```

### Prompt 11 — API Documentation

```
Review the backend implementation and ensure:

- REST API best practices
- Proper HTTP status codes
- Meaningful error responses
- Consistent request/response models
- Clean code organization
```

---

## Part 2 — Frontend (v0.dev)

The entire React + Tailwind SPA was generated in one pass from a written specification (tech stack, API base URL, endpoint list, roles, page layout, component list, auth flow, UX direction) — preserved in full at [`FRONTEND_IMPLEMENTATION_PROMPT.md`](FRONTEND_IMPLEMENTATION_PROMPT.md). It produced the Navbar, Sidebar, VehicleCard, VehicleModal, VehicleForm, SearchBar, FilterSidebar, Pagination, StatsCard, DeleteModal, LoadingSpinner, ProtectedRoute, AuthContext, and the Inventory/Dashboard pages.

---

## Part 3 — Integration (Claude Code)

The backend and frontend were each built independently by different AI tools from different specs, and hadn't actually been run against each other yet. This phase connected them, working through issues one at a time and committing as each phase closed out.

### Phase 1 — Analyze

Asked Claude Code to read the kata requirements PDF and the current state of the project (backend + the newly generated frontend) and report what was implemented versus what was still missing, before making any changes.

### Phase 2 — Wire the frontend to the real backend

```
The backend is built and its APIs are working. The frontend was generated
separately with v0.dev. Connect the two together.
```

This surfaced several real contract mismatches that had to be fixed rather than just configured:

- No CORS middleware — the browser blocked every request from the dev server outright.
- The login endpoint expected OAuth2 form-encoded data (`username`/`password`), but the frontend was sending JSON.
- Register was missing the backend's required `mobile` field.
- The frontend's category/fuel-type/transmission dropdown values didn't match the backend's enums (e.g. "Truck", "LPG", "CVT" don't exist server-side) and would have failed validation.
- The vehicle form was missing the required `color` field and sent `stock` instead of `quantity`.
- Login only returned a bare JWT with no user info, so the frontend had no way to know if the logged-in user was an admin — added a `GET /auth/me` endpoint.
- The UI already had controls for search, year-range, and in-stock filtering that the backend didn't support yet — added them.

Verified by running the backend test suite after each fix and exercising the full flow (register → login → browse/filter/search → purchase → admin CRUD) in a live browser session. → committed as *"feat: connect backend to frontend"* and *"feat: add frontend SPA"*.

### Phase 3 — Fix reported bugs

```
Two issues:
1. After purchasing, there's no confirmation beyond a toast — want a proper
   popup.
2. The page gets stuck and won't scroll after a purchase.
```

Root-caused the scroll issue to the shared `Modal` component: several modal instances (vehicle detail, create, edit, delete-confirm) were each independently toggling `document.body.style.overflow` using a "restore previous value" pattern that re-ran on every parent re-render — which could leave the body locked permanently. Replaced it with a reference-counted lock. Added a proper in-modal purchase-confirmation screen in place of the bare toast. Verified both live in the browser.

### Phase 4 — Realistic data

```
Replace the placeholder inventory (Swagger UI's default "string"/$1 rows)
with something realistic.
```

Queried the dev database directly, removed the junk rows plus a duplicate/mis-categorized test entry, and seeded 15 realistic vehicles spanning every category/fuel-type/transmission combination through the actual API (so it went through the same validation a real submission would).

### Phase 5 — Investigate a reported discrepancy

```
The dashboard's "Total stock" stat doesn't match what I can count on
screen — is it right?
```

Verified `SUM(quantity)` directly against Postgres — the stat was correct. The actual bug it surfaced: the vehicle list endpoint returned a bare array with no total count, so the "N vehicles available" label and pagination only ever reflected the current page (9 items) rather than the true total, which is why manually counting the visible cards came up short. Fixed by adding an `X-Total-Count` response header on the backend and reading it on the frontend. Re-verified the arithmetic by hand against the live data to confirm.

### Phase 6 — Compliance pass, branding, and docs

```
Change the favicon, verify the project against the kata PDF requirements,
then push to GitHub.
```

Found the favicon was literally v0.dev's leftover default "V0" wordmark, unrelated to the app — replaced it with a car-themed icon and removed the other unused v0.dev boilerplate assets. Checked the project against the kata PDF point-by-point and reported the gaps found (no incremental TDD evidence in the test commit, missing AI co-author trailers, empty README/PROMPTS.md, no test report). Generated a pytest HTML + coverage report, wrote the README (setup instructions, API reference, My AI Usage section), and rewrote this file. → committed as *"docs: fill in README, PROMPTS.md, and add a test report"*.

---

## AI Usage Summary

AI was used as a development assistant throughout, across three tools:

- **ChatGPT** — backend architecture, database design, JWT auth, RBAC, CRUD, inventory features, filtering/pagination, schema validation, test generation, debugging, and a final documentation/best-practices review.
- **v0.dev** — full frontend SPA generation from a written specification.
- **Claude Code** — integration between the two (surfacing and fixing real contract mismatches), bug fixes reported after manual testing, realistic data seeding, a kata-compliance review, and this documentation.

All AI-generated code was reviewed, tested (via the pytest suite and live browser sessions), and manually adjusted before being committed.
