# 🛍️ E-Commerce Website — Modern Full-Stack Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red.svg)](https://www.sqlalchemy.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**E-Commerce Website** is a complete, production-grade monolithic full-stack e-commerce web application inspired by commercial platforms like Amazon and Flipkart. Built with a modern **React (Vite) + Python FastAPI + MySQL/SQLAlchemy** architecture, it delivers a smooth shopping experience with end-to-end transactional checkout, secure JWT authentication, inventory concurrency control, dynamic PDF invoices, and an enterprise SaaS Admin Dashboard with live database aggregations.

---

## 🌟 Key Features

### 🛒 Customer-Facing Storefront
- **Promotional Homepage**: Hero mega sale banner, curated categories (Electronics, Fashion, Home & Living, Beauty, Sports, Books), featured collections, trending products, and bestsellers.
- **Advanced Catalog & Search**: Real-time keyword search, category filtering, min/max price range sliders, star rating filter, in-stock only toggle, and 5-way sorting (newest, popularity, rating, price low-to-high, price high-to-low).
- **Product Details & Gallery**: Multiple high-resolution product images with interactive thumbnail switcher, discount badges, live stock indicator, detailed technical specifications, quantity selector, and related products recommendations.
- **Ratings & Reviews**: Real user reviews with 1–5 star ratings, feedback comments, and real-time aggregate recalculation.
- **Shopping Cart**: Real-time item subtotal, discount, and free shipping threshold calculations. Enforces real inventory boundaries to prevent adding items beyond available stock.
- **Wishlist**: Save favorite items, remove, or transfer items directly to cart.
- **🤖 ShopBot — AI Shopping Assistant (Google Gemini)**:
  - Floating circular launcher widget at bottom-right corner across all customer pages.
  - Natural conversation powered by official Google Gemini SDK (`google-genai` and `gemini-2.5-flash`).
  - Real-time product search, budget filtering, and recommendation cards directly from MySQL inventory.
  - Interactive side-by-side product comparisons with specification table and AI decision verdict.
  - Authenticated order tracking with status milestones (guards customer privacy).
  - Add-to-cart assistance with safety confirmation dialog before modifying cart state.
  - Customer support and FAQ retrieval on returns (7-day replacement), refunds (5-7 days), warranty, and shipping.
- **Multi-Step Checkout**:
  1. *Delivery Address*: Select saved addresses or add and validate a new one.
  2. *Payment Method*: Choose Simulated Instant Payment (safe test mode), UPI, Credit/Debit Card, or Cash on Delivery (COD).
  3. *Order Review*: Full breakdown of items, quantities, discounts, and delivery charges.
  4. *Order Confirmation*: Instant confirmation with unique order number (`SS-YYYYMMDDHHMM-XXXXXX`) and transaction details.
- **Order Management & Invoices**: Track status milestones (*Pending &rarr; Confirmed &rarr; Processing &rarr; Shipped &rarr; Delivered*), cancel eligible orders with automated inventory restoration, and download official PDF tax invoices.
- **User Profile**: Update profile details, change passwords securely, and manage multiple shipping addresses.

### 🛡️ Enterprise SaaS Admin Portal
- **Real-Time KPI Cards**: Total Sales, Total Orders, Total Customers, Catalog SKUs, Pending Fulfillments, and Low Stock Alerts queried straight from the database.
- **Analytics & Charts**: 14-day daily sales revenue chart, category distribution progress breakdown, and order status distribution.
- **Product Management**: Add, edit, price, discount, restock, toggle status, and delete products with image previews.
- **Category Management**: Create, edit, and organize storefront product categories.
- **Order Processing**: Live order search, filter by fulfillment status, update order statuses, and inspect snapshots.
- **Customer Control**: Search registered users, view order frequency, and activate or suspend customer accounts.
- **Sales & Financial Reports**: Granular daily and monthly reports with Gross Sales, Discounts Given, and Net Realized Revenue.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, React Router DOM v6, Axios, Context API, Lucide React Icons, Custom CSS Design System |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic Migrations, PyJWT, bcrypt, ReportLab (PDFs) |
| **Database** | MySQL 8+ (or SQLite out-of-the-box local zero-config fallback) |
| **Security** | bcrypt password hashing, JWT bearer tokens, RBAC (customer/admin), CORS, transactional row-locking |
| **Testing** | Pytest (11 unit/integration test cases passing) |

---

## 🏛️ Monolithic Clean Modular Architecture

```
Ecommerce_Website/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry point, CORS, routes & exception handling
│   │   ├── config.py              # Pydantic BaseSettings configuration
│   │   ├── database.py            # SQLAlchemy database engine & session dependency
│   │   ├── models/                # SQLAlchemy ORM models (User, Product, Order, etc.)
│   │   ├── schemas/               # Pydantic v2 schemas for request & response validation
│   │   ├── repositories/          # Database query operations & aggregations
│   │   ├── services/              # Business logic (Auth, Cart, Order, Payments)
│   │   ├── dependencies/          # OAuth2 bearer token & admin RBAC guards
│   │   ├── routes/                # Modular REST API endpoints
│   │   └── utils/                 # Security (bcrypt, JWT), slugify, order number generators
│   ├── alembic/                   # Database migration environment & versions
│   ├── tests/                     # Pytest automated test suite
│   ├── seed_data.py               # Comprehensive 36-product database seeder
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env.example               # Backend environment variables template
│   └── .env                       # Local backend environment
├── frontend/
│   ├── src/
│   │   ├── admin/                 # Admin Dashboard, Products, Orders, Customers, Reports
│   │   ├── components/            # Reusable Navbar, Footer, ProductCard, Modal, Pagination, etc.
│   │   ├── context/               # Global state (Auth, Cart, Wishlist, Toast)
│   │   ├── pages/                 # Customer pages (Home, Products, Details, Cart, Checkout, etc.)
│   │   ├── services/              # Axios API client integrations
│   │   ├── styles/                # Brand variables & responsive CSS design system
│   │   ├── App.jsx                # Router configuration & protected routes
│   │   └── main.jsx               # React DOM entry point
│   ├── package.json               # Frontend dependencies & scripts
│   ├── vite.config.js             # Vite development server & proxy configuration
│   └── .env.example               # Frontend environment template
├── run_dev.bat                    # One-click Windows launch script
├── run_dev.ps1                    # PowerShell multi-process launch script
└── README.md                      # Comprehensive project documentation
```

---

## 💾 Database Schema (13 Normalized Tables)

1. **`users`**: Customer and Admin accounts (`email`, `hashed_password`, `role`, `is_active`, `phone_number`).
2. **`categories`**: Store categories with unique slugs, descriptions, and cover image URLs.
3. **`products`**: Product catalog (`name`, `slug`, `category_id`, `price`, `original_price`, `discount_percent`, `stock`, `rating`, `thumbnail`).
4. **`product_images`**: Secondary product gallery images with primary flags.
5. **`addresses`**: User shipping addresses with default address designations.
6. **`cart`**: Active persistent shopping cart per user.
7. **`cart_items`**: Cart line items linked to products with quantity constraints.
8. **`wishlist`**: Saved items per user.
9. **`wishlist_items`**: Wishlist line items.
10. **`orders`**: Transactional orders (`order_number`, `status`, `subtotal`, `discount_amount`, `delivery_charge`, `total_amount`, `payment_method`, `payment_status`, `shipping_address_snapshot`).
11. **`order_items`**: Order line items capturing snapshot product name, image, and purchase price.
12. **`payments`**: Payment transaction logs with gateway responses.
13. **`reviews`**: Product ratings (1–5) and customer feedback comments.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+** installed
- **Node.js v18+** & **npm** installed
- *(Optional)* **MySQL 8+** (If MySQL is not installed, the application automatically runs on the included zero-config SQLite mode).

---

### Step 1: Database & Backend Setup

1. Open a terminal in the root directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `backend/.env`:
   ```ini
   PROJECT_NAME=E-Commerce Website
   ENV=development
   DEBUG=True
   SECRET_KEY=shopsphere_super_secret_jwt_key_change_in_production_983742918347
   ACCESS_TOKEN_EXPIRE_MINUTES=1440

   # MySQL Connection:
   # DATABASE_URL=mysql+pymysql://root:password@localhost:3306/shopsphere_db

   # Or Zero-Config Local SQLite Mode:
   DATABASE_URL=sqlite:///./shopsphere.db

   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173
   DEFAULT_ADMIN_EMAIL=admin@shopsphere.com
   DEFAULT_ADMIN_PASSWORD=Admin@123456

   # AI Chatbot (Google Gemini API via Google AI Studio)
   GEMINI_API_KEY=your_actual_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```

   > **Note on Gemini API**: Obtain your key from [Google AI Studio](https://aistudio.google.com/). Paste your key into `GEMINI_API_KEY`. If unset, ShopBot automatically engages an intelligent local semantic engine so the chatbot remains fully testable and responsive.

5. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```

6. Seed initial demo data (36 products, 6 categories, demo users, sample orders & reviews):
   ```bash
   python seed_data.py
   ```

7. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - REST API Base: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`
   - ReDoc Documentation: `http://localhost:8000/redoc`

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start Vite development server:
   ```bash
   npm run dev
   ```
   - Application URL: `http://localhost:3000`

---

## 🔑 Demo Login Credentials

For quick local evaluation, you can use the pre-seeded accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@shopsphere.com` | `Admin@123456` | Full Admin Console, Catalog CRUD, Order Management, Customer toggles, Reports |
| **Customer** | `john@example.com` | `Password@123` | Browsing, Cart, Checkout, Order Tracking, PDF Invoices, Wishlist, Reviews |

> **Pro Tip**: The login page includes convenient **"Admin Demo"** and **"Customer Demo"** quick-fill buttons for instant testing.

---

## 🧪 Automated Testing

Run the Pytest suite inside the `backend` folder:
```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

All 11 backend test suites cover:
- User registration & password confirmation validation
- User authentication & invalid credential rejection
- Protected JWT profile retrieval
- Product catalog search, category filtering & price pagination
- Role-based authorization (customer cannot create products)
- Cart calculations, stock threshold violations & removals
- Transactional order creation, inventory deduction & cancellation inventory rollback
- Admin dashboard KPI aggregations & forbidden customer access
- **Gemini AI Chatbot (`test_gemini_chatbot.py`)**:
  - Live product database search & budget-constrained filtering
  - Best deals & discount ranking
  - Side-by-side product comparisons & spec matrix
  - Customer order privacy & unauthenticated tracking refusal
  - Authenticated order milestone tracking
  - Store FAQ & policy retrieval (7-day replacement, 5-7 day refunds)
  - Interactive cart confirmation flow
  - Session conversation reset

---

## 📄 API Documentation

When the backend is running, open your browser to:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📜 License
This project is open-source under the MIT License.

