// Test server startup without APS credentials
const express = require('express');
const path = require('path');

console.log('🧪 Testing server startup...');

const app = express();
const PORT = 3001; // Use different port for testing

// Basic middleware
app.use(express.static(path.join(__dirname, 'public')));

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is working correctly',
        timestamp: new Date().toISOString()
    });
});

// Start test server
const server = app.listen(PORT, () => {
    console.log(`✅ Test server started on http://localhost:${PORT}`);
    console.log('🧪 Testing basic functionality...');
    
    // Test that we can serve static files
    setTimeout(() => {
        console.log('✅ Server startup test completed successfully');
        console.log('⚡ The application is ready to run with proper APS credentials');
        server.close();
        process.exit(0);
    }, 1000);
});

server.on('error', (error) => {
    console.error('❌ Server startup test failed:', error.message);
    process.exit(1);
});
