const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const LocalConverterService = require('./services/localConverterService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// Serve the uploads directory so the frontend can access converted models
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use a sanitized version of the original name for the output
        cb(null, file.originalname.replace(/[^a-zA-Z0-9._-]/g, ''));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.originalname.toLowerCase().endsWith('.dwg')) {
            cb(null, true);
        } else {
            cb(new Error('Only DWG files are allowed'));
        }
    }
});

// --- Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// File conversion endpoint using Local Converter
app.post('/api/convert', upload.single('dwgFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file uploaded' 
            });
        }

        console.log(`Processing file: ${req.file.originalname}`);
        console.log(`File saved to: ${req.file.path}`);

        // Use the local converter service
        const gltfPath = await LocalConverterService.convert(req.file.path);
        
        // The converted file is in the 'uploads' directory.
        // We need to provide a URL for the frontend to fetch it.
        const modelFileName = path.basename(gltfPath);
        
        res.json({
            success: true,
            modelUrl: `/uploads/${modelFileName}`, // e.g., /uploads/my-model.gltf
            message: 'File converted successfully using local converter.'
        });

    } catch (error) {
        console.error('❌ Conversion process failed:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message || 'An internal server error occurred during conversion.'
        });
    }
});

// --- Error Handling ---

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 50MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// --- Server Start ---

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check if the converter path needs to be updated
    if (LocalConverterService.converterPath.includes('C:\\path\\to\\your\\ODAFileConverter.exe')) {
        console.warn('🚨 ACTION REQUIRED: The local converter path is not set.');
        console.warn('   Please install the ODA File Converter and update the path in:');
        console.warn('   server/services/localConverterService.js');
    }
});

module.exports = app;
