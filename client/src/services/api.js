import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here, let the components handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  // Multi-step registration with verification
  registerInit: (data) => api.post('/auth/register/init', data),
  verifyEmailOTP: (data) => api.post('/auth/register/verify-email', data),
  verifyPhoneOTP: (data) => api.post('/auth/register/verify-phone', data),
  resendEmailOTP: (registrationId) => api.post('/auth/register/resend-email-otp', { registrationId }),
  resendPhoneOTP: (registrationId) => api.post('/auth/register/resend-phone-otp', { registrationId }),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
  sendPhoneOTP: (phone) => api.post('/auth/phone/send-otp', { phone }),
  verifyPhoneOTPLogin: (phone, otp) => api.post('/auth/phone/verify-otp', { phone, otp }),
  googleAuth: () => `${API_URL}/auth/google`
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  getById: (id) => api.get(`/products/id/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getDeals: () => api.get('/products/deals'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  search: (params) => api.get('/products/search', { params }),
  getRelated: (id) => api.get(`/products/${id}/related`)
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getAllWithSub: () => api.get('/categories/all'),
  getOne: (slug) => api.get(`/categories/${slug}`)
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
  applyCoupon: (code) => api.post('/cart/apply-coupon', { code }),
  removeCoupon: () => api.delete('/cart/remove-coupon')
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  validateCoupon: (code, total) => api.post('/orders/validate-coupon', { code, total })
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`)
};

// userAPI alias for backward compatibility
export const userAPI = {
  ...usersAPI,
  addToCart: (productId, quantity) => cartAPI.add(productId, quantity)
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }), // Alias
  create: (productId, data) => api.post(`/reviews/${productId}`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId, isHelpful) => api.post(`/reviews/${reviewId}/helpful`, { isHelpful })
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentOrders: () => api.get('/admin/dashboard'),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}`, { role }),
  toggleUserStatus: (id, isActive) => api.put(`/admin/users/${id}`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  
  // Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (id, isApproved) => api.put(`/admin/reviews/${id}/approve`, { isApproved }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  
  // Upload
  uploadImage: (formData) => api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/admin/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;
