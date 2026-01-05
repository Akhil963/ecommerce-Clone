# 🚀 E-Commerce Amazon Clone - Deployment Guide

This guide will help you deploy the Amazon-clone e-commerce website to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Twilio Setup (Phone OTP)](#twilio-setup)
6. [Email Service Setup](#email-service-setup)
7. [Backend Deployment (Render)](#backend-deployment-render)
8. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
9. [Alternative Deployment Options](#alternative-deployment-options)
10. [Test Credentials](#test-credentials)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deployment, ensure you have:

- Node.js 18+ installed
- Git installed
- GitHub account
- MongoDB Atlas account
- Google Cloud Console account
- Twilio account (for phone OTP)
- Gmail account (for email service)

---

## Environment Variables

### Backend (server/.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=30d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback

# Twilio (Phone OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Frontend URL (for CORS)
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Frontend (client/.env)

```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## MongoDB Atlas Setup

### Step 1: Create Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new project (e.g., "ecommerce-amazon")
4. Click **"Build a Database"**
5. Select **FREE tier (M0)**
6. Choose a cloud provider (AWS recommended) and region
7. Click **"Create Cluster"**

### Step 2: Configure Database Access

1. Go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Choose **Password authentication**
4. Enter username and a strong password
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. For development: **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IP addresses
5. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Select **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `ecommerce`

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name and create

### Step 2: Enable OAuth API

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"** and enable it
3. Search for **"Google People API"** and enable it

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** and click **"Create"**
3. Fill in:
   - App name: "Amazon Clone E-Commerce"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Save and continue

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Application type: **"Web application"**
4. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://your-frontend-url.vercel.app` (production)
5. Add **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-backend-url.com/api/auth/google/callback` (production)
6. Click **"Create"**
7. Copy **Client ID** and **Client Secret**

---

## Twilio Setup

### Step 1: Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Credentials

1. Go to **Console Dashboard**
2. Copy **Account SID** and **Auth Token**

### Step 3: Get Phone Number

1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select a number with SMS capability
3. Purchase (free trial credits available)

### Step 4: Configure Messaging

1. Go to **Messaging** → **Services**
2. Create a new messaging service
3. Add your Twilio phone number as a sender

---

## Email Service Setup

### Using Gmail

1. Go to your [Google Account](https://myaccount.google.com)
2. Enable **2-Step Verification**
3. Go to **Security** → **App passwords**
4. Select app: **Mail**, device: **Other**
5. Name it "Amazon Clone" and generate
6. Copy the 16-character app password

### Alternative: SendGrid

1. Create [SendGrid](https://sendgrid.com) account
2. Go to **Email API** → **Integration Guide**
3. Choose **SMTP Relay**
4. Create API key
5. Use these settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

---

## Backend Deployment (Render)

### Step 1: Prepare Repository

1. Push your code to GitHub
2. Ensure your `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "dev": "nodemon index.js"
     }
   }
   ```

### Step 2: Deploy to Render

1. Go to [Render](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ecommerce-amazon-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

1. Go to **Environment** tab
2. Add all backend environment variables
3. Click **"Save Changes"**

### Step 4: Deploy

1. Render will auto-deploy on push
2. Copy the deployed URL (e.g., `https://ecommerce-amazon-api.onrender.com`)

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Update `client/.env` with production API URL

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`

### Step 3: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
   - `REACT_APP_GOOGLE_CLIENT_ID` = your Google Client ID

### Step 4: Deploy

1. Click **"Deploy"**
2. Copy the deployed URL

### Step 5: Update CORS

1. Go back to Render
2. Update `CLIENT_URL` environment variable with Vercel URL
3. Redeploy backend

---

## Alternative Deployment Options

### Railway (Backend)

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Configure environment variables
4. Deploy

### Netlify (Frontend)

1. Go to [Netlify](https://netlify.com)
2. Import from GitHub
3. Build command: `cd client && npm run build`
4. Publish directory: `client/build`
5. Add environment variables

### DigitalOcean App Platform

1. Create [DigitalOcean](https://digitalocean.com) account
2. Go to **Apps** → **Create App**
3. Connect GitHub
4. Configure backend and frontend as separate components

---

## Test Credentials

### Admin Account
```
Email: admin@amazon.com
Password: admin123
```

### Test User Account
```
Email: user@amazon.com
Password: user123
```

### Test Coupon Codes
```
WELCOME10 - 10% off (First order)
FLAT500   - ₹500 off (Min ₹2000 purchase)
SUMMER25  - 25% off (Max ₹1000 discount)
```

### Test Credit Card (For Stripe integration)
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

## Seed Database

To populate the database with sample data:

```bash
cd server
npm run seed
```

This creates:
- Admin user
- Sample categories
- Sample products
- Sample coupons

---

## Troubleshooting

### Common Issues

#### CORS Errors
- Ensure `CLIENT_URL` in backend matches exactly (no trailing slash)
- Check that frontend is using correct API URL

#### OAuth Callback Error
- Verify callback URLs in Google Console match your deployment
- Check `GOOGLE_CALLBACK_URL` environment variable

#### Database Connection Failed
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

#### Email Not Sending
- Verify Gmail app password (not regular password)
- Enable 2-Step Verification on Google account
- Check SMTP settings

#### Phone OTP Not Working
- Verify Twilio credentials
- Check if trial account has verified phone numbers
- Ensure phone number format includes country code (+91)

### Debug Tips

1. **Check Logs**:
   - Render: Dashboard → Logs
   - Vercel: Function → Logs

2. **Test API Locally**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

3. **Check Network Tab**:
   - Open browser DevTools → Network
   - Look for failed requests and error responses

---

## Performance Optimization

### Backend

1. Enable MongoDB indexes (already configured)
2. Use Redis for session caching (optional)
3. Enable Gzip compression (configured)

### Frontend

1. Enable lazy loading (configured)
2. Optimize images (use WebP format)
3. Enable service worker for PWA

---

## Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] MongoDB injection protection
- [ ] XSS protection headers
- [ ] CORS properly configured
- [ ] Environment variables not exposed
- [ ] Database user with limited permissions

---

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review error logs on your deployment platform
3. Verify all environment variables are set correctly
4. Test locally with production environment variables

---

## Quick Start Commands

```bash
# Clone repository
git clone https://github.com/your-username/ecommerce-amazon.git
cd ecommerce-amazon

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your values

# Seed database
cd server && npm run seed

# Run development
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm start
```

---

**Happy Deploying! 🎉**
