const express = require('express');
const path = require('path');

console.log('✅ Testing basic setup...');

// Test that all required modules can be loaded
try {
    console.log('📦 Testing Express.js...');
    const app = express();
    console.log('✅ Express.js loaded successfully');

    console.log('📦 Testing Multer...');
    const multer = require('multer');
    console.log('✅ Multer loaded successfully');

    console.log('📦 Testing CORS...');
    const cors = require('cors');
    console.log('✅ CORS loaded successfully');

    console.log('📦 Testing Axios...');
    const axios = require('axios');
    console.log('✅ Axios loaded successfully');

    console.log('📦 Testing UUID...');
    const { v4: uuidv4 } = require('uuid');
    console.log('✅ UUID loaded successfully');

    console.log('📦 Testing dotenv...');
    require('dotenv').config();
    console.log('✅ dotenv loaded successfully');

    console.log('📦 Testing FormData...');
    const FormData = require('form-data');
    console.log('✅ FormData loaded successfully');

    console.log('\n🎉 All dependencies are installed correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your Autodesk Platform Services credentials');
    console.log('3. Run "npm start" to launch the application');
    console.log('\n🔗 Get APS credentials at: https://forge.autodesk.com/');

} catch (error) {
    console.error('❌ Error loading dependencies:', error.message);
    process.exit(1);
}
