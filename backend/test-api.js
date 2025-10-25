// Simple test script to verify API functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

const testAPI = async () => {
  console.log('🧪 Testing Retail KPI Backend API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful for user:', loginResponse.data.user.username);

    // Test product search
    console.log('\n3. Testing product search...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${productsResponse.data.products.length} products`);

    // Test autocomplete
    console.log('\n4. Testing product autocomplete...');
    const autocompleteResponse = await axios.get(`${BASE_URL}/products/autocomplete?q=so`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Autocomplete returned ${autocompleteResponse.data.suggestions.length} suggestions for "so"`);
    autocompleteResponse.data.suggestions.forEach(product => {
      console.log(`   - ${product.name} ($${product.price})`);
    });

    // Test bill creation
    console.log('\n5. Testing bill creation...');
    const billResponse = await axios.post(`${BASE_URL}/billing`, {
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 1 }
      ]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Bill created: ${billResponse.data.bill.bill_number} - Total: $${billResponse.data.bill.total_amount}`);

    // Test bill retrieval
    console.log('\n6. Testing bill retrieval...');
    const billsResponse = await axios.get(`${BASE_URL}/billing`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Retrieved ${billsResponse.data.bills.length} bills`);

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    if (error.response?.status === 500) {
      console.log('💡 Make sure the server is running: npm start');
    }
  }
};

// Run tests
testAPI();
