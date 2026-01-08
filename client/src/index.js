import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Only for development - comment out in production
if (process.env.NODE_ENV === 'development') {
  console.warn = () => {};
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
