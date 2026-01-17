# Project Documentation: Bezawu Super Admin Panel

## 1. Product Requirements Document (PRD)

### 1.1 Goal
The Bezawu Super Admin Panel is a centralized management interface designed for the "Super Admin" of the Bezawu platform. Its primary goal is to provide comprehensive control over the entire ecosystem, which includes supermarkets, branches, delivery networks, users, and financial operations. It acts as the "God Mode" view for the business owners/administrators.

### 1.2 User Personas
*   **Super Admin**: The primary user. They have full access to all modules, can onboard new supermarkets, manage global settings, view financial reports, and oversee the entire system's health.
*   **Support Staff (Potential)**: Users with restricted access who manage customer feedback or specific operational tickets (inferred from "Users" and roles structure).

### 1.3 User Stories
*   **As a Super Admin**, I want to view a dashboard with real-time revenue, active branches, and user growth so I can monitor business health.
*   **As a Super Admin**, I want to onboard new supermarkets and manage their branches so the platform inventory expands.
*   **As a Super Admin**, I want to manage platform commission rates in a central settings area so I can adjust the business model dynamically.
*   **As a Super Admin**, I want to view audit logs to track who did what within the system for security and accountability.
*   **As a Super Admin**, I want to manage internal admin users and their roles to delegate tasks securely.
*   **As a Super Admin**, I want to track detailed financial data, including revenue vs. commission, to ensure accurate accounting.

---

## 2. Software Requirements Specification (SRS)

### 2.1 Functional Requirements
*   **Authentication**:
    *   Secure Login with Email/Password.
    *   OTP-based Password Reset flow.
    *   JWT-based session management with auto-expiry.
*   **Dashboard**:
    *   Display Key Performance Indicators (Total Revenue, Platform Commission, Total Users, Total Branches).
    *   Visual charts for Revenue Stream (Monthly) and performance metrics.
    *   Top Performing Supermarkets and Product Categories rankings.
*   **Supermarket Management**:
    *   List all registered supermarkets with summary stats (Revenue, Branches, Inventory).
    *   View detailed supermarket profiles including bank accounts and inventory size.
    *   Update supermarket status (Active/Inactive).
*   **User Management**:
    *   Create, Read, Update, Delete (CRUD) internal admin users.
    *   Role-based access checks (e.g., Super Admin vs Admin).
*   **System Configuration**:
    *   Global settings management (e.g., Commission Rate).
    *   Identity rotation and security settings.
*   **Feedback & Auditing**:
    *   View customer feedback logs.
    *   View system audit logs for administrative actions.

### 2.2 Non-Functional Requirements
*   **Performance**: Dashboard stats must load efficiently using optimized SQL aggregation.
*   **Security**: All API endpoints (except login) must be protected by JWT middleware. Passwords must be hashed using bcrypt.
*   **Usability**: The interface should support Dark/Light modes for accessibility and user preference.
*   **Scalability**: The backend structure (Node/Express) and Database (PostgreSQL) should support growing data volumes via efficient indexing and query planning.

---

## 3. System Architecture / Tech Stack

### 3.1 Frontend
*   **Framework**: React 19 (via Vite 6).
*   **Language**: TypeScript.
*   **Routing**: React Router DOM v7.
*   **Styling**: Vanilla CSS (CSS Variables for theming) + Lucide React (Icons).
*   **Visualization**: Recharts for analytics graphs.
*   **HTTP Client**: Axios.

### 3.2 Backend
*   **Runtime**: Node.js.
*   **Framework**: Express.js 5.
*   **Language**: JavaScript (CommonJS).
*   **Security**: Helmet (Headers), CORS, Bcrypt (Hashing), JWT (Auth), Express-Validator.
*   **Logging**: Morgan.
*   **Email**: Nodemailer.
*   **AI Integration**: Google Generative AI (Gemini) for advanced internal processing.

### 3.3 Database
*   **Engine**: PostgreSQL.
*   **Driver**: `pg` (node-postgres).
*   **Migration**: `node-pg-migrate`.

### 3.4 Cloud/Infrastructure (Inferred)
*   **Host**: Likely a VPS or PaaS supporting Node.js and Postgres.
*   **Storage**: Local `uploads` directory for images (based on file structure).

---

## 4. Database Schema

Based on codebase analysis, the following core tables exist:

### 4.1 Users & Auth
*   **`admins`**: Internal system administrators.
    *   `id` (UUID/PK), `email`, `password` (Hash), `full_name`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`.
*   **`customers`**: End-users of the Bezawu app.
    *   `id`, `...` (Standard profile fields).

### 4.2 Commerce
*   **`supermarkets`**: The businesses on the platform.
    *   `id` (PK), `name`, `logo`, `status` (Active/Inactive), `created_at`.
*   **`branches`**: Physical locations of supermarkets.
    *   `id` (PK), `supermarket_id` (FK), `status`.
*   **`bank_accounts`**: Financial details for supermarkets.
    *   `supermarket_id` (FK), `...` (Account details).
*   **`orders`**: Customer orders.
    *   `id` (PK), `customer_id` (FK), `branch_id` (FK), `total_price`, `status` (e.g., 'CANCELLED'), `created_at`.
*   **`order_items`**: Items within an order.
    *   `order_id` (FK), `product_id` (FK), `quantity`, `price_at_purchase`.

### 4.3 Inventory
*   **`products`**: Items available for sale.
    *   `id` (PK), `category_id` (FK), `...`.
*   **`categories`**: Taxonomy for products.
    *   `id` (PK), `name`, `supermarket_id` (FK).

### 4.4 System
*   **`system`**: Global configuration key-values.
    *   `name` (e.g., 'commission_rate'), `value`.
*   **`audit_logs`**: (Inferred) Records of admin actions.
*   **`feedback`**: (Inferred) User feedback records.

---

## 5. API Documentation

### 5.1 Authentication (`/api/auth`)
*   **POST** `/login`: Authenticate admin.
    *   Req: `{ email, password }`
    *   Res: `{ token, admin: { ... } }`
*   **POST** `/forgot-password`: Send OTP.
*   **POST** `/verify-otp`: Validate OTP.
*   **POST** `/reset-password`: Set new password with token.
*   **GET** `/me`: Get current admin profile.

### 5.2 Dashboard (`/api/dashboard`)
*   **GET** `/stats`: Returns aggregated KPIs (Revenue, Users, etc.).
*   **GET** `/revenue-chart`: Returns monthly revenue data for charts.
*   **GET** `/top-supermarkets`: Returns ranking of supermarkets by revenue.
*   **GET** `/top-products`: Returns ranking of categories by sales volume.

### 5.3 Supermarkets (`/api/supermarkets`)
*   **GET** `/`: List all supermarkets with aggregate stats (branch count, revenue).
*   **GET** `/:id`: Get full details of a specific supermarket.
*   **PATCH** `/:id/status`: Toggle supermarket status (e.g., Active/Suspended).

### 5.4 Other Modules (Summary)
*   **/api/branches**: Management of branch entities.
*   **/api/users**: CRUD for admins.
*   **/api/finance**: Financial reporting endpoints.
*   **/api/system**: Get/Set global vars like 'commission_rate'.

---

## 6. Sitemap & Page Structure

1.  **Auth Pages**
    *   `/login`: Main entry point.
    *   `/forgot-password`: Recovery flow.
    *   `/otp-verification`: Security step.
    *   `/reset-password`: Final recovery step.

2.  **Dashboard** (`/dashboard`)
    *   Overview of system health, charts, and top lists.

3.  **Management Pages**
    *   **Supermarkets** (`/supermarkets`): Grid/List of vendors.
    *   **Branches** (`/branches`): Operational units list.
    *   **Network** (`/network`): Logistics/Delivery network view.
    *   **Finance** (`/finance`): Revenue reports and commission handling.
    *   **Users** (`/users`): Internal team management.
    *   **Feedback** (`/feedback`): Customer voice and issue tracking.
    *   **Audit Logs** (`/audit`): Security and action history.

4.  **Settings** (`/settings`)
    *   Theme toggle (Dark/Light).
    *   Profile management.
    *   System variables (Commission).

---

## 7. User Flow / Logic

### 7.1 Authentication Flow
1.  User lands on `/`.
2.  If invalid token -> Redirect to Login.
3.  User inputs credentials -> API `/login`.
4.  On Success -> Store JWT -> Redirect to `/dashboard`.
5.  On Logout -> Clear JWT -> Redirect to Login.

### 7.2 Supermarket Monitoring Flow
1.  Admin navigates to **Supermarkets**.
2.  System fetches list via `GET /api/supermarkets`.
3.  Admin clicks a specific Supermarket.
4.  System fetches details via `GET /api/supermarkets/:id`.
5.  Admin reviews revenue, branches, and inventory status.
6.  Admin can "Suspend" a supermarket if needed via `PATCH`.

### 7.3 Data Visualization Logic
*   **Revenue Chart**: Aggregates `orders` table data by month, summing `total_price` where status is not 'CANCELLED'.
*   **Top Products**: joins `order_items` -> `products` -> `categories` to calculate total sales volume per category.
