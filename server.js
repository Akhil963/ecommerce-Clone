// Production server for serving the React frontend with proper SPA routing
// This ensures all React Router routes work correctly on page refresh
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const buildPath = path.join(__dirname, 'client', 'build');
const indexPath = path.join(buildPath, 'index.html');

// Enable compression for better performance
app.use(compression());

// Serve static files (JS, CSS, images, etc.) with long-term caching
// Set maxAge high for versioned assets, but let middleware handle 404s
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: false,
  fallthrough: true, // CRITICAL: Pass to next middleware instead of sending 404
  setHeaders: (res, filePath) => {
    // Never cache index.html
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback middleware - catch all routes and serve index.html
// This must come AFTER static middleware to catch unmatched routes
app.use((req, res) => {
  console.log(`📍 SPA Route: ${req.method} ${req.path}`);
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error serving index.html for ${req.path}:`, err.message);
      res.status(500).send('Internal Server Error - Could not load application');
    }
  });
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT} (${NODE_ENV})`);
  console.log(`📁 Serving React app from: ${buildPath}`);
});

