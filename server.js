// Production server for serving the React frontend with proper SPA routing
// This ensures all React Router routes work correctly on page refresh
const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();
const buildPath = path.join(__dirname, 'client', 'build');
const indexPath = path.join(buildPath, 'index.html');

// Enable compression for better performance
app.use(compression());

// Serve static files (JS, CSS, images, etc.) with long-term caching
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: false
}));

// Special handling for index.html - never cache
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(indexPath);
});

// SPA catch-all: Serve index.html for all remaining requests
// This allows React Router to handle client-side routing
app.use((req, res, next) => {
  // Only serve index.html for requests that don't have file extensions
  // This way /api/*, /uploads/*, and other actual files still work
  if (path.extname(req.url) === '') {
    // No file extension - this is a route, serve index.html
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err.message);
        res.status(500).send('Internal Server Error');
      }
    });
  } else {
    // Has file extension - let Express handle 404
    res.status(404).send('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT} (${NODE_ENV})`);
  console.log(`📁 Serving React app from: ${buildPath}`);
});

