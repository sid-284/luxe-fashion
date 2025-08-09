#!/usr/bin/env node

// Test script to verify CORS configuration with credentials
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://luxe-fashion.vercel.app'
];

async function testCORSWithCredentials() {
  console.log('🧪 Testing CORS Configuration with Credentials...\n');
  
  for (const origin of FRONTEND_ORIGINS) {
    console.log(`\n📍 Testing origin: ${origin}`);
    
    try {
      // Test 1: OPTIONS preflight request
      console.log('  1. Testing OPTIONS preflight...');
      const optionsResponse = await fetch(`${BACKEND_URL}/api/auth/adminlogin`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log(`     Status: ${optionsResponse.status}`);
      console.log(`     Access-Control-Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`     Access-Control-Allow-Credentials: ${optionsResponse.headers.get('Access-Control-Allow-Credentials')}`);
      console.log(`     Access-Control-Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);
      
      if (optionsResponse.status === 200) {
        console.log('     ✅ OPTIONS request successful');
      } else {
        console.log('     ❌ OPTIONS request failed');
      }

      // Test 2: Actual POST request with credentials
      console.log('  2. Testing POST with credentials...');
      const postResponse = await fetch(`${BACKEND_URL}/api/auth/adminlogin`, {
        method: 'POST',
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        },
        credentials: 'include', // This is the key for cookie handling
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      });
      
      console.log(`     Status: ${postResponse.status}`);
      console.log(`     Access-Control-Allow-Origin: ${postResponse.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`     Access-Control-Allow-Credentials: ${postResponse.headers.get('Access-Control-Allow-Credentials')}`);
      console.log(`     Set-Cookie: ${postResponse.headers.get('Set-Cookie') ? 'Present' : 'Not present'}`);
      
      if (postResponse.headers.get('Access-Control-Allow-Credentials') === 'true') {
        console.log('     ✅ Credentials allowed');
      } else {
        console.log('     ❌ Credentials not allowed');
      }

      // Test 3: Health check endpoint
      console.log('  3. Testing health check...');
      const healthResponse = await fetch(`${BACKEND_URL}/api/health`, {
        headers: {
          'Origin': origin
        },
        credentials: 'include'
      });
      
      console.log(`     Status: ${healthResponse.status}`);
      console.log(`     Access-Control-Allow-Origin: ${healthResponse.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`     Access-Control-Allow-Credentials: ${healthResponse.headers.get('Access-Control-Allow-Credentials')}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('     ✅ Health check successful:', healthData.status);
      } else {
        console.log('     ❌ Health check failed');
      }

    } catch (error) {
      console.log(`     ❌ Error testing ${origin}:`, error.message);
    }
  }

  // Test 4: Test with invalid origin
  console.log('\n📍 Testing invalid origin (should be blocked):');
  try {
    const invalidResponse = await fetch(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': 'https://malicious-site.com'
      },
      credentials: 'include'
    });
    
    console.log(`     Status: ${invalidResponse.status}`);
    console.log(`     Access-Control-Allow-Origin: ${invalidResponse.headers.get('Access-Control-Allow-Origin')}`);
    
    if (invalidResponse.headers.get('Access-Control-Allow-Origin') === 'https://malicious-site.com') {
      console.log('     ❌ Invalid origin was allowed (security issue!)');
    } else {
      console.log('     ✅ Invalid origin was properly blocked');
    }
  } catch (error) {
    console.log('     ✅ Invalid origin was blocked:', error.message);
  }

  console.log('\n🎉 CORS testing completed!');
  console.log('\n📋 Summary:');
  console.log('- Make sure Access-Control-Allow-Credentials is "true"');
  console.log('- Make sure Access-Control-Allow-Origin matches the request origin exactly');
  console.log('- Make sure Set-Cookie headers are present for login requests');
  console.log('- Make sure invalid origins are blocked');
}

// Run the test
testCORSWithCredentials();
