// Production server for serving the React frontend with proper SPA routing
// This handles serving the React app and ensuring all routes work correctly
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();

// Enable compression for better performance
app.use(compression());

// Serve static files from the client build directory with caching
app.use(express.static(path.join(__dirname, 'client', 'build'), {
  maxAge: '1y',
  etag: false,
  // Return 404 for missing files instead of serving index.html
  fallthrough: true
}));

// Cache control for index.html - don't cache it
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// SPA routing - serve index.html for all routes that don't have file extensions
// This allows React Router to handle all routes client-side
app.get('*', (req, res, next) => {
  // Skip if this is a request for a file with an extension
  if (req.path.includes('.')) {
    return next();
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server Error');
    }
  });
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT} (${NODE_ENV})`);
});

