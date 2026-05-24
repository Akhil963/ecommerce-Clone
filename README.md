# 🛒 Amazon Clone - Full-Stack E-Commerce Website

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)
[![Express](https://img.shields.io/badge/Express.js-4.18+-orange.svg)](https://expressjs.com/)

A professional, full-featured e-commerce platform built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This project faithfully replicates core Amazon functionalities including product catalog, shopping cart, secure checkout, admin dashboard, and multiple authentication methods with modern design and fully responsive UI.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#️-system-architecture)
- [Project Flow](#-project-flow)
- [Tools & Uses](#-tools--uses)
- [File Structure](#-file-structure)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-endpoints)
- [Environment Configuration](#-environment-variables)
- [Deployment](#-deployment)
- [Testing](#-testing-accounts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**Amazon Clone** is a complete end-to-end e-commerce solution designed to demonstrate professional full-stack development practices. It showcases:

- **Complete User Journey**: From product discovery to order fulfillment
- **Secure Authentication**: Multiple login methods including OAuth 2.0, JWT, and OTP
- **Admin Management System**: Comprehensive dashboard for managing products, orders, users, and coupons
- **Real-Time Features**: Live order tracking and notifications
- **Production-Ready**: Deployed on cloud platforms (Render backend, Vercel frontend)
- **Scalable Architecture**: Clean separation of concerns with microservices-ready design

### Live Demo
🚀 **Frontend**: (https://amazon-clone-frontend-eqts.onrender.com)
🔧 **Backend API**: (https://amazon-clone-api-mh36.onrender.com/api)

---

## ✨ Features

#### 🛍️ Shopping Experience
- **Product Catalog** - Browse 100+ products with advanced filtering, sorting, and pagination
- **Full-Text Search** - Autocomplete search functionality with product suggestions
- **Category Navigation** - Hierarchical organizing of products by category
- **Product Details** - Image gallery, specifications, customer reviews, and ratings
- **Shopping Cart** - Add/remove items, adjust quantities with real-time price calculation
- **Wishlist** - Save favorite products for later with persistent storage
- **Discount Coupons** - Apply promotional codes with validation at checkout
- **Product Reviews** - Customers can leave ratings and reviews on purchased items

### 🔐 Authentication & Security
- **Email/Password Login** - Traditional registration with email verification
- **Google OAuth 2.0** - One-click sign-in using Google accounts
- **Phone OTP Authentication** - Mobile number verification using Twilio SMS
- **Password Reset** - Email-based password recovery with secure token
- **JWT Tokens** - Secure stateless session management
- **Password Hashing** - bcryptjs encryption for sensitive data
- **Security Middleware** - Rate limiting, CORS, helmet protection

### 👤 User Dashboard
- **Profile Management** - Update personal information, avatar, and bio
- **Address Book** - Store multiple delivery addresses with default selection
- **Order History** - Track all previous purchases with detailed status
- **Order Tracking** - Real-time order status with delivery timeline
- **Wishlist Management** - Quick access to saved products
- **Account Settings** - Manage preferences, notifications, and privacy

### 🛒 Checkout & Payments
- **Secure Checkout** - Multi-step checkout with validation
- **Multiple Address Selection** - Choose from saved addresses or add new
- **Order Summary** - Item breakdown, taxes, shipping, and total
- **Order Confirmation** - Email receipt with order details
- **Order Status Tracking** - Monitor shipment in real-time

### 🔧 Admin Panel
- **Dashboard Analytics** - Sales metrics, order statistics, revenue trends
- **Product Management** - CRUD operations with image uploads via Multer
- **Category Management** - Create nested categories with hierarchy
- **Order Management** - View orders, update status, process refunds
- **User Management** - Manage accounts, roles, and permissions
- **Coupon Management** - Create, edit, and track discount codes
- **Sales Reports** - View detailed reports with filters

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first approach, works seamlessly on all devices
- **Dark/Light Theme** - Toggle between themes with localStorage persistence
- **Loading States** - Skeleton loaders for smooth transitions
- **Toast Notifications** - Real-time user feedback for all actions
- **Image Carousels** - Swiper.js for product galleries and banners
- **Modal Dialogs** - HeadlessUI modals for confirmations and forms
- **Smooth Animations** - CSS transitions and React animations

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI library with hooks | 18.2.0 |
| **React Router** | Client-side routing and navigation | 6.21.1 |
| **Tailwind CSS** | Utility-first CSS framework | 3.4.0 |
| **Axios** | HTTP client for API calls | 1.6.2 |
| **Swiper.js** | Touch-friendly carousels and sliders | 11.0.5 |
| **Heroicons** | Beautiful SVG icon library | 2.1.1 |
| **React Hot Toast** | Elegant notification system | 2.4.1 |
| **React Context API** | State management | Native |
| **HeadlessUI** | Unstyled, accessible components | 1.7.17 |
| **Canvas Confetti** | Celebration animations | 1.9.4 |

### Backend Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime | 18+ |
| **Express.js** | Web application framework | 4.18.2 |
| **MongoDB** | NoSQL database | Atlas |
| **Mongoose** | MongoDB object modeling | 8.0.3 |
| **JWT** | JSON Web Tokens authentication | 9.0.2 |
| **Passport.js** | Authentication middleware | 0.7.0 |
| **Bcryptjs** | Password hashing | 2.4.3 |
| **Multer** | File upload handling | 1.4.5 |
| **Twilio** | SMS and OTP services | Latest |
| **Nodemailer** | Email service | 6.9.7 |
| **SendGrid Mail** | Email delivery | 8.1.0 |
| **Helmet** | Security headers | 8.1.0 |
| **Express Rate Limit** | API rate limiting | 8.2.1 |
| **Express Validator** | Input validation | 7.0.1 |

### DevOps & Infrastructure

| Tool | Purpose |
|------|---------|
| **MongoDB Atlas** | Cloud database hosting |
| **Render** | Backend deployment platform |
| **Vercel** | Frontend deployment platform |
| **Netlify** | Alternative frontend hosting |
| **Docker** | Containerization (optional) |
| **Nodemon** | Development auto-reload |
| **Concurrently** | Run multiple npm scripts |

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                    React.js Frontend (Port 3000)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pages: Home, Products, Cart, Checkout, Admin Dashboard   │ │
│  │ Context: Auth, Cart, Theme                              │ │
│  │ Components: Header, Footer, ProductCard, etc.            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST/JSON
                       │ Axios API Calls
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVER LAYER                            │
│                  Express.js API (Port 5000)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes: /api/auth, /api/products, /api/orders, /api/admin│ │
│  │ Middleware: Auth, Validation, Error Handling             │ │
│  │ Controllers: Business Logic                              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Services: Email, SMS, Passport OAuth                     │ │
│  │ Utils: Token, Email, SMS, Validation                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
                       │ Queries
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                  MongoDB Atlas (Cloud)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Collections: Users, Products, Orders, Carts, Reviews     │ │
│  │ Models: Relationships & Validations defined in Schema    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

External Services:
├─ Google OAuth (Authentication)
├─ Twilio (SMS/OTP)
├─ Nodemailer/SendGrid (Email)
└─ Multer (File Storage)
```

### MVC Architecture Pattern

```
Request Flow:
USER → ROUTE → MIDDLEWARE → CONTROLLER → SERVICE → MODEL → DATABASE
  ↑                                                              │
  └──────────────────── RESPONSE ←────────────────────────────┘
```

---

## 🔄 Project Flow

### 1. **User Authentication Flow**

```
┌─────────────────────────────────────────────┐
│  New User Arrives                           │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│  Registration/Login Options                 │
├─────────────────────────────────────────────┤
│  • Email/Password → Register                │
│  • Email/Password → Login                   │
│  • Google OAuth → One-Click Sign In         │
│  • Phone OTP → Verify Mobile Number         │
└────────────┬────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  JWT Token Generated & Stored                │
│  (localStorage + HTTP Cookie)                │
└────────────┬─────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  User Context Updated                        │
│  (AuthContext → useAuth hook)                │
└────────────┬─────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  Authenticated User Can:                     │
│  • Browse Products                           │
│  • Add to Cart                               │
│  • Checkout                                  │
│  • Track Orders                              │
└──────────────────────────────────────────────┘
```

### 2. **Shopping & Checkout Flow**

```
┌──────────────────────────┐
│  1. Browse Products      │
│  - View catalog          │
│  - Filter & Search       │
│  - View details          │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  2. Add to Cart          │
│  - Select quantity       │
│  - Store in CartContext  │
│  - Show notification     │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  3. View Cart            │
│  - Review items          │
│  - Adjust quantities     │
│  - Remove items          │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  4. Proceed to Checkout  │
│  - Validate cart         │
│  - Check inventory       │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  5. Enter Address        │
│  - Select saved address  │
│  - Add new address       │
│  - Validate address      │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  6. Apply Coupon         │
│  - Validate coupon code  │
│  - Calculate discount    │
│  - Update total          │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  7. Place Order          │
│  - Create order record   │
│  - Update inventory      │
│  - Send confirmation     │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  8. Order Success        │
│  - Show confirmation     │
│  - Send email receipt    │
│  - Redirect dashboard    │
└──────────────────────────┘
```

### 3. **Admin Management Flow**

```
┌─────────────────────────────────────────────┐
│  Admin Logs In                              │
│  (Role === 'admin')                         │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│  Admin Dashboard                            │
│  ├─ Sales Analytics                         │
│  ├─ Quick Stats                             │
│  └─ Navigation to Management Panels         │
└────────────┬────────────────────────────────┘
             ▼
    ┌────────┴────────┬────────────┬─────────┐
    ▼                 ▼            ▼         ▼
┌────────────┐  ┌─────────────┐ ┌───────┐ ┌─────┐
│ Products   │  │ Categories  │ │Orders │ │Users│
├────────────┤  ├─────────────┤ ├───────┤ ├─────┤
│ • Create   │  │ • Create    │ │*Update│ │*View│
│ • Read     │  │ • Read      │ │ Status│ │*Role│
│ • Update   │  │ • Update    │ │*Track │ │*Ban │
│ • Delete   │  │ • Delete    │ │       │ │     │
│ • Upload   │  │ * Hierarchy │ │       │ │     │
│  Images    │  │             │ │       │ │     │
└────────────┘  └─────────────┘ └───────┘ └─────┘
    ▼                 ▼            ▼         ▼
  DATABASE        DATABASE      DATABASE  DATABASE
```

---

## 🔧 Tools & Uses

### **Frontend Tools**

| Tool | Use Case | Example |
|------|----------|---------|
| **React** | Build interactive UI components | ProductCard, Header, Cart components |
| **React Router** | Navigate between pages without reload | /products, /cart, /admin/dashboard |
| **Context API** | Share auth/cart data across components | AuthContext, CartContext, ThemeContext |
| **Axios** | Make HTTP requests to backend | `api.get('/products')` |
| **Tailwind CSS** | Style components with utility classes | `className="flex items-center justify-center"` |
| **Swiper.js** | Create touch-friendly product carousels | Product image gallery, hero carousel |
| **React Hot Toast** | Show notifications to users | Success: "Added to cart", Error messages |
| **HeadlessUI** | Accessible dropdown and modals | Product filters, confirmation dialogs |
| **LocalStorage** | Persist user theme, cart, auth token | Dark mode, cart items, JWT token |

### **Backend Tools**

| Tool | Use Case | Example |
|------|----------|---------|
| **Express.js** | Define API routes and middleware | `router.post('/product', createProduct)` |
| **Mongoose** | Define database schemas & models | `UserSchema`, `ProductSchema`, `OrderSchema` |
| **MongoDB** | Store and retrieve data | Product catalog, user orders, reviews |
| **JWT (jsonwebtoken)** | Create secure auth tokens | `jwt.sign({userId}, SECRET, {expiresIn})` |
| **Passport.js** | Handle OAuth authentication | Google login strategy |
| **Bcryptjs** | Hash and verify passwords | `bcrypt.hash(password, 10)` |
| **Multer** | Handle file uploads | Store product images, user avatars |
| **Nodemailer** | Send emails | Order confirmation, password reset |
| **Twilio** | Send SMS and OTP codes | `client.messages.create({to, body})` |
| **Helmet** | Set security HTTP headers | Prevent XSS, clickjacking attacks |
| **Express Rate Limit** | Prevent API abuse | Limit 100 requests per 15 minutes |
| **Express Validator** | Validate input data | `body('email').isEmail()` |

### **Deployment Tools**

| Tool | Server | Purpose |
|------|--------|---------|
| **Render** | Backend (Node.js) | Deploy Express API with auto-scaling |
| **Vercel** | Frontend (React) | Deploy React app with serverless functions |
| **MongoDB Atlas** | Database | Host MongoDB in cloud with backups |
| **Netlify** | Frontend (Alternative) | Deploy React with form handling |
| **Nodemon** | Development | Auto-restart server on file changes |
| **Concurrently** | Development | Run backend and frontend simultaneously |

---

## 📁 File Structure

```
ecommerce-amazon/
│
├── 📁 client/                              # React Frontend Application
│   ├── 📁 public/
│   │   ├── index.html                      # Main HTML entry point
│   │   ├── manifest.json                   # PWA manifest
│   │   └── _redirects                      # Netlify routing config
│   │
│   ├── 📁 src/
│   │   ├── App.js                          # Main App component with routes
│   │   ├── index.js                        # ReactDOM render entry point
│   │   ├── index.css                       # Global styles
│   │   │
│   │   ├── 📁 components/                  # Reusable React Components
│   │   │   ├── AdminRoute.js               # Route wrapper for admin pages
│   │   │   ├── ProtectedRoute.js           # Route wrapper for authenticated pages
│   │   │   ├── Header.js                   # Navigation header with user menu
│   │   │   ├── Footer.js                   # Footer with links
│   │   │   ├── ProductCard.js              # Product display card component
│   │   │   └── Loading.js                  # Loading skeleton screen
│   │   │
│   │   ├── 📁 context/                     # React Context for State Management
│   │   │   ├── AuthContext.js              # User authentication state
│   │   │   ├── CartContext.js              # Shopping cart state
│   │   │   └── ThemeContext.js             # Dark/Light theme state
│   │   │
│   │   ├── 📁 layouts/                     # Page Layout Wrappers
│   │   │   ├── MainLayout.js               # Standard layout with header/footer
│   │   │   └── AdminLayout.js              # Admin panel layout with sidebar
│   │   │
│   │   ├── 📁 pages/                       # Page Components (Screen Level)
│   │   │   ├── Home.js                     # Landing page
│   │   │   ├── Products.js                 # Product listing
│   │   │   ├── ProductDetail.js            # Product details page
│   │   │   ├── Cart.js                     # Shopping cart page
│   │   │   ├── Checkout.js                 # Checkout process
│   │   │   ├── Search.js                   # Search results page
│   │   │   ├── Category.js                 # Category listing
│   │   │   ├── Login.js                    # Login form
│   │   │   ├── Register.js                 # Registration form
│   │   │   ├── ForgotPassword.js           # Password reset request
│   │   │   ├── ResetPassword.js            # Password reset form
│   │   │   ├── AuthCallback.js             # OAuth callback
│   │   │   ├── PhoneLogin.js               # Phone OTP login
│   │   │   ├── OrderSuccess.js             # Order confirmation
│   │   │   ├── 📁 admin/                   # Admin Panel Pages
│   │   │   │   ├── Dashboard.js            # Admin dashboard
│   │   │   │   ├── Products.js             # Product management
│   │   │   │   ├── ProductForm.js          # Add/edit product
│   │   │   │   ├── Categories.js           # Category management
│   │   │   │   ├── Orders.js               # Order management
│   │   │   │   ├── Coupons.js              # Coupon management
│   │   │   │   └── Users.js                # User management
│   │   │   └── 📁 user/                    # User Dashboard Pages
│   │   │       ├── Profile.js              # User profile
│   │   │       ├── Orders.js               # Order history
│   │   │       ├── OrderDetail.js          # Order details
│   │   │       ├── Wishlist.js             # Wishlist page
│   │   │       └── Addresses.js            # Address management
│   │   │
│   │   └── 📁 services/
│   │       └── api.js                      # Axios API instance
│   │
│   ├── package.json                        # Frontend dependencies
│   ├── tailwind.config.js                  # Tailwind CSS config
│   ├── postcss.config.js                   # PostCSS config
│   └── 📁 build/                           # Production build output
│
├── 📁 server/                              # Node.js/Express Backend
│   ├── index.js                            # Main server entry point
│   ├── 📁 config/
│   │   └── passport.js                     # Passport OAuth config
│   ├── 📁 middleware/
│   │   └── auth.js                         # JWT auth middleware
│   ├── 📁 models/                          # Mongoose Schemas
│   │   ├── User.js                         # User model
│   │   ├── Product.js                      # Product model
│   │   ├── Category.js                     # Category model
│   │   ├── Cart.js                         # Cart model
│   │   ├── Order.js                        # Order model
│   │   ├── Review.js                       # Review model
│   │   └── Coupon.js                       # Coupon model
│   ├── 📁 routes/                          # API Route Handlers
│   │   ├── auth.js                         # Auth routes
│   │   ├── products.js                     # Product routes
│   │   ├── categories.js                   # Category routes
│   │   ├── cart.js                         # Cart routes
│   │   ├── orders.js                       # Order routes
│   │   ├── reviews.js                      # Review routes
│   │   ├── users.js                        # User routes
│   │   └── admin.js                        # Admin routes
│   ├── 📁 seed/
│   │   └── seedData.js                     # Database seeding script
│   └── 📁 utils/
│       ├── tokenUtils.js                   # JWT utilities
│       ├── emailService.js                 # Email service
│       └── smsService.js                   # SMS/OTP service
│
├── 📄 server.js                            # Production server
├── 📄 package.json                         # Root dependencies
├── 📄 .env                                 # Environment variables
├── 📄 .gitignore                           # Git ignore rules
├── 📄 netlify.toml                         # Netlify config
├── 📄 render.yaml                          # Render config
├── 📄 README.md                            # This file
├── 📄 DEPLOYMENT.md                        # Deployment guide
└── 📄 LICENSE                              # MIT License
```



## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (bundled with Node.js)
- **MongoDB** (Use free MongoDB Atlas: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- **Git** for cloning repository

### Installation Steps

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/ecommerce-amazon.git
cd ecommerce-amazon
```

#### 2️⃣ Install All Dependencies
```bash
# Install both root, server, and client dependencies
npm run install-all

# OR manually:
npm install
cd client && npm install
cd ..
```

#### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_amazon?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Twilio (for SMS/OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### 4️⃣ Seed Database with Sample Data
```bash
npm run seed
```

This populates the database with test data:
- 100+ sample products
- Pre-configured categories
- Test user accounts
- Sample coupon codes

#### 5️⃣ Start Development Servers

**Option A: Run Both Simultaneously (Recommended)**
```bash
npm run dev
```

**Option B: Run Separately**
```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend Client
npm run client
```

#### 6️⃣ Open in Browser
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin/dashboard

---

---

## 🔑 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secret-key-minimum-32-chars
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Twilio SMS/OTP
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@domain.com
EMAIL_FROM_NAME=Amazon Clone

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Getting API Keys

1. **MongoDB Atlas**: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free account
   - Create cluster
   - Copy connection string

2. **Google OAuth**: [https://console.developers.google.com](https://console.developers.google.com)
   - Create project
   - Enable Google+ API
   - Create OAuth credentials
   - Add authorized redirect URIs

3. **Twilio**: [https://www.twilio.com](https://www.twilio.com)
   - Sign up for free account
   - Get Account SID and Auth Token
   - Get Twilio phone number

4. **Gmail SMTP**: 
   - Enable 2-factor authentication
   - Generate app password
   - Use in SMTP_PASSWORD

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login with email/password | ❌ |
| GET | `/api/auth/google` | Google OAuth redirect | ❌ |
| GET | `/api/auth/google/callback` | Google OAuth callback | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| POST | `/api/auth/phone/send-otp` | Send OTP to phone | ❌ |
| POST | `/api/auth/phone/verify-otp` | Verify OTP and login | ❌ |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |
| POST | `/api/auth/reset-password/:token` | Reset password | ❌ |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/products` | Get all products (paginated) | ❌ |
| GET | `/api/products/:slug` | Get single product | ❌ |
| GET | `/api/products/search?q=query` | Search products | ❌ |
| GET | `/api/products/featured` | Get featured products | ❌ |
| GET | `/api/categories` | Get all categories | ❌ |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/cart` | Get user's cart | ✅ |
| POST | `/api/cart/add` | Add product to cart | ✅ |
| PUT | `/api/cart/update/:productId` | Update item quantity | ✅ |
| DELETE | `/api/cart/remove/:productId` | Remove item from cart | ✅ |
| DELETE | `/api/cart/clear` | Clear entire cart | ✅ |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/orders` | Get user's orders | ✅ |
| POST | `/api/orders` | Create new order | ✅ |
| GET | `/api/orders/:id` | Get order details | ✅ |
| PUT | `/api/orders/:id/cancel` | Cancel order | ✅ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/users/profile` | Get user profile | ✅ |
| PUT | `/api/users/profile` | Update user profile | ✅ |
| GET | `/api/users/addresses` | Get user addresses | ✅ |
| POST | `/api/users/addresses` | Add new address | ✅ |
| PUT | `/api/users/addresses/:id` | Update address | ✅ |
| DELETE | `/api/users/addresses/:id` | Delete address | ✅ |
| GET | `/api/users/wishlist` | Get wishlist | ✅ |
| POST | `/api/users/wishlist` | Add to wishlist | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/admin/dashboard` | Dashboard analytics | ✅ Admin |
| GET | `/api/admin/products` | All products | ✅ Admin |
| POST | `/api/admin/products` | Create product | ✅ Admin |
| PUT | `/api/admin/products/:id` | Update product | ✅ Admin |
| DELETE | `/api/admin/products/:id` | Delete product | ✅ Admin |
| GET | `/api/admin/categories` | All categories | ✅ Admin |
| POST | `/api/admin/categories` | Create category | ✅ Admin |
| PUT | `/api/admin/categories/:id` | Update category | ✅ Admin |
| DELETE | `/api/admin/categories/:id` | Delete category | ✅ Admin |
| GET | `/api/admin/orders` | All orders | ✅ Admin |
| PUT | `/api/admin/orders/:id/status` | Update order status | ✅ Admin |
| GET | `/api/admin/users` | All users | ✅ Admin |
| PUT | `/api/admin/users/:id/role` | Change user role | ✅ Admin |
| GET | `/api/admin/coupons` | All coupons | ✅ Admin |
| POST | `/api/admin/coupons` | Create coupon | ✅ Admin |
| PUT | `/api/admin/coupons/:id` | Update coupon | ✅ Admin |
| DELETE | `/api/admin/coupons/:id` | Delete coupon | ✅ Admin |

---

## 🧪 Testing Accounts

### Admin
```
Email: xxxx@xxxxx.com
Password: xxxxxx
```

### Coupon Codes
| Code | Discount | Conditions |
|------|----------|------------|
| WELCOME10 | 10% off | First order |
| FLAT500 | ₹500 off | Min ₹2000 purchase |
| SUMMER25 | 25% off | Max ₹1000 discount |

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- MongoDB Atlas setup
- Google OAuth configuration
- Twilio setup for phone OTP
- Backend deployment on Render
- Frontend deployment on Vercel

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Design inspired by Amazon.com
- Icons by [Heroicons](https://heroicons.com)
- Images from [Unsplash](https://unsplash.com)
- UI Components by [HeadlessUI](https://headlessui.com)

---

## 📞 Support & Contact

- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/ecommerce-amazon/issues)
- **Email**: akhileshbhandakkar@gmail.com
- **Twitter**: [@YourTwitter](https://twitter.com/)

---

**⭐ Star this repo if you found it helpful!**

Built with ❤️ by Akhilesh Bhandakkar

---

### Project Statistics

- **Total Lines of Code**: 5000+
- **Frontend Components**: 25+
- **API Endpoints**: 50+
- **Database Models**: 7
- **Deployment Platforms**: 2 (Render + Vercel)
- **Authentication Methods**: 3 (Email, Google OAuth, Phone OTP)
