# MartNexus

**GST-Enabled Inventory & Billing Management System**

MartNexus is a comprehensive solution designed to digitize inventory, billing, and reporting for small to medium-sized retail businesses. It replaces manual registers with a modern, automated system that is simple, reliable, and scalable.

---

## 🚀 Features

- **Inventory Management**: Real-time stock tracking, low stock alerts, and barcode support.
- **Billing & POS**: GST-compliant billing with support for CGST, SGST, and IGST.
- **Multi-Shop Management**: Manage multiple shops and inventories from a single owner account.
- **Reports & Analytics**: Insights into sales, revenue, and best-selling products.
- **Data Export**: Export inventory, bills, and reports to Excel for offline analysis.
- **User Management**: Secure authentication, profile management, and role-based access.
- **Supplier & Customer Management**: Track supplier orders (Purchase Orders) and customer history.
- **Backup System**: Automated backups and manual export options.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, Shadcn UI / Radix UI
- **State Management**: Redux Toolkit, React Query
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) project (for PostgreSQL database)

---

## ⚙️ Installation & Local Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MartNexus
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/db"
DIRECT_URL="postgresql://user:password@host:port/db?pgbouncer=true"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
JWT_SECRET="your_secure_jwt_secret"
NODE_ENV="development"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_specific_password"
FRONTEND_URL="http://localhost:3000"
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
num run dev
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

Start the application:
```bash
npm run dev
```

---

## 🚀 Deployment (Vercel)

This project is optimized for deployment on Vercel.

### Backend Deployment
1.  Deploy the `backend` directory as a new project on Vercel.
2.  Set the Framework Preset to **Other**.
3.  Add all environment variables from `backend/.env` to the Vercel project settings.

### Frontend Deployment
1.  Deploy the `frontend` directory as a new project on Vercel.
2.  Set the Framework Preset to **Vite**.
3.  Add the `VITE_API_URL` environment variable, setting it to your deployed Backend URL (e.g., `https://your-backend.vercel.app/api`).

---

## � Project Structure

```
MartNexus/
├── backend/
│   ├── prisma/           # Database schema
│   ├── src/
│   │   ├── controllers/  # Logic
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & error handling
│   │   └── services/     # Email & Helpers
│   └── index.js          # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # UI/UX
│   │   ├── pages/        # Views
│   │   ├── store/        # Redux State
│   │   └── hooks/        # React Hooks
│   └── index.html
└── README.md
```

---

## �️ License

This project is proprietary software.
