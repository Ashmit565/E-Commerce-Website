# 🛍️ E-Commerce Website

A modern full-stack e-commerce application built using **React.js, FastAPI, Python, and MySQL**, featuring an AI-powered shopping assistant using **Google Gemini API**.

The application provides a complete online shopping experience with product discovery, authentication, shopping cart, wishlist, checkout, order management, and an admin dashboard.

## 🚀 Key Features

### 🛒 Customer Storefront

- Modern promotional homepage with featured products and categories.
- Product catalog with search and filtering.
- Category-based product browsing.
- Price range and rating filters.
- Product sorting by price, rating, popularity, and newest.
- Detailed product pages with image galleries.
- Product ratings and customer reviews.
- Shopping cart with quantity and price calculations.
- Wishlist management.
- Multi-step checkout.
- User profile and address management.
- Order history and tracking.
- PDF invoice generation.

### 🤖 ShopBot – AI Shopping Assistant

An AI-powered shopping assistant integrated using Google's Gemini API.

Features include:

- Natural-language shopping conversations.
- AI-based product recommendations.
- Budget-based product search.
- Product comparisons.
- Best deals and discounted product discovery.
- Authenticated order tracking.
- Cart assistance with confirmation before modifications.
- Customer support and FAQ assistance.
- Context-aware follow-up conversations.

ShopBot uses backend services to retrieve actual product and customer information from the database.

### 🛡️ Admin Dashboard

- Dashboard with sales and order statistics.
- Total sales and customer metrics.
- Product and category management.
- Inventory and stock management.
- Order management and status updates.
- Customer management.
- Sales reports and analytics.
- Daily and monthly revenue summaries.

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML, CSS |
| Routing | React Router DOM |
| State Management | React Context API |
| API Integration | Axios |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Database | MySQL |
| Authentication | JWT, bcrypt |
| AI Integration | Google Gemini API |
| AI SDK | Google Gen AI SDK (`google-genai`) |
| Database Migrations | Alembic |
| PDF Generation | ReportLab |
| Testing | Pytest |
| Version Control | Git, GitHub |

## 🏗️ Project Architecture

```text
Ecommerce_Website/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── dependencies/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── alembic/
│   ├── tests/
│   ├── seed_data.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── run_dev.bat
├── run_dev.ps1
└── README.md
```

*The structure above describes the documented project architecture. Adjust it if your actual repository differs.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3.11 or above.
- Node.js 18 or above.
- npm.
- MySQL 8 or above (if using MySQL).
- Git.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Ecommerce_Website
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Use the following configuration as a template:

```env
PROJECT_NAME=E-Commerce Website
ENV=development
DEBUG=True

SECRET_KEY=replace_with_a_secure_random_secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DATABASE_URL=mysql+pymysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/YOUR_DATABASE

CORS_ORIGINS=http://localhost:3000,http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

**Important:**

- Replace the database credentials with your own.
- Generate a secure JWT secret.
- Obtain your Gemini API key from [Google AI Studio](https://aistudio.google.com/).
- Configure the Gemini model supported by your API key.
- Never upload your actual `.env` file to GitHub.

If your application uses SQLite as a local fallback, configure the database URL according to your existing backend configuration.

### 4. Database Setup

Make sure your MySQL server is running and your database has been created.

Run the database migrations:

```bash
alembic upgrade head
```

Populate initial demo data if required:

```bash
python seed_data.py
```

### 5. Start the Backend

Run:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URL:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 6. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal. It may be:

```text
http://localhost:3000
```

or:

```text
http://localhost:5173
```

## 🔑 Google Gemini API Integration

ShopBot uses Google's Gemini API for AI-powered conversations.

The integration uses the official Python SDK:

```bash
pip install -U google-genai
```

Example client initialization:

```python
import os
from google import genai

client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)
```

The API key must remain on the backend.

**Security guidelines:**

- Never expose the Gemini API key in React code.
- Never commit `.env` files.
- Do not print API keys in application logs.
- Use `.env.example` with placeholder values.
- Follow Google's API usage limits and pricing policies.

Useful resources:

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)

## 🗄️ Database Design

The documented database schema includes the following tables:

| Table | Purpose |
|---|---|
| users | Customer and administrator accounts |
| categories | Product categories |
| products | Product catalog |
| product_images | Product image gallery |
| addresses | Customer shipping addresses |
| cart | Shopping cart |
| cart_items | Cart products and quantities |
| wishlist | Customer wishlist |
| wishlist_items | Wishlist products |
| orders | Customer orders |
| order_items | Order product details |
| payments | Payment transaction records |
| reviews | Product ratings and reviews |

## 🔐 Authentication and Security

The application uses:

- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based access control.
- Protected customer and administrator routes.
- Backend request validation.
- User-specific order and cart access.
- Environment-based configuration for sensitive values.

## 🧪 Running Tests

Run the backend tests from the backend directory:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -v
```

Run frontend checks using the scripts available in your `package.json`, for example:

```bash
cd frontend
npm run build
```

Check the actual test output before treating the application as fully tested.

## 🔌 API Documentation

Once the FastAPI backend is running, access:

| Documentation | URL |
|---|---|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

These pages provide interactive API documentation for available backend endpoints.

## 🔒 GitHub Security Checklist

Before pushing your project to GitHub:

- [ ] Add `.env` to `.gitignore`.
- [ ] Never commit API keys or database passwords.
- [ ] Replace default JWT secrets.
- [ ] Remove real customer information.
- [ ] Change or remove demo credentials.
- [ ] Keep `.env.example` free of actual secrets.
- [ ] Verify that no private configuration files are staged.

Example `.gitignore` entries:

```gitignore
# Environment variables
.env
.env.*
!.env.example

# Python
__pycache__/
*.py[cod]
venv/
.venv/
.pytest_cache/

# Frontend
node_modules/
dist/

# Database
*.db
*.sqlite3

# IDE
.idea/
.vscode/

# Logs
*.log
```

Review the existing `.gitignore` before replacing it so you do not remove useful project-specific rules.

## 🚀 Future Enhancements

Potential improvements include:

- Enhanced AI-powered personalized recommendations.
- Product recommendation based on purchase history.
- Real payment gateway integration.
- Email and order notifications.
- Advanced analytics and reporting.
- Improved AI customer support.
- Deployment to cloud infrastructure.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Built with React.js, FastAPI, MySQL, and Google Gemini AI.**