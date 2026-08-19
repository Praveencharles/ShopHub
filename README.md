# ShopHub - E-Commerce Platform

A full-stack e-commerce application built with Django REST Framework and React (Vite).

## Features

- **User System**: Registration, login, JWT authentication, password reset
- **Product Catalog**: Categories, brands, search, filter, sort, pagination
- **Shopping Cart**: Add/remove/update items, quantity controls
- **Wishlist**: Save favorites, move items to cart
- **Checkout**: Address selection, multiple payment methods (Razorpay, Stripe, COD)
- **Order Management**: Order history, status tracking, cancellation
- **Admin Dashboard**: Sales analytics, revenue charts, product/order/inventory management
- **Reviews & Ratings**: Verified purchase reviews, star ratings
- **Responsive Design**: Mobile-first Tailwind CSS UI

## Tech Stack

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL
- **Auth**: JWT (SimpleJWT) with refresh token rotation
- **Payments**: Stripe, Razorpay
- **Task Queue**: Celery + Redis
- **Docs**: drf-yasg (Swagger/Redoc)

### Frontend
- **Framework**: React 18 + Vite
- **State**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP**: Axios with JWT interceptor
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: React Icons (Feather)
- **Payments**: Stripe Elements, Razorpay SDK

## Project Structure

```
Ecomm/
├── backend/
│   ├── ecommerce/          # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── exceptions.py
│   │   └── pagination.py
│   ├── apps/
│   │   ├── accounts/       # User auth, profiles, addresses
│   │   ├── products/       # Products, categories, brands, wishlist
│   │   ├── cart/           # Shopping cart
│   │   ├── orders/         # Orders, order items
│   │   ├── payments/       # Stripe & Razorpay integration
│   │   ├── reviews/        # Product reviews & ratings
│   │   └── dashboard/      # Admin analytics
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API modules
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route pages (public, customer, admin)
│   │   ├── redux/          # Redux store & slices
│   │   ├── utils/          # Helpers & validators
│   │   └── styles/         # Tailwind CSS
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── .gitignore
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis (optional, for Celery)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit .env with your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env       # Edit .env if needed
npm run dev
```

### Docker Setup

```bash
docker-compose up -d --build
```

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/api/auth/` | Authentication, profile, addresses, password |
| `/api/products/` | Products, categories, brands |
| `/api/wishlist/` | Wishlist management |
| `/api/cart/` | Shopping cart |
| `/api/orders/` | Order management |
| `/api/payments/` | Payment processing |
| `/api/reviews/` | Product reviews |
| `/api/dashboard/` | Admin analytics |
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc docs |
| `/admin/` | Django Admin |

## Environment Variables

### Backend (`backend/.env`)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `DB_*` - PostgreSQL connection details
- `STRIPE_*` - Stripe API keys
- `RAZORPAY_*` - Razorpay API keys
- `CELERY_*` - Celery broker URL

### Frontend (`frontend/.env`)
- `VITE_API_URL` - Backend API base URL
- `VITE_STRIPE_KEY` - Stripe publishable key
- `VITE_RAZORPAY_KEY` - Razorpay key ID
