# 🛒 Amazon Clone - Full-Stack E-Commerce Website

A professional, feature-rich e-commerce website built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This project replicates core Amazon functionalities with modern design and responsive UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

## ✨ Features

### 🛍️ Shopping Experience
- **Product Catalog** - Browse products with advanced filtering, sorting, and pagination
- **Search** - Full-text search with autocomplete suggestions
- **Categories** - Hierarchical category navigation with subcategories
- **Product Details** - Image gallery, specifications, reviews, and related products
- **Shopping Cart** - Add, update quantities, remove items with real-time totals
- **Wishlist** - Save products for later with quick add-to-cart
- **Coupons** - Apply discount codes at checkout

### 🔐 Authentication
- **Email/Password** - Traditional registration and login
- **Google OAuth 2.0** - One-click sign in with Google
- **Phone OTP** - Login with mobile number verification (Twilio)
- **Password Reset** - Email-based password recovery
- **JWT Tokens** - Secure session management

### 👤 User Features
- **Profile Management** - Update personal information and avatar
- **Multiple Addresses** - Manage delivery addresses with default selection
- **Order History** - View past orders with status tracking
- **Order Tracking** - Real-time order status updates
- **Reviews & Ratings** - Rate and review purchased products

### 🔧 Admin Panel
- **Dashboard** - Sales analytics, order stats, and quick insights
- **Product Management** - CRUD operations with image uploads
- **Category Management** - Nested categories with images
- **Order Management** - View, update status, and process orders
- **User Management** - View users, change roles, activate/deactivate
- **Coupon Management** - Create and manage discount codes

### 🎨 UI/UX
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Theme** - Toggle between themes with persistence
- **Loading States** - Skeleton loaders and spinners
- **Toast Notifications** - User feedback for all actions
- **Image Carousels** - Hero banners and product galleries

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first styling
- **Axios** - HTTP client
- **Swiper.js** - Touch-friendly carousels
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Passport.js** - OAuth strategies
- **Twilio** - SMS/OTP service
- **Nodemailer** - Email service

## 📁 Project Structure

```
ecommerce-Clone/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin panel pages
│   │   │   └── user/       # User dashboard pages
│   │   └── services/       # API services
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── seed/              # Database seeders
│   ├── utils/             # Utility functions
│   └── index.js           # Entry point
├── package.json           # Root package.json
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ecommerce-Clone.git
   cd ecommerce-Clone
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, server, client)
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp server/.env.example server/.env
   # Edit server/.env with your values

   # Frontend
   cp client/.env.example client/.env
   # Edit client/.env with your values
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🔑 Test Accounts

### Admin
```
Email: xyzzzzz@amazon.com
Password: XYZZZZ123
```

### User
```
Email: user@amazon.com
Password: user123
```

### Coupon Codes
| Code | Discount | Conditions |
|------|----------|------------|
| WELCOME10 | 10% off | First order |
| FLAT500 | ₹500 off | Min ₹2000 purchase |
| SUMMER25 | 25% off | Max ₹1000 discount |

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Home Page
![Home Page](docs/screenshots/home.png)

### Product Page
![Product Page](docs/screenshots/product.png)

### Shopping Cart
![Shopping Cart](docs/screenshots/cart.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin.png)

</details>

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/phone/send-otp` | Send phone OTP |
| POST | `/api/auth/phone/verify-otp` | Verify phone OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:slug` | Get single product |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/featured` | Get featured products |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart/add` | Add to cart |
| PUT | `/api/cart/update` | Update quantity |
| DELETE | `/api/cart/remove/:id` | Remove item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/cancel` | Cancel order |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| CRUD | `/api/admin/products` | Manage products |
| CRUD | `/api/admin/categories` | Manage categories |
| CRUD | `/api/admin/users` | Manage users |
| CRUD | `/api/admin/orders` | Manage orders |
| CRUD | `/api/admin/coupons` | Manage coupons |

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- MongoDB Atlas setup
- Google OAuth configuration
- Twilio setup for phone OTP
- Backend deployment on Render
- Frontend deployment on Vercel

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspired by Amazon.in
- Icons by [Heroicons](https://heroicons.com)
- Images from [Unsplash](https://unsplash.com)

---

**⭐ Star this repo if you found it helpful!**

Built with ❤️ by [Your Name]
