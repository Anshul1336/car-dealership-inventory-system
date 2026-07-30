# PROMPTS.md

This document is a curated selection of the actual prompts used while building the Car Dealership Inventory System, across three AI tools: ChatGPT (backend setup/debugging and frontend spec design), v0.dev (frontend generation), and Claude Code (backend↔frontend integration). It's not a full chat transcript — it's the prompts that meaningfully shaped the implementation, pulled from the real conversations.

---

## Part 1 — ChatGPT: backend setup & debugging

Used early on to get the FastAPI/PostgreSQL environment running and, later, to debug a real integration issue once the frontend and backend were both in place.

### Environment setup

```
how to install requirements.txt together and

fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-dotenv
pydantic
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
pytest
pytest-asyncio
httpx
alembic
email-validator

```

### Auth / JWT handling

```
where to put access token?
```
```
how to login as a user using this
```

### Debugging a live 307 redirect

```
help me fix the apis
```

This was a real bug hunt, not a generation request — ChatGPT diagnosed it as two stacked issues:

1. The router was defined as `@router.get("/")`, so the real endpoint was `/api/v1/vehicles/` (trailing slash), but the frontend was calling `/api/v1/vehicles` (no slash) — FastAPI's 307 redirect between the two was silently breaking the request.
2. The frontend was sending `page`/`page_size` query params, but the backend only accepted `skip`/`limit` — a leftover mismatch from the frontend being generated against a different pagination contract than the one the backend actually implemented.

(This turned out to be the same *class* of bug — frontend and backend disagreeing on a contract neither side had actually verified against the other — that showed up again during the later Claude Code integration pass below, just in a different corner of the app.)

---

## Part 2 — ChatGPT: designing the frontend specification

Before generating anything, the frontend was planned out prompt-by-prompt in conversation with ChatGPT — deciding on the UI direction, then locking down behavior for each major piece. A representative subset:

### Initial architecture

```
Build a complete production-ready frontend for a Car Dealership Inventory System.

Use:
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- React Toastify
- Context API
- Lucide React

The backend already exists in FastAPI. Do not change any backend endpoints.

Implement:
- Authentication
- Protected routes
- JWT
- Inventory
- CRUD
- Purchase
- Statistics
- Low Stock

Write clean reusable components. Use responsive design.
```

### UI direction change

The first pass leaned toward a generic admin dashboard — this prompt is where it pivoted to a marketplace feel instead:

```
Design the application similar to a modern car marketplace.

The landing page should immediately display vehicles.

The page should have:
- Top Navigation
- Left Filter Sidebar
- Vehicle Cards
- Responsive Design

Use a modern SaaS appearance. Avoid Bootstrap-looking layouts.
```

### Vehicle detail modal

```
Do not navigate to another page.

Clicking a vehicle card should open a centered modal.
Dark blurred background. Clicking outside closes the modal.

The modal displays: Large Image, Complete Details, Purchase Button, Close Button.
Admins additionally see: Edit, Delete, Restock.
```

### Purchase flow

```
Purchasing should happen inside the modal.

When Purchase is clicked:
- Ask quantity
- Show confirmation dialog
- Call backend
- Update stock
- Show success toast
- Refresh inventory
```

Everything from these and the remaining rounds (login/register modals, filter sidebar behavior, admin dashboard, admin CRUD, UX polish, coding standards) was consolidated into one final specification — preserved in full at [`FRONTEND_IMPLEMENTATION_PROMPT.md`](FRONTEND_IMPLEMENTATION_PROMPT.md) — which is what was actually fed into v0.dev.

### Why v0.dev + a separate coding agent

Asked directly for backend prompts to put in this file, ChatGPT also volunteered the tool split this project ended up using:

> I wouldn't use v0.dev for the entire application. Use it for UI generation (layouts, cards, modals, dashboard). Then use an AI coding agent like Claude Code, Codex, Cursor, or Gemini CLI to integrate the generated UI with your FastAPI backend — those agents are generally much better at wiring up API calls, authentication, routing, and state management than v0.dev, which is primarily focused on UI generation.

That's the actual origin of the v0.dev → Claude Code workflow described in the next two sections.

---

## Part 3 — v0.dev: frontend generation

The full React + Tailwind SPA (Navbar, Sidebar, VehicleCard, VehicleModal, VehicleForm, SearchBar, FilterSidebar, Pagination, StatsCard, DeleteModal, LoadingSpinner, ProtectedRoute, AuthContext, Inventory/Dashboard pages) was generated in one pass from the specification in [`FRONTEND_IMPLEMENTATION_PROMPT.md`](FRONTEND_IMPLEMENTATION_PROMPT.md).

---

## Part 4 — Claude Code: integration

The backend and frontend were each built independently and hadn't actually been run against each other yet by the time this phase started.

### Phase 1 — Analyze

Asked Claude Code to read the kata requirements PDF and the current state of the project (backend + the newly generated frontend) and report what was implemented versus what was still missing, before making any changes.

### Phase 2 — Wire the frontend to the real backend

```
The backend is built and its APIs are working. The frontend was generated
separately with v0.dev. Connect the two together.
```

This surfaced several real contract mismatches:

- No CORS middleware — the browser blocked every request from the dev server outright.
- The login endpoint expected OAuth2 form-encoded data (`username`/`password`), but the frontend was sending JSON.
- Register was missing the backend's required `mobile` field.
- The frontend's category/fuel-type/transmission dropdown values didn't match the backend's enums (e.g. "Truck", "LPG", "CVT" don't exist server-side) and would have failed validation.
- The vehicle form was missing the required `color` field and sent `stock` instead of `quantity`.
- Login only returned a bare JWT with no user info, so the frontend had no way to know if the logged-in user was an admin — added a `GET /auth/me` endpoint.
- The UI already had controls for search, year-range, and in-stock filtering that the backend didn't support yet — added them.

Verified by running the backend test suite after each fix and exercising the full flow (register → login → browse/filter/search → purchase → admin CRUD) in a live browser session.

### Phase 3 — Fix reported bugs

```
Two issues:
1. After purchasing, there's no confirmation beyond a toast — want a proper popup.
2. The page gets stuck and won't scroll after a purchase.
```

Root-caused the scroll issue to the shared `Modal` component: several modal instances (vehicle detail, create, edit, delete-confirm) were each independently toggling `document.body.style.overflow` using a "restore previous value" pattern that re-ran on every parent re-render — which could leave the body locked permanently. Replaced it with a reference-counted lock. Added a proper in-modal purchase-confirmation screen in place of the bare toast.

### Phase 4 — Realistic data

```
Replace the placeholder inventory (Swagger UI's default "string"/$1 rows)
with something realistic.
```

Removed the junk rows plus a duplicate/mis-categorized test entry, and seeded 15 realistic vehicles spanning every category/fuel-type/transmission combination through the actual API.

### Phase 5 — Investigate a reported discrepancy

```
The dashboard's "Total stock" stat doesn't match what I can count on
screen — is it right?
```

Verified `SUM(quantity)` directly against Postgres — the stat was correct. The actual bug it surfaced: the vehicle list endpoint returned a bare array with no total count, so the "N vehicles available" label and pagination only reflected the current page (9 items) rather than the true total. Fixed with an `X-Total-Count` response header.

### Phase 6 — Compliance pass, branding, and docs

```
Change the favicon, verify the project against the kata PDF requirements,
then push to GitHub.
```

Found the favicon was v0.dev's leftover default "V0" wordmark, unrelated to the app — replaced it with a car-themed icon. Checked the project against the kata PDF point-by-point (no incremental TDD evidence in the test commit, missing AI co-author trailers, empty README/PROMPTS.md, no test report). Generated a pytest HTML + coverage report and wrote the README.

---

## AI Usage Summary

- **ChatGPT** — backend environment setup, live debugging of a real API integration bug (307 redirect / pagination param mismatch), and iterative design of the frontend specification later handed to v0.dev.
- **v0.dev** — full frontend SPA generation from that specification.
- **Claude Code** — integration between backend and frontend (surfacing and fixing real contract mismatches — the same class of bug ChatGPT had already hit once on the backend side), bug fixes reported after manual testing, realistic data seeding, a kata-compliance review, and this documentation.

All AI-generated code was reviewed, tested (via the pytest suite and live browser sessions), and manually adjusted before being committed.
