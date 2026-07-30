# FRONTEND_IMPLEMENTATION_PROMPT.md

## Car Dealership Inventory System -- Frontend Specification for v0.dev

Build a complete production-ready frontend for an existing FastAPI
backend.

### Tech Stack

-   React (Vite)
-   Tailwind CSS v4
-   React Router DOM
-   Axios
-   React Hook Form
-   React Toastify
-   Lucide React
-   Context API

Do NOT use Redux, Bootstrap, Material UI, Chakra, Ant Design.

### API Base URL

VITE_API_URL=http://localhost:8000/api/v1

### Endpoints

POST /auth/register POST /auth/login GET /vehicles GET /vehicles/{id}
POST /vehicles PUT /vehicles/{id} DELETE /vehicles/{id} POST
/vehicles/{id}/purchase POST /vehicles/{id}/restock GET /vehicles/stats
GET /vehicles/low-stock

### Roles

User: - Register/Login - Browse inventory - Search/filter/sort -
Purchase

Admin: - CRUD vehicles - Restock - Statistics - Low stock

### Layout

Navbar with logo, search, login/register. Left sticky filter sidebar.
Right responsive vehicle cards. 3 cards desktop, 2 laptop, 1 mobile.

### Vehicle Card

Horizontal. Image left. Details right: Make, Model, Year, Category,
Fuel, Transmission, Price, Stock.

### Vehicle Modal

Clicking a card opens a centered modal with dark overlay. Click outside
closes it. Contains large image, full details and purchase button.
Admins also see Edit/Delete/Restock.

### Login/Register

Centered modal. Blur background. React Hook Form. Toast notifications.

### Dashboard

Stats cards: - Total Models - Total Stock - Inventory Value - Out of
Stock

Recent vehicles. Quick actions.

### Components

Navbar Sidebar VehicleCard VehicleModal VehicleForm SearchBar
FilterSidebar Pagination StatsCard DeleteModal LoadingSpinner
ProtectedRoute

### Authentication

JWT stored in localStorage. Axios interceptor. Protected routes.
Role-based rendering.

### UX

Modern SaaS design. Tailwind only. Rounded cards. Soft shadows. Blue
primary. Gray background. Responsive. Smooth transitions. No full-page
reloads.

### Deliverable

The project must run with: npm install npm run dev
