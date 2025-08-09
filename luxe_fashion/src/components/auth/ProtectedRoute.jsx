import React, { useEffect, useState } from 'react';
import { authUtils } from '../../utils/api';

/**
 * Higher-order component for protecting routes that require authentication
 * @param {React.Component} WrappedComponent - Component to protect
 * @param {Object} options - Protection options
 * @param {boolean} options.requireAdmin - Whether admin access is required
 * @param {string} options.redirectTo - Where to redirect if not authenticated
 */
const ProtectedRoute = (WrappedComponent, options = {}) => {
  const {
    requireAdmin = false,
    redirectTo = null
  } = options;

  return function ProtectedComponent(props) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const checkAuth = () => {
        const isAuthenticated = authUtils.isAuthenticated();
        const isAdmin = authUtils.isAdmin();

        console.log('ProtectedRoute - Auth check:', {
          isAuthenticated,
          isAdmin,
          requireAdmin,
          redirectTo
        });

        if (!isAuthenticated) {
          console.log('ProtectedRoute - Not authenticated, redirecting to login');
          authUtils.redirectToLogin();
          return;
        }

        if (requireAdmin && !isAdmin) {
          console.log('ProtectedRoute - Admin required but user is not admin');
          setIsAuthorized(false);
          setIsChecking(false);
          
          // Redirect to appropriate page
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            authUtils.redirectToLogin();
          }
          return;
        }

        setIsAuthorized(true);
        setIsChecking(false);
      };

      checkAuth();
    }, []);

    if (isChecking) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              {requireAdmin 
                ? "You don't have admin privileges to access this page."
                : "You need to be logged in to access this page."
              }
            </p>
            <button
              onClick={() => authUtils.redirectToLogin()}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * HOC for protecting admin routes
 */
export const withAdminAuth = (WrappedComponent) => {
  return ProtectedRoute(WrappedComponent, {
    requireAdmin: true,
    redirectTo: '/admin-panel'
  });
};

/**
 * HOC for protecting user routes
 */
export const withUserAuth = (WrappedComponent) => {
  return ProtectedRoute(WrappedComponent, {
    requireAdmin: false,
    redirectTo: '/login'
  });
};

export default ProtectedRoute;
