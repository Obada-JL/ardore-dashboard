const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.ardoreperfume.com/api';

export const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.ardoreperfume.com';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/users/login`,
  
  // Users
  GET_USERS: `${API_BASE_URL}/users`,
  GET_USER: (id) => `${API_BASE_URL}/users/${id}`,
  CREATE_USER: `${API_BASE_URL}/users`,
  UPDATE_USER: (id) => `${API_BASE_URL}/users/${id}`,
  DELETE_USER: (id) => `${API_BASE_URL}/users/${id}`,
  
  // Perfumes
  GET_PERFUMES: `${API_BASE_URL}/perfumes`,
  GET_PERFUME: (id) => `${API_BASE_URL}/perfumes/${id}`,
  CREATE_PERFUME: `${API_BASE_URL}/perfumes`,
  UPDATE_PERFUME: (id) => `${API_BASE_URL}/perfumes/${id}`,
  DELETE_PERFUME: (id) => `${API_BASE_URL}/perfumes/${id}`,
  
  // Products (alternative/additional endpoints)
  GET_PRODUCTS: `${API_BASE_URL}/products`,
  GET_PRODUCT: (id) => `${API_BASE_URL}/products/${id}`,
  CREATE_PRODUCT: `${API_BASE_URL}/products`,
  UPDATE_PRODUCT: (id) => `${API_BASE_URL}/products/${id}`,
  DELETE_PRODUCT: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Orders
  GET_ORDERS: `${API_BASE_URL}/orders`,
  GET_ORDER: (id) => `${API_BASE_URL}/orders/${id}`,
  CREATE_ORDER: `${API_BASE_URL}/orders`,
  UPDATE_ORDER: (id) => `${API_BASE_URL}/orders/${id}`,
  DELETE_ORDER: (id) => `${API_BASE_URL}/orders/${id}`,
  GET_ORDER_STATS: `${API_BASE_URL}/orders/stats`,
  UPDATE_ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  
  // Discounts
  GET_DISCOUNTS: `${API_BASE_URL}/discounts`,
  GET_DISCOUNT: (id) => `${API_BASE_URL}/discounts/${id}`,
  CREATE_DISCOUNT: `${API_BASE_URL}/discounts`,
  UPDATE_DISCOUNT: (id) => `${API_BASE_URL}/discounts/${id}`,
  DELETE_DISCOUNT: (id) => `${API_BASE_URL}/discounts/${id}`,
  VALIDATE_DISCOUNT: (code) => `${API_BASE_URL}/discounts/validate/${code}`,
  
  // Messages
  GET_MESSAGES: `${API_BASE_URL}/messages`,
  GET_MESSAGE: (id) => `${API_BASE_URL}/messages/${id}`,
  CREATE_MESSAGE: `${API_BASE_URL}/messages`,
  UPDATE_MESSAGE: (id) => `${API_BASE_URL}/messages/${id}`,
  DELETE_MESSAGE: (id) => `${API_BASE_URL}/messages/${id}`,
  REPLY_MESSAGE: (id) => `${API_BASE_URL}/messages/${id}/reply`,
  
  // Categories
  GET_CATEGORIES: `${API_BASE_URL}/categories`,
  GET_CATEGORY: (id) => `${API_BASE_URL}/categories/${id}`,
  CREATE_CATEGORY: `${API_BASE_URL}/categories`,
  UPDATE_CATEGORY: (id) => `${API_BASE_URL}/categories/${id}`,
  DELETE_CATEGORY: (id) => `${API_BASE_URL}/categories/${id}`,
  
  // About
  GET_ABOUT: `${API_BASE_URL}/about`,
  UPDATE_ABOUT: `${API_BASE_URL}/about`,
  
  // Favorites
  GET_FAVORITES: `${API_BASE_URL}/favorites`,
  ADD_FAVORITE: `${API_BASE_URL}/favorites`,
  REMOVE_FAVORITE: (id) => `${API_BASE_URL}/favorites/${id}`,
  
  // File uploads
  UPLOAD_IMAGE: `${API_BASE_URL}/upload/image`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/upload/multiple`,
};

export default API_ENDPOINTS; 