// Test current Autodesk Platform Services endpoints
const axios = require('axios');
require('dotenv').config();

async function testEndpoints() {
    console.log('🔍 Testing current APS endpoints...');
    
    const clientId = process.env.APS_CLIENT_ID;
    const clientSecret = process.env.APS_CLIENT_SECRET;
    
    try {
        // Test authentication
        console.log('1️⃣ Testing authentication endpoint...');
        
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'data:read data:write data:create bucket:create bucket:read');

        const authResponse = await axios.post(
            'https://developer.api.autodesk.com/authentication/v2/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const token = authResponse.data.access_token;
        console.log('✅ Authentication successful');
        
        // Test OSS endpoints
        console.log('2️⃣ Testing OSS bucket endpoints...');
        
        try {
            const bucketsResponse = await axios.get(
                'https://developer.api.autodesk.com/oss/v2/buckets',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log('✅ OSS v2 buckets endpoint is working');
            console.log(`   Found ${bucketsResponse.data.items?.length || 0} buckets`);
        } catch (ossError) {
            console.log('❌ OSS v2 buckets endpoint failed:', ossError.response?.data || ossError.message);
        }
        
        // Test alternative endpoints
        console.log('3️⃣ Testing alternative API endpoints...');
        
        try {
            const forgeResponse = await axios.get(
                'https://developer.api.autodesk.com/project/v1/hubs',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log('✅ Project API v1 hubs endpoint is working');
        } catch (projectError) {
            console.log('❌ Project API v1 hubs endpoint failed:', projectError.response?.data || projectError.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEndpoints();
