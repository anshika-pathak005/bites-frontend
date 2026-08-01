# Bites — Restaurant Ordering Platform

A full-stack restaurant ordering web app with guest checkout for customers and a complete admin panel for managing the restaurant.

---

## Overview

Bites lets a restaurant take orders online without forcing customers to create an account — browse the menu, add items to a cart, check out as a guest, and track the order status in real time. On the other side, restaurant staff get an admin panel to manage the menu, categories, delivery areas, incoming orders, and customer records.

**Target users:**
- **Customers** — anyone who wants to order food without signing up.
- **Restaurant admins/staff** — manage menu, orders, delivery areas, and view customer history.

This repo is the **frontend only**. It talks to a separate Spring Boot backend over a REST API.

---

## Features

### Customer
- Browse menu with category filters, search, and pagination
- Item detail page with a "Buy Now" (skip cart) flow
- Cart management (guest session, no login)
- Checkout (Cart flow and Buy Now flow share one page)
- Order success confirmation
- Track order by order number/phone
- Static About and Contact pages

### Admin
- JWT-based login
- Dashboard with order/revenue summary
- Order management with status transitions (Pending → Accepted → Preparing → Out for Delivery → Delivered, or Cancelled)
- Menu item management (create/edit/toggle availability)
- Category management
- Delivery area management
- Customer list (read-only) with saved addresses
- Restaurant settings
- Admin profile (update info, change password)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Server state | TanStack Query (React Query) |
| Forms & validation | React Hook Form + Zod |
| HTTP client | Axios |
| UI utilities | Lucide icons, Sonner (toasts), class-variance-authority, tailwind-merge |
| Backend | Spring Boot 3 (Java 21) — separate repo |
| Auth | Spring Security + JWT |
| Database | MySQL (via Spring Data JPA, Flyway migrations) |
| Dev tools | ESLint 9 (flat config), TypeScript |

---

## Project Structure

```
src/
├── app/          # Routes (Next.js App Router)
├── components/   # Shared UI + layout components
├── features/     # Feature modules (api/hooks/components per feature)
├── hooks/        # Reserved for cross-feature hooks (currently empty)
├── lib/          # Axios instance, TanStack Query setup, generic utils
├── types/        # Shared TypeScript types mirroring backend DTOs
├── constants/    # Route paths, order-status labels/transitions
├── context/      # Cross-cutting React state (cart session, admin auth)
└── data/         # Static marketing copy (About/testimonials/footer)
```

---

## Feature-Based Architecture

Business logic lives in `src/features/<name>/`, not scattered across pages. Each feature module is self-contained:

```
features/menu/
├── api/          # Raw backend calls (axios)
├── hooks/        # TanStack Query hooks wrapping the api calls
└── components/   # UI specific to this feature (if any)
```

**Why:** pages in `app/` stay thin (just assembling hooks/components), each feature can be understood in isolation, and there's a single obvious place to add new backend calls or query hooks without touching unrelated code.

Feature modules in this project:
- `menu` — categories, menu items, item detail
- `cart` — guest cart CRUD
- `checkout` — order placement (Cart flow + Buy Now flow)
- `orders` — order tracking for customers
- `admin/auth` — admin login/profile
- `admin/dashboard` — summary stats
- `admin/category-management`, `admin/menu-management`, `admin/delivery-areas`, `admin/orders`, `admin/customers`, `admin/settings` — admin CRUD screens

---

## Routing

Built on the Next.js App Router (`src/app/`):

- **`(customer)` route group** — wraps all public customer pages with a shared Navbar/Footer/cart context, without adding a URL segment (e.g. `/menu`, `/cart`, `/checkout`).
- **`admin/`** — admin routes. `admin/layout.tsx` provides the auth context to *everything* under `/admin`, including the login page.
- **`admin/(protected)` route group** — everything except login/root. Its own layout redirects to `/admin/login` if there's no valid session, and renders the admin sidebar. This is what makes admin pages "protected" — the guard lives in one place, not duplicated per page.
- **Dynamic routes** — `menu/[itemId]` (item detail) and `admin/(protected)/orders/[id]` (order detail).
- Pages that read `useSearchParams()` (checkout, order-success, track-order) wrap the relevant part in `<Suspense>`, as required by the App Router.

---

## Folder Details

| Folder | Purpose |
|---|---|
| `src/app` | Route definitions, layouts, and pages only — no business logic |
| `src/components/ui` | Generic, reusable primitives (Button, Input, Badge, Spinner…) |
| `src/components/layout` | Navbar, Footer, AdminSidebar |
| `src/features` | Self-contained feature modules — see [Feature-Based Architecture](#feature-based-architecture) |
| `src/hooks` | Reserved for hooks shared across multiple features (empty for now) |
| `src/lib/api` | Shared Axios instance with a 401 → refresh → retry interceptor |
| `src/lib/query` | TanStack Query client/provider + centralized query-key factory |
| `src/types` | Domain types mirroring backend response shapes |
| `src/constants` | Route path constants, order status labels/allowed transitions |
| `src/context` | Cart session (guest id) and admin auth state |
| `src/data` | Hardcoded static copy only (About text, testimonials, chef bios) — real data always comes from the API |

---

## Installation

```bash
git clone <repo-url>
cd bites-frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`. Requires the backend running separately (see [Environment Variables](#environment-variables)).

---

## Environment Variables

Copy `.env.example` to `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API (default: `http://localhost:8080/api`) |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Project Workflow

**Customer flow:**
Home → browse Menu (filter/search) → Item Detail → add to Cart (or Buy Now) → Checkout → Order Success → Track Order.

**Admin flow:**
Login → Dashboard (overview) → manage Orders (accept/progress/cancel) / Menu / Categories / Delivery Areas → view Customers → adjust Settings/Profile.

---

## API Layer

- One shared Axios instance (`src/lib/api/axios-instance.ts`) for every request — handles the base URL, auth header, and a 401 → refresh-token → retry interceptor.
- Every backend response is wrapped as `{ success, data, message, error }`; paginated endpoints return `{ items, page, pageSize, totalItems, totalPages }`.
- Each feature owns its own `api/*.api.ts` file — plain async functions that call the backend and return typed data. No feature imports another feature's API directly.
- **React Query hooks** (`hooks/use-*.ts`) wrap those API functions: `useQuery` for reads, `useMutation` for writes. Mutations show a toast (success/error) and invalidate the relevant query keys — including cross-boundary keys where needed (e.g. an admin category edit also invalidates the public category list customers see).
- Query keys are centralized in `src/lib/query/query-keys.ts` so invalidation targets stay consistent across features.

---

## State Management

- **TanStack Query** — all server state (menu, cart, orders, admin data). No manual loading/error state juggling; caching and invalidation are handled by query keys.
- **React Context** — only for small, cross-cutting client state: `cart-context` (guest session id) and `admin-auth-context` (JWT/session, login/logout). Not used for server data.
- **React Hook Form + Zod** — forms with real validation (login, checkout, admin CRUD forms with schemas). Simple admin forms without complex validation use plain `useState`.

No Redux/Zustand — Query + Context cover everything needed here.

---

## Folder Naming Conventions

| Suffix / Pattern | Meaning |
|---|---|
| `*.api.ts` | Raw backend calls for a feature (axios functions) |
| `*.types.ts` | TypeScript types/interfaces for a domain |
| `use-*.ts` | A React hook (typically a TanStack Query hook) |
| `page.tsx` | A Next.js route entry point |
| `layout.tsx` | A Next.js layout wrapping nested routes |
| `(group-name)` | A Next.js route group — organizes routes without affecting the URL |
| `[param]` | A Next.js dynamic route segment |

---

## Coding Standards

- **Naming:** kebab-case for files/folders, PascalCase for components, camelCase for functions/variables.
- **Folder organization:** one feature = one folder with `api/`, `hooks/`, `components/`. Pages stay thin and only assemble feature hooks/components.
- **Reusable components:** generic, domain-agnostic UI goes in `components/ui/`; anything feature-specific stays inside that feature's own `components/` folder.
- **Money:** always formatted through `formatPrice()` in `src/lib/utils.ts` — never inline currency formatting.
- **Single Axios instance:** all HTTP calls go through the one shared client — never instantiate a second one.

---

## Future Improvements

- Real Cloudinary image upload UI for admin forms (currently accepts an image URL as plain text)
- Backend endpoint for the Contact form (currently UI-only)
- Freeze cart item price at add-to-cart time instead of using the live menu price at checkout
- Replace remaining Unsplash placeholder images with real assets

---

## Screenshots

_Add screenshots here: Home, Menu, Cart, Checkout, Order Tracking, Admin Dashboard, Mobile view._

---

## Author

- **Name:**
- **GitHub:**
- **LinkedIn:**
- **Portfolio:**
