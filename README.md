# 🛍️ E-Commerce Website

A modern full-stack e-commerce application built using **React.js, Python FastAPI, and MySQL**, featuring an AI-powered shopping assistant integrated with **Google Gemini API**.

The platform provides a complete online shopping experience, including product discovery, secure authentication, shopping cart, wishlist, checkout, order management, and an administrative dashboard.

---

## 🌟 Key Features

### 🛒 Customer Storefront

- **Homepage:** Promotional banners, featured products, categories, trending products, and bestsellers.
- **Product Catalog:** Product search, category filtering, price range filtering, rating filters, and sorting.
- **Product Details:** Product images, specifications, discount information, stock availability, and related products.
- **Ratings & Reviews:** Customer reviews and product ratings.
- **Shopping Cart:** Add, remove, and update products with automatic price calculations.
- **Wishlist:** Save favorite products and transfer them to the shopping cart.
- **Checkout:** Multi-step checkout with address selection, payment method selection, and order review.
- **Order Management:** Order history, order tracking, cancellation, and PDF invoices.
- **User Profile:** Profile management, password updates, and shipping address management.

### 🤖 ShopBot – AI Shopping Assistant

An AI-powered shopping assistant integrated using Google Gemini API.

Features include:

- Natural-language shopping conversations.
- AI-powered product recommendations.
- Budget-based product discovery.
- Product comparison.
- Best deals and discounted product discovery.
- Authenticated customer order tracking.
- Shopping cart assistance with confirmation before modifications.
- Wishlist assistance.
- Customer support and FAQ assistance.
- Context-aware follow-up conversations.

ShopBot uses backend services to retrieve actual product and customer information from the database.

### 🛡️ Admin Dashboard

- Sales and order statistics.
- Dashboard KPI cards.
- Sales analytics and charts.
- Product management.
- Category management.
- Inventory and stock management.
- Order processing and status updates.
- Customer management.
- Sales and financial reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML, CSS |
| Routing | React Router DOM |
| State Management | React Context API |
| API Integration | Axios |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Database | MySQL / SQLite |
| Authentication | JWT, bcrypt |
| AI Integration | Google Gemini API |
| AI SDK | Google Gen AI SDK (`google-genai`) |
| Testing | Pytest |
| Version Control | Git, GitHub |

---

## 🏗️ Project Architecture

```text
E-Commerce-Website/
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
│   ├── tests/
│   ├── seed_data.py
│   ├── requirements.txt
│   └── .env.example
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
├── .gitignore
└── README.md
```

---

## 💾 Database Schema

The documented database design includes the following tables:

| Table | Description |
|---|---|
| `users` | Customer and administrator accounts |
| `categories` | Product categories |
| `products` | Product catalog and inventory |
| `product_images` | Product image gallery |
| `addresses` | Customer shipping addresses |
| `cart` | Shopping cart |
| `cart_items` | Cart products and quantities |
| `wishlist` | Customer wishlist |
| `wishlist_items` | Wishlist products |
| `orders` | Customer orders |
| `order_items` | Order product details |
| `payments` | Payment transaction records |
| `reviews` | Product ratings and reviews |

---

## 🚀 Installation and Setup

### Prerequisites

- Python 3.11 or above
- Node.js 18 or above
- npm
- MySQL 8 or above (optional if using SQLite)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Ashmit565/E-Commerce-Website.git
```

Navigate into the project:

```bash
cd E-Commerce-Website
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Example configuration:

```env
PROJECT_NAME=E-Commerce Website
ENV=development
DEBUG=True

SECRET_KEY=replace_with_a_secure_random_secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# MySQL Database
DATABASE_URL=mysql+pymysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/YOUR_DATABASE

# Alternatively, use SQLite if supported by your configuration
# DATABASE_URL=sqlite:///./shopsphere.db

CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_selected_gemini_model
```

**Important:**

- Replace database placeholders with your local database credentials.
- Generate a secure JWT secret.
- Obtain your Gemini API key from [Google AI Studio](https://aistudio.google.com/).
- Configure a Gemini model supported by your API key.
- Never commit your actual `.env` file to GitHub.

### 4. Database Setup

Run the following command if your project uses Alembic migrations:

```bash
alembic upgrade head
```

If initial demo data is required:

```bash
python seed_data.py
```

### 5. Start the Backend

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
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

Start the frontend:

```bash
npm run dev
```

Open the URL displayed in your terminal. The Vite development server may use port 3000 or 5173, depending on your configuration.

---

## 🤖 Google Gemini API Integration

ShopBot uses Google's official Gen AI Python SDK.

Install the SDK:

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

Useful resources:

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)

---

## 🔐 Security and Configuration

The application uses security mechanisms such as:

- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based access control.
- Protected customer and administrator routes.
- Backend request validation.
- Environment-based configuration.
- User-specific access to protected resources.

Security guidelines:

- Never publish API keys or database passwords.
- Never commit `.env` files.
- Keep `.env.example` free of actual secrets.
- Use strong JWT secrets.
- Do not publish customer information or private configuration files.
- Change development credentials before deployment.

This repository does not publish administrator or customer login credentials.

---

## 🧪 Running Tests

Run backend tests from the backend directory:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -v
```

Run the frontend production build:

```bash
cd frontend
npm run build
```

Review the actual test output to identify failures and confirm which features have been verified.

---

## 🔮 Future Enhancements

- Advanced AI-powered personalized recommendations.
- Product recommendations based on purchase history.
- Real payment gateway integration.
- Email and order notifications.
- Advanced analytics and reporting.
- Enhanced AI customer support.
- Cloud deployment.

---

**Built with React.js, FastAPI, MySQL, and Google Gemini AI.**
