// Quick test script to verify APS authentication and available endpoints
const AutodeskService = require('./server/services/autodeskService');
require('dotenv').config();

async function testAPS() {
    console.log('🧪 Testing Autodesk Platform Services...');
    
    const service = new AutodeskService();
    
    try {
        // Test authentication
        console.log('1️⃣ Testing authentication...');
        const token = await service.getAccessToken();
        console.log('✅ Authentication successful');
        console.log(`   Token length: ${token.length}`);
        
        // Test bucket creation
        console.log('2️⃣ Testing bucket creation...');
        await service.ensureBucket();
        console.log('✅ Bucket operations successful');
        
        console.log('\n🎉 APS integration is working correctly!');
        console.log('   You can now try uploading DWG files through the web interface.');
        
    } catch (error) {
        console.error('❌ APS test failed:', error.message);
        console.error('   Full error:', error);
    }
}

testAPS();
