# Frontend Admin Panel — React Requirements

## Overview

This document defines the full scope, pages, components, API integration, and UX
behaviour for the **React Admin Panel** of the Barber Shop Management System.

The project already has a base React setup with:
- Login page (done)
- Dashboard route shell (done)

Everything else described in this document needs to be built.

---

## Tech Stack & Conventions

| Concern | Choice |
|---|---|
| Framework | React (existing project) |
| Routing | React Router v6 |
| State / Server cache | React Query (TanStack Query) |
| HTTP client | Axios with a shared instance |
| Forms | React Hook Form + Zod validation |
| UI components | Shadcn/ui (or Radix primitives) |
| Calendar | FullCalendar (React wrapper) |
| Charts | Recharts |
| Date/time | date-fns |
| Notifications | Toast (e.g. react-hot-toast) |
| Auth | JWT stored in httpOnly cookie or localStorage with refresh logic |

All API calls go through a single Axios instance that:
- Attaches the Bearer token automatically
- Redirects to `/login` on 401
- Shows a toast on unhandled errors

Base URL: `/api/v1`

---

## Auth & Route Guards

### Admin Login (`/login`)
_Already exists — verify it calls `POST /auth/admin/login`._

### Protected Layout
Every route inside the admin panel must be wrapped in an `<AdminLayout>` component
that:
- Verifies the user is authenticated (`GET /auth/me`)
- Verifies `role === 'admin'`
- Renders the sidebar + topbar shell
- Redirects to `/login` if not authenticated

### Logout
- Button in the top bar / user menu
- Calls `POST /auth/logout`
- Clears token and redirects to `/login`

---

## Global Layout

### Sidebar
Fixed left sidebar with navigation links grouped as:

```
Overview
  Dashboard

Appointments
  Calendar
  Waiting List

People
  Customers
  Barbers

Shop
  Services
  Shops

Inventory
  Products
  Stock

Settings
  General & Hours
  Holidays
  Vacations

[User menu / Logout]
```

Active link is highlighted. Sidebar collapses to icon-only on smaller screens.

### Topbar

Left side:
- Page title (dynamic)

Centre / prominent:
- **Shop Dropdown** (see full spec below)

Right side:
- Global search (optional — phase 2)
- Notification bell (optional — phase 2)
- User avatar + dropdown (profile info, logout)

---

## Global Shop Context

### Shop Dropdown (Topbar)

The shop selector is the **primary data scope control** for the entire admin
panel. It lives in the topbar and is always visible on every protected page.

**Behaviour on first load:**
1. Fetch all shops via `GET /shops` (public endpoint, no auth needed) or
   `GET /admin/shops`.
2. If the admin has a previously selected shop stored in `localStorage`
   (`selectedShopId`), restore that selection.
3. Otherwise auto-select the **first active shop** in the list.
4. Never leave the selection empty — there must always be one shop active.

**Dropdown UI:**
- Shows the current shop name + a small map-pin / building icon.
- Opens a list of all shops (active ones only, or all with a dimmed inactive
  state — decide in implementation).
- Selecting a different shop:
    - Updates the global `ShopContext` value.
    - Persists the choice to `localStorage`.
    - Triggers a re-fetch of all shop-scoped data (React Query keys include
      `shopId`, so changing it invalidates and refetches automatically).
    - Does **not** navigate away from the current page.

**Special case — Shops management page (`/shops`):**
The Shops page itself manages all shops globally and is **not filtered**
by the selected shop. The dropdown is still visible but a subtle info note
can clarify: _"Showing all shops"_.

---

### `ShopContext` — Global State

Create a React context that is provided at the root of the `<AdminLayout>`:

```js
// src/context/ShopContext.jsx
const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);

  // On mount: fetch shops, restore from localStorage or default to first
  // On change: persist to localStorage

  return (
    <ShopContext.Provider value={{ shops, selectedShop, setSelectedShop }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
```

**Shape of `selectedShop`:**
```js
{
  id: 1,
  name: "Main Street Shop",
  address: "...",
  // ...other fields from the API
}
```

---

### How Each Page Uses the Shop Context

Every page that shows shop-scoped data must:

1. Read `selectedShop.id` from `useShop()`.
2. Pass it as a query parameter to all relevant API calls (e.g. `?shop_id=1`).
3. Include `shopId` in the React Query cache key so switching shops
   automatically triggers a fresh fetch:

```js
useQuery(['appointments', shopId, filters], () =>
  fetchAppointments({ shop_id: shopId, ...filters })
);
```

**Pages / data scoped by selected shop:**

| Page | What gets filtered |
|---|---|
| Dashboard | KPI cards, today's appointments, charts |
| Appointment Calendar | All appointments shown |
| Customers | Customers associated with that shop |
| Barbers | Only barbers assigned to that shop |
| Services | Only services assigned to that shop |
| Waiting List | Waiting entries for that shop |
| Inventory Stock | Stock quantities per shop |
| Statistics | All stats filtered to that shop |
| Settings — Hours | Hours for that shop (if per-shop hours are supported) |

**Pages NOT scoped by shop:**

| Page | Reason |
|---|---|
| Shops (`/shops`) | Manages all shops globally |
| Settings — Holidays | Shop-wide holidays apply everywhere |
| Settings — Vacations | Shop-wide vacations apply everywhere |

---

## Pages

---

### 1. Dashboard (`/dashboard`)

**API calls:**
- `GET /admin/stats/overview`
- `GET /admin/appointments` (filter: today)
- `GET /admin/stats/services`
- `GET /admin/stats/barbers`

**Sections:**

#### KPI Cards (top row)
4 cards:
- Total appointments today
- Revenue today
- Total customers
- Active barbers

Each card shows the value, a label, and a trend indicator if the API returns
comparison data.

#### Today's Appointments Table
Columns: Time · Customer · Service · Barber · Status  
Status shown as a coloured badge: `booked` / `completed` / `cancelled` / `no-show`.  
Clicking a row opens the appointment detail drawer/modal.

#### Top Services Chart
Bar or horizontal bar chart — most requested services, number of bookings.

#### Top Barbers Chart
Bar chart — revenue generated per barber.

#### Busiest Days / Times Heatmap (optional)
If `GET /admin/stats/appointments` returns day-of-week + hour data, render a
simple heatmap grid.

---

### 2. Appointment Calendar (`/appointments`)

**API calls:**
- `GET /admin/appointments` (supports date range filters)
- `POST /admin/appointments`
- `GET /admin/appointments/:id`
- `PUT /admin/appointments/:id`
- `DELETE /admin/appointments/:id`
- `PATCH /admin/appointments/:id/status`

**Primary view:** FullCalendar in `timeGridWeek` mode.  
Toggle buttons to switch between: Day · Week · Month.

Each calendar event shows: customer name, service, barber.  
Colour-coded by status.

**Interactions:**
- **Click empty slot** → opens "Create Appointment" modal pre-filled with the
  clicked time.
- **Click event** → opens "Appointment Detail" drawer.
- **Drag event** → calls `PUT /admin/appointments/:id` with new date/time.

#### Create / Edit Appointment Modal
Fields:
- Customer (searchable dropdown — fetches from `GET /admin/customers`)
- Service (dropdown)
- Barber (dropdown, filtered by service)
- Date picker
- Time slot picker (fetches `GET /availability/slots` based on selections)
- Notes (optional textarea)

#### Appointment Detail Drawer (right-side panel)
Shows all appointment info.  
Status selector: dropdown to change status → calls `PATCH /admin/appointments/:id/status`.  
Edit button → opens edit modal.  
Delete button → confirmation dialog → `DELETE /admin/appointments/:id`.

#### List / Table view toggle
Secondary view: paginated table with filters:
- Date range
- Barber
- Service
- Status

---

### 3. Customers (`/customers`)

**API calls:**
- `GET /admin/customers` (paginated, searchable)
- `POST /admin/customers`
- `GET /admin/customers/:id`
- `PUT /admin/customers/:id`
- `DELETE /admin/customers/:id`
- `GET /admin/customers/:id/appointments`

#### Customer List Page
Searchable, paginated table.  
Columns: Avatar · Name · Email · Phone · Joined date · Actions.  
Actions: View · Edit · Delete.  
"Add Customer" button top-right.

#### Customer Detail Page (`/customers/:id`)
Two-column layout:
- Left: customer info card (name, email, phone, avatar).
- Right: appointment history table (past + future).

Columns: Date · Service · Barber · Status.

#### Add / Edit Customer Modal or Drawer
Fields: Name · Email · Phone · Password (only on create).  
Validation via Zod.

#### Delete
Confirmation dialog before calling `DELETE /admin/customers/:id`.

---

### 4. Barbers (`/barbers`)

**API calls:**
- `GET /admin/barbers`
- `POST /admin/barbers`
- `GET /admin/barbers/:id`
- `PUT /admin/barbers/:id`
- `DELETE /admin/barbers/:id`
- `PATCH /admin/barbers/:id/toggle`
- `POST /admin/barbers/:id/services/sync`
- `PUT /admin/barbers/:id/hours`
- `GET /admin/barbers/:id/vacations`
- `POST /admin/barbers/:id/vacations`
- `DELETE /admin/barbers/:id/vacations/:vacId`

#### Barber List Page
Card grid (or table).  
Each card: avatar · name · active badge · assigned services chips.  
Actions: Edit · Toggle active/inactive · Delete.

#### Barber Detail / Edit Page (`/barbers/:id`)

Tabbed layout with 4 tabs:

**Tab 1 — Info**
Edit name, email, phone, avatar upload, active status.

**Tab 2 — Services**
Checkbox list of all services.  
Save → calls `POST /admin/barbers/:id/services/sync`.

**Tab 3 — Working Hours**
7-day grid (Mon–Sun).  
Each day: toggle on/off · start time picker · end time picker.  
Break slots: add/remove break time ranges per day.  
Save → calls `PUT /admin/barbers/:id/hours`.

**Tab 4 — Vacations**
List of existing vacation ranges with delete button.  
"Add Vacation" → date range picker → `POST /admin/barbers/:id/vacations`.

---

### 5. Services (`/services`)

**API calls:**
- `GET /admin/services`
- `POST /admin/services`
- `PUT /admin/services/:id`
- `DELETE /admin/services/:id`
- `PATCH /admin/services/:id/toggle`

#### Service List Page
Table: Name · Price · Duration (min) · Active · Actions.  
Inline toggle for active/inactive.  
"Add Service" button opens a modal.

#### Add / Edit Service Modal
Fields:
- Name (text)
- Description (textarea, optional)
- Price (number, currency)
- Duration (number, minutes)
- Active (toggle)

Validation via Zod (price ≥ 0, duration > 0).

---

### 6. Shops (`/shops`)

**API calls:**
- `GET /admin/shops`
- `POST /admin/shops`
- `PUT /admin/shops/:id`
- `DELETE /admin/shops/:id`
- `PATCH /admin/shops/:id/toggle`
- `POST /admin/shops/:id/barbers/sync`
- `POST /admin/shops/:id/services/sync`

#### Shop List Page
Card grid: name, address, active badge, assigned barbers count, services count.  
Actions: Edit · Toggle · Delete.  
"Add Shop" button.

#### Shop Detail / Edit Page (`/shops/:id`)

Tabbed layout:

**Tab 1 — Info**
Edit name, address, phone, email.

**Tab 2 — Barbers**
Multi-select checklist of all barbers.  
Save → `POST /admin/shops/:id/barbers/sync`.

**Tab 3 — Services**
Multi-select checklist of all services.  
Save → `POST /admin/shops/:id/services/sync`.

---

### 7. Waiting List (`/waiting-list`)

**API calls:**
- `GET /admin/waiting-list`
- `POST /admin/waiting-list/:id/assign`
- `DELETE /admin/waiting-list/:id`

#### Waiting List Page
Table: Customer · Service · Barber requested · Added at · Actions.  
Actions per row:
- **Assign** → opens a modal to pick an available slot → `POST /admin/waiting-list/:id/assign`.
- **Remove** → confirmation → `DELETE /admin/waiting-list/:id`.

---

### 8. Inventory — Products (`/inventory/products`)

**API calls:**
- `GET /admin/inventory/categories`
- `POST /admin/inventory/categories`
- `PUT /admin/inventory/categories/:id`
- `DELETE /admin/inventory/categories/:id`
- `GET /admin/inventory/products`
- `POST /admin/inventory/products`
- `GET /admin/inventory/products/:id`
- `PUT /admin/inventory/products/:id`
- `DELETE /admin/inventory/products/:id`
- `GET /admin/inventory/products/barcode/:code`

#### Category Management
Side panel or modal accessible from the Products page.  
Tree view showing categories and subcategories.  
Inline add / edit / delete per node.

#### Product List Page
Filterable table: Name · Category · Barcode · Actions.  
"Add Product" opens a modal.

#### Add / Edit Product Modal
Fields:
- Name (text)
- Description (textarea)
- Category (hierarchical dropdown)
- Barcode (text + optional scan button)
- Initial quantity (number)

#### Barcode Lookup
Search bar at the top of the product list.  
Type or scan a barcode → fetches `GET /admin/inventory/products/barcode/:code` →
highlights / opens the matching product.

---

### 9. Inventory — Stock (`/inventory/stock`)

**API calls:**
- `GET /admin/inventory/stock`
- `PUT /admin/inventory/stock/:productId/:shopId`

#### Stock Page
Table grouped by shop.  
Columns: Product · Category · Shop · Quantity · Last Updated · Actions.

Filters: Shop · Category · Low stock (quantity ≤ threshold).

Inline edit: click on quantity cell → input field → save → `PUT /admin/inventory/stock/:productId/:shopId`.

Low stock rows highlighted in amber.

---

### 10. Settings (`/settings`)

Settings is a single page with tabs:

---

#### Tab 1 — General & Hours

**API calls:**
- `GET /admin/settings`
- `PUT /admin/settings`
- `PUT /admin/settings/hours`

**General section:**
Fields: Shop name · Address · Phone · Email · Cancellation limit (hours).  
Save → `PUT /admin/settings`.

**Weekly Hours section:**
7-day grid (same UX as barber working hours).  
Each day: open/closed toggle · start time · end time · break ranges.  
Save → `PUT /admin/settings/hours`.

---

#### Tab 2 — Holidays

**API calls:**
- `GET /admin/settings/holidays`
- `POST /admin/settings/holidays`
- `DELETE /admin/settings/holidays/:id`

List of public holidays: Name · Date · Actions (delete).  
"Add Holiday" → modal with name + date picker.  
On these days booking is automatically blocked.

---

#### Tab 3 — Vacations (Shop-wide)

**API calls:**
- `GET /admin/settings/vacations`
- `POST /admin/settings/vacations`
- `DELETE /admin/settings/vacations/:id`

List of shop-wide vacation periods: Label · Start date · End date · Actions.  
"Add Vacation" → modal with label + date range picker.

---

### 11. Statistics (`/stats`)

**API calls:**
- `GET /admin/stats/overview`
- `GET /admin/stats/services`
- `GET /admin/stats/barbers`
- `GET /admin/stats/appointments`

Full-page stats dashboard. Date range filter at the top (default: current month).

**Sections:**

| Section | Chart type | Data |
|---|---|---|
| Revenue over time | Line chart | Daily/weekly revenue |
| Appointments by status | Donut chart | booked / completed / cancelled / no-show |
| Top services | Horizontal bar | Bookings + revenue per service |
| Barber performance | Grouped bar | Clients handled + revenue per barber |
| Busiest hours | Heatmap grid | Hour of day × day of week |
| Regular customers | Table | Customers ranked by appointment count |

---

## Shared / Reusable Components

| Component | Purpose |
|---|---|
| `<DataTable>` | Sortable, filterable, paginated table |
| `<ConfirmDialog>` | Reusable "Are you sure?" modal |
| `<StatusBadge>` | Coloured pill for appointment statuses |
| `<AvatarUpload>` | Image upload with preview |
| `<DateRangePicker>` | Start + end date picker |
| `<TimeRangePicker>` | Start + end time for schedule grids |
| `<WeekHoursGrid>` | 7-day working hours editor (used in barbers + settings) |
| `<SearchableSelect>` | Async searchable dropdown (customers, barbers) |
| `<PageHeader>` | Title + breadcrumbs + right-side action button |
| `<EmptyState>` | Illustrated empty state for lists |
| `<LoadingSpinner>` | Centred spinner for async states |
| `<ErrorBoundary>` | Catches render errors gracefully |
| `<ShopDropdown>` | Topbar shop selector — fetches all shops, shows active one, persists choice to `localStorage` |
| `ShopContext` + `useShop()` | Global React context that holds `selectedShop` and `setSelectedShop`; consumed by every page to scope API queries |

---

## API Service Layer

Create a `/src/services/` directory with one file per resource:

```
services/
  api.js          ← Axios instance with interceptors
  auth.js
  appointments.js
  customers.js
  barbers.js
  services.js
  shops.js
  waitingList.js
  inventory.js
  stats.js
  settings.js
```

Each file exports plain async functions (not hooks). React Query hooks wrap these
in `/src/hooks/`.

---

## Routing Structure

```
/login                        ← public
/                             ← redirect to /dashboard
/dashboard
/appointments
/customers
/customers/:id
/barbers
/barbers/:id
/services
/shops
/shops/:id
/waiting-list
/inventory/products
/inventory/stock
/stats
/settings
```

---

## Form Validation Rules

| Field | Rule |
|---|---|
| Email | Valid email format |
| Phone | Min 7 digits, numeric only |
| Password (create) | Min 8 characters |
| Price | Non-negative number |
| Duration | Positive integer (minutes) |
| Cancellation limit | Positive integer (hours) |
| Date range (vacation) | End ≥ start |
| Time range (hours) | End > start |

---

## Error & Loading States

Every data-fetching component must handle three states:

1. **Loading** — skeleton loaders or spinner
2. **Error** — inline error message + retry button
3. **Empty** — `<EmptyState>` component with contextual illustration and CTA

---

## Notifications (Toasts)

Show a toast for every mutation:

| Event | Toast type |
|---|---|
| Create success | ✅ Green |
| Update success | ✅ Green |
| Delete success | ✅ Green |
| Validation error | ⚠️ Yellow |
| Server / network error | ❌ Red |

---

## Permissions Summary

The admin panel is accessible **only** to users with `role === 'admin'`.
All routes are protected by the auth guard. No role-based sub-permissions exist
at this stage (all admins see everything).

---

## Out of Scope (Admin Panel)

The following are **not** part of the admin frontend:

- Customer-facing booking app (separate project)
- Push notifications
- Real-time updates / WebSockets (can be added in phase 2)
- Multi-admin roles with granular permissions
- PDF report export (phase 2)

---

## Deliverables Checklist

- [ ] Axios instance with auth interceptors
- [ ] React Query setup with global error handler
- [ ] Protected route wrapper
- [ ] `ShopContext` + `useShop()` hook
- [ ] `<ShopDropdown>` component with localStorage persistence and auto-default
- [ ] Sidebar + Topbar layout (with ShopDropdown in topbar)
- [ ] All page-level React Query keys include `shopId`
- [ ] Dashboard page with KPI cards + charts (shop-scoped)
- [ ] Appointment Calendar page (FullCalendar, shop-scoped)
- [ ] Create / Edit / Detail modals for appointments
- [ ] Customer list + detail pages (shop-scoped)
- [ ] Barber list + tabbed detail page (info, services, hours, vacations) (shop-scoped)
- [ ] Service list + add/edit modal (shop-scoped)
- [ ] Shop list + tabbed detail page (global — not filtered)
- [ ] Waiting list page (shop-scoped)
- [ ] Inventory products page + category panel
- [ ] Inventory stock page (shop-scoped)
- [ ] Statistics page with charts (shop-scoped)
- [ ] Settings page (general, hours, holidays, vacations tabs)
- [ ] Shared component library (DataTable, ConfirmDialog, etc.)
- [ ] API service layer
- [ ] Zod schemas for all forms
- [ ] Toast notifications wired to all mutations
- [ ] Loading / error / empty states on all pages