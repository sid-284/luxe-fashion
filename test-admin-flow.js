#!/usr/bin/env node

// Test script to verify admin authentication flow
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BACKEND_URL = 'http://localhost:8000';
const ADMIN_EMAIL = 'admin_9twoofficialinfo';
const ADMIN_PASSWORD = 'admin921992';

async function testAdminFlow() {
  console.log('🧪 Testing Complete Admin Flow...\n');
  
  try {
    // Test 1: Admin Login
    console.log('1. Testing admin login...');
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
    
    // Get cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies received:', cookies ? 'Yes' : 'No');
    console.log('Cookie details:', cookies);
    
    if (!cookies) {
      console.log('❌ No cookies received from login');
      return;
    }
    
    console.log('✅ Admin login successful');
    
    // Test 2: Verify admin status
    console.log('\n2. Testing admin verification...');
    const verifyResponse = await fetch(`${BACKEND_URL}/api/user/getadmin`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('Verify response status:', verifyResponse.status);
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('Verify response:', verifyData);
      console.log('✅ Admin verification successful');
    } else {
      const errorData = await verifyResponse.json();
      console.log('❌ Admin verification failed:', errorData);
    }
    
    // Test 3: Test product addition
    console.log('\n3. Testing product addition...');
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      price: '100',
      category: 'Women',
      subCategory: 'Topwear',
      sizes: JSON.stringify(['S', 'M', 'L']),
      bestseller: false
    };
    
    const addProductResponse = await fetch(`${BACKEND_URL}/api/product/addproduct`, {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    console.log('Add product response status:', addProductResponse.status);
    if (addProductResponse.ok) {
      const productResult = await addProductResponse.json();
      console.log('✅ Product addition successful:', productResult);
    } else {
      const errorData = await addProductResponse.json();
      console.log('❌ Product addition failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAdminFlow();
