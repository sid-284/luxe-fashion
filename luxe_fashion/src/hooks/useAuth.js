import { useState, useEffect, useCallback } from 'react';
import { authUtils, apiFetch } from '../utils/api';

/**
 * Custom hook for authentication management
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const hasToken = authUtils.isAuthenticated();
      const isAdminUser = authUtils.isAdmin();
      
      if (!hasToken) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      try {
        if (isAdminUser) {
          // Check admin authentication
          const adminData = await apiFetch('/user/getadmin');
          if (adminData && adminData.role === 'admin') {
            setIsAuthenticated(true);
            setIsAdmin(true);
            setUser(adminData);
          } else {
            throw new Error('Admin verification failed');
          }
        } else {
          // Check regular user authentication
          const userData = await apiFetch('/user/getcurrentuser');
          if (userData) {
            setIsAuthenticated(true);
            setIsAdmin(false);
            setUser(userData);
          } else {
            throw new Error('User verification failed');
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Clear invalid tokens
        authUtils.clearAuthToken();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials, isAdminLogin = false) => {
    setIsLoading(true);
    
    try {
      const endpoint = isAdminLogin ? '/auth/adminlogin' : '/auth/login';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response && response.token) {
        // Token is automatically stored by apiFetch
        if (isAdminLogin) {
          authUtils.setAdminAuth(true);
        }
        
        // Refresh auth state
        await checkAuth();
        return { success: true, data: response };
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Call backend logout
      await apiFetch('/auth/logout', { method: 'GET' });
    } catch (error) {
      console.error('Backend logout error:', error);
    }
    
    // Clear local auth data
    authUtils.clearAuthToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setIsLoading(false);
  }, []);

  // Require authentication (redirect if not authenticated)
  const requireAuth = useCallback((requireAdminAccess = false) => {
    if (!isAuthenticated) {
      authUtils.redirectToLogin();
      return false;
    }
    
    if (requireAdminAccess && !isAdmin) {
      authUtils.redirectToLogin();
      return false;
    }
    
    return true;
  }, [isAuthenticated, isAdmin]);

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
    requireAuth,
  };
};

export default useAuth;
