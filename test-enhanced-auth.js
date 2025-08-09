#!/usr/bin/env node

// Test script to verify enhanced authentication flow with localStorage
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BACKEND_URL = 'http://localhost:8000';
const ADMIN_EMAIL = 'admin_9twoofficialinfo';
const ADMIN_PASSWORD = 'admin921992';

// Simulate localStorage for Node.js testing
const localStorage = {
  storage: {},
  setItem(key, value) {
    this.storage[key] = value;
  },
  getItem(key) {
    return this.storage[key] || null;
  },
  removeItem(key) {
    delete this.storage[key];
  },
  clear() {
    this.storage = {};
  }
};

// Simulate authUtils for testing
const authUtils = {
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authTimestamp', Date.now().toString());
    }
  },

  getAuthToken: () => {
    const token = localStorage.getItem('authToken');
    const timestamp = localStorage.getItem('authTimestamp');
    
    if (token && timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = token.includes('admin') ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      
      if (tokenAge > maxAge) {
        authUtils.clearAuthToken();
        return null;
      }
      return token;
    }
    return null;
  },

  clearAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('isAdminAuthenticated');
  },

  setAdminAuth: (isAdmin) => {
    localStorage.setItem('isAdminAuthenticated', isAdmin.toString());
  },

  isAdmin: () => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  },

  isAuthenticated: () => {
    return !!authUtils.getAuthToken();
  }
};

async function testEnhancedAuth() {
  console.log('🧪 Testing Enhanced Authentication Flow...\n');
  
  try {
    // Clear any existing auth data
    authUtils.clearAuthToken();
    console.log('✅ Cleared existing auth data');

    // Test 1: Admin Login with token storage
    console.log('\n1. Testing admin login with localStorage...');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/adminlogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }

    // Store token in localStorage (simulating frontend behavior)
    if (loginData.token) {
      authUtils.setAuthToken(loginData.token);
      authUtils.setAdminAuth(true);
      console.log('✅ Token stored in localStorage');
      console.log('📱 localStorage state:', {
        hasToken: !!authUtils.getAuthToken(),
        isAdmin: authUtils.isAdmin(),
        isAuthenticated: authUtils.isAuthenticated()
      });
    } else {
      console.log('❌ No token in response');
      return;
    }

    // Get cookies from response for cookie-based auth
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies received:', cookies ? 'Yes' : 'No');

    // Test 2: Verify admin status with cookie
    console.log('\n2. Testing admin verification with cookie...');
    const verifyResponseCookie = await fetch(`${BACKEND_URL}/api/user/getadmin`, {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    console.log('Cookie auth response status:', verifyResponseCookie.status);
    if (verifyResponseCookie.ok) {
      const verifyData = await verifyResponseCookie.json();
      console.log('✅ Cookie authentication successful:', verifyData);
    } else {
      console.log('❌ Cookie authentication failed');
    }

    // Test 3: Verify admin status with Authorization header (localStorage fallback)
    console.log('\n3. Testing admin verification with Authorization header...');
    const token = authUtils.getAuthToken();
    const verifyResponseHeader = await fetch(`${BACKEND_URL}/api/user/getadmin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Header auth response status:', verifyResponseHeader.status);
    if (verifyResponseHeader.ok) {
      const verifyData = await verifyResponseHeader.json();
      console.log('✅ Authorization header authentication successful:', verifyData);
    } else {
      console.log('❌ Authorization header authentication failed');
    }

    // Test 4: Test product addition with both auth methods
    console.log('\n4. Testing product addition with cookie auth...');
    const productData = {
      name: 'Test Product Enhanced Auth',
      description: 'Test Description',
      price: '100',
      category: 'Women',
      subCategory: 'Topwear',
      sizes: JSON.stringify(['S', 'M', 'L']),
      bestseller: false
    };
    
    const addProductResponseCookie = await fetch(`${BACKEND_URL}/api/product/addproduct`, {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    console.log('Product addition (cookie) status:', addProductResponseCookie.status);
    if (addProductResponseCookie.ok) {
      console.log('✅ Product addition with cookie successful');
    } else {
      console.log('❌ Product addition with cookie failed');
    }

    // Test 5: Test product addition with Authorization header
    console.log('\n5. Testing product addition with Authorization header...');
    const addProductResponseHeader = await fetch(`${BACKEND_URL}/api/product/addproduct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...productData,
        name: 'Test Product Header Auth'
      })
    });
    
    console.log('Product addition (header) status:', addProductResponseHeader.status);
    if (addProductResponseHeader.ok) {
      console.log('✅ Product addition with Authorization header successful');
    } else {
      console.log('❌ Product addition with Authorization header failed');
    }

    // Test 6: Test token expiration simulation
    console.log('\n6. Testing token expiration handling...');
    // Simulate expired token by setting old timestamp
    localStorage.setItem('authTimestamp', (Date.now() - 25 * 60 * 60 * 1000).toString()); // 25 hours ago
    
    const expiredToken = authUtils.getAuthToken();
    console.log('Token after expiration simulation:', expiredToken ? 'Still valid' : 'Expired and cleared');
    
    if (!expiredToken) {
      console.log('✅ Token expiration handling works correctly');
    } else {
      console.log('❌ Token expiration handling failed');
    }

    // Test 7: Test logout
    console.log('\n7. Testing logout...');
    const logoutResponse = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    console.log('Logout response status:', logoutResponse.status);
    authUtils.clearAuthToken(); // Simulate frontend clearing localStorage
    
    console.log('📱 localStorage after logout:', {
      hasToken: !!authUtils.getAuthToken(),
      isAdmin: authUtils.isAdmin(),
      isAuthenticated: authUtils.isAuthenticated()
    });

    console.log('\n🎉 Enhanced authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEnhancedAuth();
