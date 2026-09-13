# MartNexus

<div align="center">

<img src="./frontend/public/martnexus.png" alt="MartNexus Logo" width="110" height="110" />

### GST-Enabled Multi-Outlet Inventory, POS & Retail ERP Platform

An enterprise-grade, full-stack retail management system engineered to unify real-time stock control, dual-tax GST compliance, multi-branch operations, supplier procurement, and automated financial auditing into a single performant dashboard.

[![Live Web Application](https://img.shields.io/badge/Live%20Demo-mart--nexus.vercel.app-blue?style=for-the-badge&logo=vercel)](https://mart-nexus.vercel.app)
[![Live Backend API](https://img.shields.io/badge/API%20Endpoint-mart--nexus--backend.vercel.app-green?style=for-the-badge&logo=fastapi)](https://mart-nexus-backend.vercel.app)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)
[![ORM](https://img.shields.io/badge/Prisma-Client-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Frontend](https://img.shields.io/badge/React-Vite%20SPA-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

</div>

---

## 📑 Table of Contents

- [The Problem & Why MartNexus Was Built](#-the-problem--why-martnexus-was-built)
- [System Architecture](#-system-architecture)
  - [High-Level Architecture Diagram](#high-level-architecture-diagram)
  - [Transactional POS Checkout Flow](#transactional-pos-checkout-flow)
  - [Procurement & Inwarding Workflow](#procurement--inwarding-workflow)
- [Technology Stack](#-technology-stack)
- [Core Functional Modules](#-core-functional-modules)
- [Visual Showcase & Screenshots](#-visual-showcase--screenshots)
- [Database Schema & Data Model](#-database-schema--data-model)
- [API Reference Directory](#-api-reference-directory)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Environment Variables Guide](#environment-variables-reference)
- [Production Deployment](#-production-deployment)
- [Security & Compliance Architecture](#-security--compliance-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [License & Authors](#-license--authors)

---

## 💡 The Problem & Why MartNexus Was Built

Small to medium-sized retail enterprises, wholesale distributors, and multi-branch merchants across India and emerging retail economies face severe operational bottlenecks:

1. **Manual Registers & Disconnected Spreadsheets**: Paper bills and offline Excel files lead to inventory leakage, unrecorded stock movements, stockouts of high-velocity items, and expensive human entry errors.
2. **GST Compliance Friction**: Calculating dynamic tax splits (CGST 9% + SGST 9% for intra-state sales vs. IGST 18% for inter-state sales) manually at billing counters slows down checkout lines and causes tax filing errors.
3. **Multi-Store Blind Spots**: Store owners operating across several physical outlets lack unified oversight over consolidated turnover, stock levels at individual branches, and branch-specific profit margins.
4. **Disjointed Procurement Lifecycles**: Purchase orders sent to vendors are rarely linked directly with warehouse stock. When shipments arrive, staff manually update spreadsheets rather than executing automated stock increments.
5. **Absence of Auditability**: Legacy billing software allows unlogged price overwrites and stock adjustments without capturing timestamps, user identities, or change deltas.

### The MartNexus Solution

**MartNexus** bridges the gap between over-complicated enterprise ERP suites and inadequate single-device billing apps. It delivers an ACID-compliant, real-time inventory ledger coupled with a lightning-fast Point of Sale (POS), barcode camera scanning, automated PO-to-stock inwarding, custom B2B pricing matrices, scheduled background database backups, and immutable audit logs.

---

## 🏗️ System Architecture

MartNexus is architected as a modular, decoupled full-stack platform consisting of a Single Page Application (SPA) frontend, an Express.js REST API layer, Prisma ORM for database abstraction, and a cloud-hosted PostgreSQL instance with connection pooling.

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (Browser / POS Hardware)"]
        SPA["React + Vite Single Page App"]
        Scanner["Camera Barcode Scanner (HTML5-QRCode)"]
        StateStore["Redux Toolkit + TanStack Query Cache"]
        SPA --> Scanner
        SPA --> StateStore
    end

    subgraph Gateway ["Network & Hosting (Vercel)"]
        FrontEndCDN["Vercel Edge Network (mart-nexus.vercel.app)"]
        BackEndServerless["Vercel Serverless Functions (mart-nexus-backend.vercel.app)"]
        FrontEndCDN --> SPA
    end

    subgraph APILayer ["Backend Application (Node.js & Express)"]
        Router["Express REST Routing (/api)"]
        AuthMid["JWT Auth & Role Guard Middleware"]
        Controllers["Domain Controllers (Billing, Inventory, PO, Reports)"]
        Schedulers["Background Schedulers (Node-Cron)"]
        MailService["Email Service (Nodemailer)"]
        ExportEngine["ExcelJS & Archiver Export Engines"]

        Router --> AuthMid --> Controllers
        Schedulers --> MailService
        Controllers --> MailService
        Controllers --> ExportEngine
    end

    subgraph PersistenceLayer ["Data & Storage Layer"]
        PrismaORM["Prisma Client & PG Adapter"]
        SupabasePooler["Supabase Connection Pooler (PgBouncer)"]
        PostgresDB[("PostgreSQL Database")]
        PrismaORM --> SupabasePooler --> PostgresDB
    end

    StateStore -- "HTTPS / REST (JSON + Bearer Token)" --> Router
    Controllers --> PrismaORM
```

### Transactional POS Checkout Flow

Every checkout in MartNexus runs inside a database transaction (`prisma.$transaction`) to guarantee data integrity and prevent negative stock or race conditions during peak checkout periods:

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Cashier / POS Operator
    participant POS as POS Interface (React)
    participant API as Billing API (/api/billing)
    participant DB as PostgreSQL (via Prisma Transaction)
    participant Invoice as GST Invoice Generator

    Cashier->>POS: Scan Barcode / Search Product & Add to Cart
    Cashier->>POS: Select Customer & Discount Tier (Optional)
    Cashier->>POS: Choose Payment Mode (Cash, UPI, Net Banking) & Click Complete Sale
    POS->>API: POST /api/billing (shopId, items, customerId, paymentMode)
    
    activate API
    API->>DB: Begin prisma.$transaction
    loop For Each Bill Item
        API->>DB: Check Product Stock >= Requested Quantity
        alt Insufficient Stock
            DB-->>API: Throw Stock Error
            API-->>POS: HTTP 400 (Insufficient Stock for Product)
        else Stock Available
            API->>DB: Decrement product.stock by quantity
            API->>DB: Calculate Subtotal + Split Tax (CGST 9% + SGST 9% or IGST)
        end
    end
    API->>DB: Generate Sequential Bill Number (INV-[SHOP]-[DATE]-[SEQ])
    API->>DB: Create Bill & BillItem Records
    API->>DB: Record StockMovement (Type: OUT)
    API->>DB: Commit Transaction
    deactivate API

    DB-->>API: Bill Created Successfully
    API-->>POS: HTTP 201 Created (Full Bill Object)
    POS->>Invoice: Render GST Invoice Modal
    Invoice-->>Cashier: Print Thermal Receipt or Download A4 PDF
```

### Procurement & Inwarding Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Store Manager / Owner
    participant Web as Suppliers & PO Page
    participant PO_API as Purchase Order API
    participant DB as Database (Prisma)
    participant Stock as Stock Ledger

    Manager->>Web: Create Purchase Order (Supplier, Order Date, Items, Cost Prices)
    Web->>PO_API: POST /api/purchase-orders
    PO_API->>DB: Save PO with Status = PENDING
    PO_API->>DB: Write AuditLog (Action: INSERT, Table: PurchaseOrder)
    PO_API-->>Web: PO Created

    Note over Manager,Web: Vendor dispatches goods to store
    Manager->>Web: Inspect shipment & Click "Mark as Received"
    Web->>PO_API: PATCH /api/purchase-orders/:id/status (status: RECEIVED)
    
    activate PO_API
    PO_API->>DB: Update PO Status to RECEIVED
    loop For each item in Purchase Order
        PO_API->>DB: Increment product.stock by received quantity
        PO_API->>DB: Update product.costPrice to latest purchase cost
        PO_API->>Stock: Create StockMovement record (Type: IN, Ref: PO-ID)
    end
    PO_API->>DB: Write AuditLog (Action: UPDATE, Table: PurchaseOrder)
    deactivate PO_API
    PO_API-->>Web: Inventory Automatically Updated & Inwarded
```

---

## 🛠️ Technology Stack

MartNexus is constructed using an industry-tested, modern JavaScript and TypeScript ecosystem without unnecessary abstractions:

### Frontend Architecture
- **Core Library**: React Single Page Application (SPA)
- **Build Tool & Bundler**: Vite with SWC React plugin for lightning-fast HMR and optimized chunk splitting
- **Routing**: React Router DOM (v6) with declarative route guards and transition flags
- **State Management**:
  - **Redux Toolkit**: Centralized store managing authentication sessions, active shop contexts, and UI state
  - **TanStack React Query**: Asynchronous server-state synchronization, cache invalidation, and background refetching
- **UI Components & Styling**:
  - **Tailwind CSS**: Utility-first styling with custom dark-mode gradients and HSL color variables
  - **Radix UI / Shadcn UI**: Unstyled, accessible primitives (Dialog, Tabs, Popover, Select, Tooltips, Accordions)
  - **Lucide React**: Clean, modern iconography
- **Data Visualization**: Recharts (Responsive Area Charts, Bar Charts, and Pie Charts for revenue and product metrics)
- **Hardware & Peripherals**: HTML5-QRCode for direct browser barcode & QR code camera scanning
- **Document Generation**: jsPDF and jsPDF-AutoTable for client-side GST invoice generation and thermal printing
- **Interactive Visuals**: Three.js rendering an animated 3D particle canvas on the landing page

### Backend Services
- **Runtime Environment**: Node.js
- **Application Framework**: Express.js
- **Database & ORM**: Prisma ORM with `@prisma/adapter-pg` driver and Supabase PgBouncer connection pooling
- **Scheduled Background Tasks**: Node-Cron running daily low-stock alerts and automated weekly database backups
- **Email Delivery**: Nodemailer supporting SMTP mail relay for 6-digit OTP codes, password recovery, and automated stock alerts
- **Export & Archive Utilities**:
  - **ExcelJS**: Multi-tab formatted spreadsheet workbook generator with numeric formulas and cell styling
  - **Archiver**: Streaming ZIP archive packaging for database JSON dumps and backups
- **Security & Authentication**:
  - **Bcrypt.js**: Salting and password hashing
  - **JSON Web Tokens (JWT)**: Stateless bearer token authentication with 24-hour token expiry
  - **CORS & Cookie Parser**: Strict whitelist cross-origin resource sharing configured for production and local environments

### Cloud Infrastructure
- **Web App Hosting**: Vercel (`https://mart-nexus.vercel.app`)
- **API Serverless Hosting**: Vercel (`https://mart-nexus-backend.vercel.app`)
- **Database Engine**: PostgreSQL hosted on Supabase Cloud

---

## 📦 Core Functional Modules

| Module | Technical Capability & Code Implementation |
| :--- | :--- |
| **Multi-Shop Architecture** | Multi-tenant shop hierarchy where a single authenticated user can establish and manage multiple shop outlets (`Shop` model). Allows on-the-fly shop switching from the top navigation bar with isolated inventory, billing numbers, customers, and financial reports per branch. |
| **Real-Time Inventory Engine** | Tracks stock quantity, unit metrics (`PIECES`, `KG`, `LITERS`), batch numbers, and expiry dates. Automatically flags low-stock items against custom reorder thresholds. Maintains an immutable stock ledger (`StockMovement`) logging all inward (`IN`), outward (`OUT`), and manual discrepancy (`ADJUSTMENT`) events. |
| **GST-Compliant POS Terminal** | High-speed point-of-sale checkout supporting instant product search, barcode scanner integration, cart management, and automatic tax calculations: CGST (50% of tax) + SGST (50% of tax) or IGST. Supports Cash, UPI, and Net Banking payment options. |
| **Invoicing & Print Engine** | Generates sequential, shop-coded tax invoices (e.g., `INV-NX01-20260913-0042`). Built-in printable invoice templates with shop GSTIN, customer details, tax breakup, and instantaneous vector PDF generation via `jsPDF`. |
| **Procurement & Purchase Orders** | End-to-end supplier directory with custom payment terms, supplier product catalogs, and Purchase Order tracking (`PENDING`, `ORDERED`, `RECEIVED`, `CANCELLED`). Marking a PO as `RECEIVED` automatically updates item purchase costs and increments shop inventory stock. |
| **Customer CRM & Contract Pricing** | Customer database recording contact information and custom global discount percentages. Supports product-specific custom contract pricing overrides (`CustomerPricing` model) for preferred B2B or wholesale clients. |
| **Reports & Business Analytics** | Real-time calculation of Total Revenue, Cost of Goods Sold (COGS), Gross Profit, Average Order Value (AOV), and Top-Performing Products. Generates downloadable Excel reports (`.xlsx`) via ExcelJS with styled headers, dates, and currency formats. |
| **Automated Background Schedulers** | `Node-Cron` routines executing daily at 9:00 AM to scan for products falling below their `reorderLevel` and dispatching HTML email alerts to store owners. Executes weekly automatic database backups every Sunday at 2:00 AM. Also exposes `/api/cron` endpoints for serverless Vercel cron triggers. |
| **Data Backup & Archival** | On-demand and automated full-database JSON backups, inventory exports, and sales history bundles compressed into downloadable `.zip` archives. Implements automatic cleanup maintaining the latest 10 backups to prevent storage bloat. |
| **Enterprise Audit Trail (RBAC)** | Granular database-level audit logging (`AuditLog` table) recording every `INSERT`, `UPDATE`, and `DELETE` event across products, purchase orders, customers, and shops, storing pre-change (`old_values`) and post-change (`new_values`) JSON snapshots. |

---

## 📸 Visual Showcase & Screenshots

All screenshots below represent the authentic, deployed MartNexus user interface:

### 1. Landing Page & 3D Interactive Hero
> Interactive WebGL 3D canvas built with Three.js showcasing platform capabilities, key operational metrics, and quick navigation.

<div align="center">
  <img src="./frontend/public/screenshots/01_landing_hero.png" alt="MartNexus Landing Hero" width="90%" />
</div>

---

### 2. Capabilities & Bento Feature Architecture
> Asymmetric bento grid presenting core capabilities: Real-time inventory control, GST POS billing, security auditing, and automated data resilience.

<div align="center">
  <img src="./frontend/public/screenshots/02_landing_capabilities.png" alt="MartNexus Capabilities" width="90%" />
</div>

---

### 3. Secure Authentication & Verification Portal
> Multi-factor registration and login interface enforcing strong password policies, 6-digit email OTP verification, and JWT session handling.

<div align="center">
  <img src="./frontend/public/screenshots/03_auth_login.png" alt="MartNexus Sign In" width="48%" />
  <img src="./frontend/public/screenshots/04_auth_register.png" alt="MartNexus Sign Up" width="48%" />
</div>

---

### 4. Operational Workflows & Retail Intelligence
> Specialized visuals illustrating MartNexus's security identity framework, real-time supply chain synchronization, and analytics dashboards.

<div align="center">
  <img src="./frontend/public/security_step.png" alt="Security Step" width="31%" />
  <img src="./frontend/public/inventory_step.png" alt="Inventory Step" width="31%" />
  <img src="./frontend/public/analytics_step.png" alt="Analytics Step" width="31%" />
</div>

---

## 🗄️ Database Schema & Data Model

The database is built on PostgreSQL and managed declaratively via Prisma ORM:

```mermaid
erDiagram
    User ||--o{ Shop : "owns"
    User ||--o{ UserRole : "assigned"
    
    Shop ||--o{ Category : "contains"
    Shop ||--o{ Product : "stocks"
    Shop ||--o{ Customer : "serves"
    Shop ||--o{ Supplier : "procures from"
    Shop ||--o{ PurchaseOrder : "issues"
    Shop ||--o{ Bill : "generates"
    
    Category ||--o{ Product : "categorizes"
    
    Product ||--o{ BillItem : "included in"
    Product ||--o{ StockMovement : "tracks"
    Product ||--o{ PurchaseOrderItem : "ordered in"
    Product ||--o{ CustomerPricing : "custom price"
    Product ||--o{ SupplierProduct : "supplied by"
    
    Customer ||--o{ Bill : "billed to"
    Customer ||--o{ CustomerPricing : "holds"
    
    Supplier ||--o{ PurchaseOrder : "receives"
    Supplier ||--o{ SupplierProduct : "catalog"
    
    PurchaseOrder ||--o{ PurchaseOrderItem : "contains"
    
    Bill ||--o{ BillItem : "contains"

    User {
        string id PK
        string email UK
        string password
        boolean isVerified
        string otp
        datetime otpExpires
        string role
        datetime createdAt
    }

    Shop {
        string id PK
        string ownerId FK
        string name
        string address
        string gstin
        string mobile
    }

    Product {
        string id PK
        string shopId FK
        string categoryId FK
        string name
        decimal costPrice
        decimal sellingPrice
        float stock
        float reorderLevel
        string sku
        string barcode
        enum quantityType
        boolean isActive
    }

    Bill {
        string id PK
        string shopId FK
        string customerId FK
        string billNumber UK
        decimal subTotal
        decimal taxAmount
        decimal cgst
        decimal sgst
        decimal igst
        decimal grandTotal
        enum paymentMode
        enum status
        datetime createdAt
    }

    BillItem {
        string id PK
        string billId FK
        string productId FK
        float quantity
        decimal price
        decimal taxAmount
    }

    StockMovement {
        string id PK
        string productId FK
        enum type "IN | OUT | ADJUSTMENT"
        float quantity
        string batchNumber
        datetime expiryDate
        string referenceNumber
    }

    PurchaseOrder {
        string id PK
        string shopId FK
        string supplier_id FK
        enum status "PENDING | ORDERED | RECEIVED | CANCELLED"
        decimal total_amount
        datetime order_date
        datetime expected_delivery_date
    }

    AuditLog {
        string id PK
        string table_name
        string action "INSERT | UPDATE | DELETE"
        string user_id
        string record_id
        json old_values
        json new_values
        datetime created_at
    }
```

---

## 📡 API Reference Directory

The backend exposes a clean, RESTful JSON API organized under `/api`:

### Authentication & Profile (`/api/auth`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account, hash password & dispatch 6-digit OTP email | No |
| `POST` | `/api/auth/verify-otp` | Validate submitted OTP, activate user account & issue JWT token | No |
| `POST` | `/api/auth/resend-otp` | Generate and resend fresh 6-digit OTP to user email | No |
| `POST` | `/api/auth/login` | Authenticate credentials and return signed 24h JWT token | No |
| `GET` | `/api/auth/me` | Retrieve profile and role metadata for active session | Bearer JWT |
| `PUT` | `/api/auth/update-profile` | Update user name and account email | Bearer JWT |
| `POST` | `/api/auth/change-password` | Verify existing password, store new hash & send email alert | Bearer JWT |
| `POST` | `/api/auth/forgot-password` | Issue cryptographically secure password reset token via email | No |
| `POST` | `/api/auth/reset-password` | Set new password using verified reset token | No |
| `GET` | `/api/auth/manage-users` | List all registered users and assigned roles (Admin only) | Bearer JWT |
| `GET` | `/api/auth/audit-logs` | Query system audit trail with table name, action & date filters | Bearer JWT |

### Shops & Outlets (`/api/shops`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/shops` | List all outlets owned by authenticated user | Bearer JWT |
| `POST` | `/api/shops` | Create new shop branch (Name, GSTIN, Address, Mobile) | Bearer JWT |
| `PUT` | `/api/shops/:id` | Update outlet details and tax registration credentials | Bearer JWT |
| `DELETE`| `/api/shops/:id` | Cascade delete shop and all associated catalog/sales data | Bearer JWT |

### Products & Categories (`/api/products` & `/api/categories`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/categories?shopId=:id` | Fetch product categories for specific shop | Bearer JWT |
| `POST` | `/api/categories` | Add a new category under active shop | Bearer JWT |
| `GET` | `/api/products?shopId=:id` | Fetch product catalog with category, stock, and pricing | Bearer JWT |
| `POST` | `/api/products` | Create product (SKU, barcode, prices, reorder levels) | Bearer JWT |
| `PUT` | `/api/products/:id` | Update product catalog entry | Bearer JWT |
| `DELETE`| `/api/products/:id` | Soft delete / remove product from catalog | Bearer JWT |

### Inventory & Stock Movements (`/api/inventory/movements`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/inventory/movements` | Query stock movement ledger for a product | Bearer JWT |
| `POST` | `/api/inventory/movements` | Record manual stock adjustment (`IN`, `OUT`, `ADJUSTMENT`) | Bearer JWT |

### POS, Billing & Invoices (`/api/billing`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/billing` | Execute transactional sale: decrement stock, calculate GST & create bill | Bearer JWT |
| `GET` | `/api/billing?shopId=:id` | Retrieve sales history with customer and line-item details | Bearer JWT |
| `GET` | `/api/billing/:id` | Fetch single bill details for reprint or PDF generation | Bearer JWT |

### Suppliers & Purchase Orders (`/api/suppliers` & `/api/purchase-orders`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/suppliers?shopId=:id` | List registered suppliers and contact details | Bearer JWT |
| `POST` | `/api/suppliers` | Register new supplier and payment terms | Bearer JWT |
| `GET` | `/api/purchase-orders?shopId=:id` | List purchase orders with line items and fulfillment status | Bearer JWT |
| `POST` | `/api/purchase-orders` | Generate new PO with order date, delivery date, and items | Bearer JWT |
| `PATCH`| `/api/purchase-orders/:id/status`| Update status; marking `RECEIVED` auto-increments stock | Bearer JWT |

### Reports & Analytics (`/api/reports` & `/api/dashboard`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/dashboard/stats?shopId=:id`| Aggregated metrics (Turnover, Orders, Growth %, Low Stock) | Bearer JWT |
| `GET` | `/api/reports/sales` | Detailed sales reports filtered by date range or preset periods | Bearer JWT |
| `GET` | `/api/reports/export/sales` | Download formatted multi-row Sales Report as Excel `.xlsx` | Bearer JWT |
| `GET` | `/api/reports/export/inventory`| Download complete Stock Summary Report as Excel `.xlsx` | Bearer JWT |
| `GET` | `/api/reports/export/gst` | Download GST Tax Liability Summary as Excel `.xlsx` | Bearer JWT |

### Backups & Schedulers (`/api/backup` & `/api/cron`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/backup/create` | Trigger manual full database or category backup ZIP | Bearer JWT |
| `GET` | `/api/backup/history` | List previous backups, file sizes, and completion statuses | Bearer JWT |
| `GET` | `/api/cron/low-stock` | Webhook for external serverless cron triggering low-stock scan | Secret / Cron |
| `GET` | `/api/cron/backup` | Webhook triggering automatic database backup generation | Secret / Cron |

---

## ⚙️ Getting Started & Local Setup

Follow these instructions to run MartNexus locally on your workstation:

### Prerequisites
- **Node.js**: LTS version installed
- **npm**: Package manager
- **PostgreSQL**: Local PostgreSQL instance OR a cloud PostgreSQL database (e.g. Supabase)
- **SMTP Credentials**: Gmail App Password or SMTP provider (for email OTPs and alerts)

---

### 1. Backend Setup

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development

   # Database Connection Strings (PostgreSQL or Supabase)
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/martnexus?schema=public"
   DIRECT_URL="postgresql://postgres:your_password@localhost:5432/martnexus"

   # Supabase Credentials (Optional for local, required for Supabase Auth/Storage)
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-supabase-anon-key"

   # Authentication Secret
   JWT_SECRET="your_long_random_jwt_secret_key_123"

   # SMTP Email Configuration (Gmail, Resend, or SendGrid)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_16_character_app_password"

   # Frontend Application URL (Used for generating email links)
   FRONTEND_URL="http://localhost:3000"
   ```

3. Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be live at `http://localhost:5000`.

---

### 2. Frontend Setup

1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Create a `.env` file in the `frontend/` directory:
   ```env
   # Backend API Endpoint
   VITE_API_URL="https://mart-nexus-backend.vercel.app/api"

   # App Public URL
   VITE_APP_URL="https://martnexus.vercel.app"

   # Supabase Client Configuration
   VITE_SUPABASE_PROJECT_ID="your_project_id"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
   ```
   > **Note for Local Backend Testing**: If you wish to connect your local frontend to your local backend, set `VITE_API_URL="http://localhost:5000/api"`. For production, point it to your deployed Vercel backend URL.

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` to interact with MartNexus.

---

### Environment Variables Reference

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `PORT` | Backend | Port on which the Express server listens (default: `5000`) |
| `DATABASE_URL` | Backend | PostgreSQL connection URI with connection pooler parameter |
| `DIRECT_URL` | Backend | Direct PostgreSQL URI for schema migrations |
| `JWT_SECRET` | Backend | Secret string used to sign and verify JSON Web Tokens |
| `EMAIL_HOST` | Backend | SMTP host server (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | Backend | SMTP port (typically `587` for TLS or `465` for SSL) |
| `EMAIL_USER` | Backend | SMTP username / sender email address |
| `EMAIL_PASS` | Backend | App-specific password or API key for the mail provider |
| `FRONTEND_URL` | Backend | Base client URL used in email reset links |
| `VITE_API_URL` | Frontend | Base URL of the REST API (e.g., `https://mart-nexus-backend.vercel.app/api`) |
| `VITE_SUPABASE_URL` | Frontend | Supabase project API gateway URL |

---

## 🚀 Production Deployment

MartNexus is optimized for production deployment on **Vercel** with **Supabase PostgreSQL**:

### Backend Deployment (Vercel Serverless)
1. Import the `backend/` directory into a new Vercel Project.
2. Configure **Framework Preset**: `Other`.
3. Add all variables from `backend/.env` into **Project Settings > Environment Variables**.
4. Deploy. Vercel routes all requests via `backend/vercel.json` to `index.js`.
5. *Note on Background Schedulers*: In serverless hosting (where instances sleep), long-running Node processes like `cron.schedule` are replaced by calling the `/api/cron/low-stock` and `/api/cron/backup` endpoints via an external cron service (e.g. Vercel Cron or cron-job.org).

### Frontend Deployment (Vercel SPA)
1. Import the `frontend/` directory into a new Vercel Project.
2. Configure **Framework Preset**: `Vite`.
3. Set `VITE_API_URL` to your live Backend URL (`https://mart-nexus-backend.vercel.app/api`).
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Deploy. Rewrites in `frontend/vercel.json` ensure smooth client-side routing for React Router DOM.

---

## 🛡️ Security & Compliance Architecture

- **Password Hashing**: Bcrypt with 10 salt rounds and client-side password strength validation (minimum 8 characters, uppercase, lowercase, digit, and special character).
- **Stateless Authorization**: JWT bearer tokens signed with cryptographic secrets and validated via `authMiddleware.js`.
- **Database Transaction Isolation**: Critical financial and inventory operations use Prisma transactions (`prisma.$transaction`) to enforce ACID compliance and prevent inventory overselling.
- **Enterprise Auditing**: Changes to critical entities are written to the `AuditLog` table, capturing previous and updated states for full forensic tracking.
- **Data Protection & Resiliency**: Automated weekly database exports and structured Excel backups safeguard against data loss.

---

## 📂 Project Directory Structure

```
MartNexus/
├── backend/
│   ├── index.js                  # Express application entry, CORS & route binding
│   ├── package.json              # Backend dependencies & build scripts
│   ├── vercel.json               # Serverless rewrite configuration for Vercel
│   ├── prisma/
│   │   └── schema.prisma         # Database schema & entity definitions
│   └── src/
│       ├── controllers/          # Business logic controllers
│       │   ├── backupController.js        # Full DB & Excel backup logic
│       │   ├── dashboardController.js     # Sales analytics & metric calculations
│       │   └── notificationController.js  # Alert dispatch and log storage
│       ├── middleware/
│       │   └── authMiddleware.js # JWT validation & role verification
│       ├── routes/               # Modular REST endpoints
│       │   ├── authRoutes.js              # Register, login, OTP, profile, audit logs
│       │   ├── billingRoutes.js           # POS checkout & transaction execution
│       │   ├── customerRoutes.js          # Customer management & custom pricing
│       │   ├── productRoutes.js           # Catalog, barcode, and pricing
│       │   ├── purchaseOrderRoutes.js     # PO procurement and stock inwarding
│       │   ├── reports.js                 # Revenue calculations & Excel exports
│       │   ├── shopRoutes.js              # Multi-outlet management
│       │   ├── stockMovementRoutes.js     # Granular stock audit ledger
│       │   └── supplierRoutes.js          # Vendor directory
│       ├── scheduler/            # Automated background jobs
│       │   ├── backupScheduler.js         # Weekly automated backup cron
│       │   └── lowStockMonitor.js         # Daily low-stock scanning & email alerts
│       └── utils/                # Helper utilities
│           ├── emailService.js            # Nodemailer templates (OTP, Alerts)
│           ├── excelExport.js             # ExcelJS workbook formatting
│           └── prismaClient.js            # Prisma connection pooler instance
│
├── frontend/
│   ├── index.html                # Single page application HTML root
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vite.config.js            # Vite build & alias configuration
│   ├── public/                   # Static media assets & screenshots
│   │   ├── martnexus.png         # Brand logo
│   │   ├── screenshots/          # Real application UI screenshots
│   │   │   ├── 01_landing_hero.png
│   │   │   ├── 02_landing_capabilities.png
│   │   │   ├── 03_auth_login.png
│   │   │   └── 04_auth_register.png
│   │   ├── analytics_step.png    # Analytics visual
│   │   ├── inventory_step.png    # Inventory visual
│   │   └── security_step.png     # Security visual
│   └── src/
│       ├── App.jsx               # Client-side router & authentication listener
│       ├── index.css             # Tailwind design tokens & dark-mode styling
│       ├── components/           # Reusable UI component library
│       │   ├── Barcode/          # HTML5-QRCode camera scanner component
│       │   ├── Dashboard/        # Charts (Recharts), KPI cards, top products
│       │   ├── Inventory/        # Stock movement forms, low-stock widgets
│       │   ├── Invoice/          # GST invoice generator & PDF exporter
│       │   ├── Layout/           # AppLayout, AppSidebar, TopBar
│       │   ├── POS/              # POS Cart, product search, checkout modal
│       │   ├── Reports/          # Date pickers, revenue charts, GST summary
│       │   ├── Suppliers/        # PO creation and supplier directory
│       │   └── ui/               # Radix UI primitives & Shadcn components
│       ├── hooks/                # Custom React query & API integration hooks
│       ├── lib/                  # Axios HTTP client with auth interceptors
│       ├── pages/                # Top-level view controllers (POS, Reports, etc.)
│       └── store/                # Redux Toolkit store & state slices
│
└── README.md                     # Comprehensive project documentation
```

---

## 📄 License & Authors

- **Author**: [Aryan Mittal](https://github.com/heyaryanmittal)
- **Live Platform**: [mart-nexus.vercel.app](https://mart-nexus.vercel.app)
- **Backend API**: [mart-nexus-backend.vercel.app](https://mart-nexus-backend.vercel.app)
- **License**: Proprietary software. All rights reserved.
