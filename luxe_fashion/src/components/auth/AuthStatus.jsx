import React, { useState, useEffect } from 'react';
import { authUtils } from '../../utils/api';

/**
 * Component to display current authentication status and localStorage data
 * Useful for debugging and demonstrating the enhanced auth system
 */
const AuthStatus = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    hasToken: false,
    tokenAge: null,
    timestamp: null
  });

  const updateAuthState = () => {
    const token = authUtils.getAuthToken();
    const timestamp = localStorage.getItem('authTimestamp');
    const isAdmin = authUtils.isAdmin();
    const isAuthenticated = authUtils.isAuthenticated();
    
    let tokenAge = null;
    if (timestamp) {
      tokenAge = Math.floor((Date.now() - parseInt(timestamp)) / (1000 * 60)); // Age in minutes
    }

    setAuthState({
      isAuthenticated,
      isAdmin,
      hasToken: !!token,
      tokenAge,
      timestamp: timestamp ? new Date(parseInt(timestamp)).toLocaleString() : null
    });
  };

  useEffect(() => {
    updateAuthState();
    
    // Update every 30 seconds to show real-time changes
    const interval = setInterval(updateAuthState, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearAuth = () => {
    authUtils.clearAuthToken();
    updateAuthState();
  };

  const handleTestAuth = async () => {
    try {
      // This will trigger the authentication check and potential redirect
      const response = await fetch('/api/user/getadmin', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authUtils.getAuthToken()}`
        }
      });
      
      if (response.status === 401) {
        alert('Authentication failed - you should be redirected to login');
      } else {
        alert('Authentication successful!');
      }
    } catch (error) {
      console.error('Auth test error:', error);
      alert('Auth test failed: ' + error.message);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Authentication Status</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Authenticated:</span>
          <span className={authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {authState.isAuthenticated ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Admin:</span>
          <span className={authState.isAdmin ? 'text-green-600' : 'text-gray-500'}>
            {authState.isAdmin ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Has Token:</span>
          <span className={authState.hasToken ? 'text-green-600' : 'text-red-600'}>
            {authState.hasToken ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        {authState.timestamp && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Created:</span>
            <span className="text-xs text-muted-foreground">{authState.timestamp}</span>
          </div>
        )}
        
        {authState.tokenAge !== null && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Age:</span>
            <span className="text-xs text-muted-foreground">
              {authState.tokenAge < 60 
                ? `${authState.tokenAge} min` 
                : `${Math.floor(authState.tokenAge / 60)}h ${authState.tokenAge % 60}m`
              }
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={updateAuthState}
          className="w-full bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
        >
          Refresh Status
        </button>
        
        <button
          onClick={handleTestAuth}
          className="w-full bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm hover:bg-secondary/90 transition-colors"
        >
          Test Authentication
        </button>
        
        <button
          onClick={handleClearAuth}
          className="w-full bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90 transition-colors"
        >
          Clear Auth Data
        </button>
      </div>
      
      <div className="mt-3 p-2 bg-muted rounded text-xs">
        <strong>How it works:</strong>
        <ul className="mt-1 space-y-1 text-muted-foreground">
          <li>• Cookies are primary auth method</li>
          <li>• localStorage provides fallback</li>
          <li>• Auto-redirect on auth failure</li>
          <li>• Token expiration handling</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthStatus;
