Option A: Deploy to Render (Recommended - Free)
Backend Deployment:

Go to render.com and sign up
Click "New +" → "Web Service"
Connect your GitHub repository
Configure:
Name: amazon-clone-api
Root Directory: . (root)
Build Command: npm install
Start Command: npm run server:prod
Add Environment Variables (all from your .env file)
Click "Create Web Service"
Frontend Deployment:

Click "New +" → "Static Site"
Connect same repository
Configure:
Name: amazon-clone-frontend
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: build
Add Environment Variables:
REACT_APP_API_URL: Your backend Render URL
Click "Create Static Site"
Option B: Deploy to Vercel (Frontend) + Render (Backend)
Frontend on Vercel:

Go to vercel.com
Import your GitHub repo
Set Root Directory: client
Add Environment Variables:
Deploy
Option C: Deploy to Railway (All-in-One)
Go to railway.app
"New Project" → "Deploy from GitHub"
Select your repository
Add all environment variables
Railway auto-detects and deploys
