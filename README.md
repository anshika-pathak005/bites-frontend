
# Bites - Food Ordering & Restaurant Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13-38B2AC.svg)](https://tailwindcss.com/)

---

**Live Demo:** [Bites](https://bites-culinary.vercel.app)

**Repositories:**
- **Frontend:** [bites-frontend](https://github.com/anshika-pathak005/bites-frontend)
- **Backend:** [bites-backend](https://github.com/anshika-pathak005/bites-backend)

---

## 1. Project Title

**Bites** – A modern food ordering and restaurant management platform built with Next.js, React, TypeScript, and Tailwind CSS, featuring customer ordering, delivery management, and an administrative dashboard.

---

## 2. Introduction

**Bites** is a full-stack food ordering platform designed to provide customers with a seamless food discovery and ordering experience while enabling administrators to manage restaurant operations through a dedicated dashboard.

The frontend is built with **Next.js App Router**, TypeScript, and Tailwind CSS, with TanStack Query for server-state management and Axios for API communication. It integrates with a separate Spring Boot backend to handle authentication, menu management, orders, delivery pricing, and other business operations.

The application supports customer and guest shopping flows, address management, checkout, order tracking, and administrative tools for managing menu items, categories, customers, orders, and delivery charge slabs.

---

## 3. Features

- **Customer Authentication:**
  - Customer registration and login.
  - Dedicated customer authentication and profile management.
  - Guest shopping flow with contextual authentication prompts.

- **Menu & Category Browsing:**
  - Browse available menu items and categories.
  - View individual menu item details.
  - Discover featured menu items and recommendations.

- **Shopping Cart:**
  - Add and manage items in the cart.
  - Update quantities and review selected items before checkout.

- **Address & Location Management:**
  - Manage saved delivery addresses.
  - Enter and confirm delivery locations using coordinates.
  - Address search and reverse geocoding using OpenStreetMap Nominatim.
  - Support for manually entering location coordinates.

- **Checkout & Delivery Pricing:**
  - Select or enter a delivery address.
  - Retrieve delivery quotes based on the selected location.
  - Integrate with backend delivery pricing rules.
  - Support for the checkout and order placement workflow.
  
 - **Payment Integration:**
    - Online payments through Razorpay.
    - Cash on Delivery (COD) payment option.
    - Payment method selection during checkout.

- **Order Management & Tracking:**
  - Place orders and view order confirmation.
  - Track order status.
  - View and manage orders through the customer interface.

- **Admin Authentication & Dashboard:**
  - Dedicated administrator login and protected dashboard routes.
  - Dashboard summary and customer management.
  - Menu item and category management.
  - Order management and order detail views.
  - Delivery charge slab management.
  - Administrative profile and settings.

- **Reusable UI Components:**
  - Shared buttons, inputs, select fields, modals, and confirmation dialogs.
  - Consistent loading indicators and order status badges.
  - Responsive layouts for customer and administrative interfaces.

---

## 4. Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Server State & Caching:** TanStack Query
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **UI Components:** Radix UI Select
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Utilities:** clsx, tailwind-merge, class-variance-authority

### Backend Integration

- **Framework:** Spring Boot
- **Database:** MySQL
- **Communication:** REST APIs over HTTP
- **Payment Gateway:** Razorpay

The backend is maintained in a separate repository.

---

## 5. Architecture

Bites follows a client-server architecture in which the Next.js frontend communicates with the Spring Boot backend through REST APIs.

```text
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│                                             │
│  Customer Interface     Admin Dashboard     │
│  Menu | Cart            Orders | Menu       │
│  Checkout | Tracking    Customers | Settings│
└──────────────────────┬──────────────────────┘
                       │
                 Axios HTTP Client
                       │
              TanStack Query
          (Server State & Caching)
                       │
                 REST API Calls
                       │
┌──────────────────────▼──────────────────────┐
│             Spring Boot Backend              │
│                                             │
│  Authentication | Menu | Orders             │
│  Customers | Addresses | Delivery Pricing   │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                   MySQL                     │
│          Application Data Storage            │
└─────────────────────────────────────────────┘
```

### Communication Flow

1. **Page Rendering:** Next.js App Router organizes customer-facing pages and protected administrative routes.
2. **API Communication:** Axios handles HTTP requests between the frontend and backend.
3. **Server State:** TanStack Query manages API-driven data fetching, caching, and query updates.
4. **User Interaction:** React components and context providers manage shared client-side state, including authentication and cart-related state.
5. **Location Services:** Server-side geocoding routes handle location search and reverse-geocoding requests through OpenStreetMap Nominatim.

---

## 6. Project Structure

```text
bites-frontend/
├── public/                         # Static assets
├── src/
│   ├── app/
│   │   ├── (customer)/             # Customer-facing pages
│   │   │   ├── about/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── contact/
│   │   │   ├── login/
│   │   │   ├── menu/
│   │   │   ├── order-success/
│   │   │   ├── profile/
│   │   │   ├── register/
│   │   │   ├── track-order/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── (protected)/        # Protected admin pages
│   │   │   │   ├── categories/
│   │   │   │   ├── customers/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── delivery-slabs/
│   │   │   │   ├── menu/
│   │   │   │   ├── orders/
│   │   │   │   ├── profile/
│   │   │   │   └── settings/
│   │   │   └── login/
│   │   ├── api/
│   │   │   └── geocode/            # Geocoding API routes
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── customer/               # Customer-specific components
│   │   ├── layout/                 # Navbar, footer, admin sidebar
│   │   └── ui/                     # Reusable UI components
│   ├── constants/                  # Routes and order statuses
│   ├── context/                    # Authentication and cart contexts
│   ├── data/                       # Static site content
│   ├── features/
│   │   ├── addresses/              # Address and location management
│   │   ├── admin/                  # Admin features and management
│   │   ├── cart/                   # Cart functionality
│   │   ├── checkout/               # Checkout and delivery pricing
│   │   ├── customer/               # Customer authentication
│   │   ├── menu/                   # Menu and category browsing
│   │   └── orders/                 # Order tracking
│   ├── hooks/                      # Shared custom hooks
│   ├── lib/
│   │   ├── api/                    # Axios configuration
│   │   ├── geo/                    # Geocoding utilities
│   │   └── query/                  # Query client and query keys
│   └── types/                      # Shared TypeScript types
├── .env.example                    # Environment variable template
├── next.config.ts                  # Next.js configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 7. Prerequisites

Before running Bites locally, ensure you have the following installed:

- **Node.js:** Compatible with Next.js 16.
- **npm:** Installed with Node.js.
- **Git:** For cloning and managing the repository.
- **Backend Service:** A running Spring Boot backend or an accessible deployed backend API.

---

## 8. Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anshika-pathak005/bites-frontend.git
cd bites-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and configure the required environment variables as described in Section 9.

### 4. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 9. Environment Variables

Create a `.env.local` file in the root directory of the project.

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Geocoding Configuration
NOMINATIM_CONTACT=you@yourdomain.com
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# Frontend Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variable Description

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Spring Boot backend API. |
| `NOMINATIM_CONTACT` | Contact email or URL identifying the application to Nominatim. |
| `NOMINATIM_BASE_URL` | Nominatim service URL used for geocoding. |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL used as the Referer for geocoding requests. |

**Important:**

- Update `NEXT_PUBLIC_API_BASE_URL` to point to your deployed backend when deploying the frontend.
- Configure a valid contact value for `NOMINATIM_CONTACT` before deployment.
- The public Nominatim service has a usage policy and rate limits. Review its policy before using it in a production application.
- Variables prefixed with `NEXT_PUBLIC_` are exposed to browser-side code. Never store secrets in them.
- Keep `.env.local` out of version control. Use `.env.example` as the configuration template.

---

## 10. Running the Application

### Development Mode

```bash
npm run dev
```

Starts the Next.js development server with hot reloading.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Start Production Server

```bash
npm run start
```

Starts the application using the generated production build. Run `npm run build` before executing this command.

### Linting

```bash
npm run lint
```

Runs ESLint to check the codebase for linting issues.

---

## 11. Deployment

The frontend can be deployed on a platform that supports Next.js, such as Vercel.

### Deployment Steps

1. Push the frontend repository to GitHub.
2. Import the repository into your chosen deployment platform.
3. Configure the required environment variables in the deployment settings.
4. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed Spring Boot backend API URL.
5. Set `NEXT_PUBLIC_SITE_URL` to the deployed frontend URL.
6. Configure `NOMINATIM_CONTACT` with a valid contact value.
7. Deploy the application and verify the customer pages, checkout flow, location services, and administrative routes.

The backend must be deployed and accessible separately for API-dependent features to work.

---

## 12. Author

**Anshika Pathak**

- **GitHub:** [@anshika-pathak005](https://github.com/anshika-pathak005)
