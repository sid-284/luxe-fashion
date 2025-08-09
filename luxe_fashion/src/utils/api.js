// Utility for making API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Authentication utilities
export const authUtils = {
  // Store authentication token in localStorage
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authTimestamp', Date.now().toString());
    }
  },

  // Get authentication token from localStorage
  getAuthToken: () => {
    const token = localStorage.getItem('authToken');
    const timestamp = localStorage.getItem('authTimestamp');

    // Check if token is expired (7 days for regular users, 1 day for admin)
    if (token && timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = token.includes('admin') ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 1 day for admin, 7 days for users

      if (tokenAge > maxAge) {
        authUtils.clearAuthToken();
        return null;
      }
      return token;
    }
    return null;
  },

  // Clear authentication token
  clearAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('isAdminAuthenticated');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authUtils.getAuthToken();
  },

  // Set admin authentication status
  setAdminAuth: (isAdmin) => {
    localStorage.setItem('isAdminAuthenticated', isAdmin.toString());
  },

  // Check if user is admin
  isAdmin: () => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  },

  // Redirect to login page
  redirectToLogin: () => {
    // Clear any existing auth data
    authUtils.clearAuthToken();

    // Redirect to appropriate login page
    const currentPath = window.location.pathname;
    if (currentPath.includes('admin')) {
      window.location.href = '/admin-panel';
    } else {
      window.location.href = '/login';
    }
  }
};

export async function apiFetch(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Prepare headers - don't set Content-Type for FormData
    let headers = {};

    // Only set Content-Type if it's not FormData and not already set
    if (!(options.body instanceof FormData) && !options.headers?.['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authentication token from localStorage as fallback
    const authToken = authUtils.getAuthToken();
    if (authToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Merge with any provided headers
    headers = {
      ...headers,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // for cookies/auth
      headers,
    });

    // Handle authentication failures
    if (response.status === 401) {
      console.warn('Authentication failed - redirecting to login');
      authUtils.redirectToLogin();
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.message || data || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Store token if returned in response (for login endpoints)
    if (data && data.token) {
      authUtils.setAuthToken(data.token);

      // Set admin status if this is an admin login
      if (endpoint.includes('adminlogin') || data.role === 'admin') {
        authUtils.setAdminAuth(true);
      }
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }

    console.error('API Fetch Error:', error);
    throw error;
  }
}

// Helper function for common API operations
export const apiHelpers = {
  get: (endpoint) => apiFetch(endpoint),
  
  post: (endpoint, data) => apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiFetch(endpoint, {
    method: 'DELETE',
  }),
}; 