const fs = require('fs');
const path = require('path');

console.log('🚀 DWG to 3D Viewer - Initial Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log('📄 Creating .env file from template...');
        try {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✅ .env file created successfully');
        } catch (error) {
            console.error('❌ Failed to create .env file:', error.message);
        }
    } else {
        console.log('⚠️  .env.example file not found');
    }
} else {
    console.log('✅ .env file already exists');
}

// Check environment variables
require('dotenv').config();

const clientId = process.env.APS_CLIENT_ID;
const clientSecret = process.env.APS_CLIENT_SECRET;

console.log('\n🔧 Configuration Check:');
console.log('=======================');

if (!clientId || clientId === 'your_client_id_here') {
    console.log('❌ APS_CLIENT_ID not configured');
} else {
    console.log('✅ APS_CLIENT_ID configured');
}

if (!clientSecret || clientSecret === 'your_client_secret_here') {
    console.log('❌ APS_CLIENT_SECRET not configured');
} else {
    console.log('✅ APS_CLIENT_SECRET configured');
}

if ((!clientId || clientId === 'your_client_id_here') || 
    (!clientSecret || clientSecret === 'your_client_secret_here')) {
    
    console.log('\n🔗 To get your Autodesk Platform Services credentials:');
    console.log('1. Go to https://forge.autodesk.com/');
    console.log('2. Sign in or create an account');
    console.log('3. Create a new app');
    console.log('4. Copy your Client ID and Client Secret');
    console.log('5. Update the .env file with your credentials');
    console.log('\n⚠️  The application will not work without valid credentials');
} else {
    console.log('\n🎉 Configuration looks good!');
    console.log('You can now run: npm start');
}

console.log('\n📚 For more information, see README.md');
console.log('=====================================');
