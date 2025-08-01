# DWG to 3D Viewer

A full-stack web application that converts AutoCAD DWG files to interactive 3D models using Autodesk Platform Services (APS) and displays them in a web browser.

## Features

- **Drag & Drop Interface**: Easy file upload with drag-and-drop functionality
- **Real-time Conversion**: Converts DWG files to 3D models using Autodesk Platform Services
- **Interactive 3D Viewer**: View and interact with 3D models directly in the browser
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Progress Tracking**: Real-time status updates during file processing
- **Error Handling**: Comprehensive error handling and user feedback

## Technology Stack

### Frontend
- **HTML5**: Modern semantic markup
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vanilla JavaScript**: Pure JavaScript for all client-side logic
- **Autodesk Platform Services Viewer**: Official 3D viewer for CAD files

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Multer**: Middleware for handling file uploads
- **Autodesk Platform Services SDK**: Integration with Autodesk's cloud services

### Cloud Services
- **Autodesk Platform Services (APS)**: File conversion and 3D rendering
- **Object Storage Service (OSS)**: Cloud file storage
- **Model Derivative API**: File format conversion

## Prerequisites

1. **Node.js**: Version 14.x or higher
2. **Autodesk Platform Services Account**: 
   - Sign up at [https://forge.autodesk.com/](https://forge.autodesk.com/)
   - Create an app to get your Client ID and Client Secret
3. **AutoCAD DWG Files**: For testing the application

## Setup Instructions

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd dwg-3d-viewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Autodesk Platform Services

1. Go to [Autodesk Platform Services](https://forge.autodesk.com/)
2. Sign in or create an account
3. Create a new app:
   - Click "Create App"
   - Choose "Server-to-Server" workflow
   - Select the following APIs:
     - Data Management API
     - Model Derivative API
   - Note down your **Client ID** and **Client Secret**

### 4. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:
   ```env
   APS_CLIENT_ID=your_actual_client_id_here
   APS_CLIENT_SECRET=your_actual_client_secret_here
   PORT=3000
   NODE_ENV=development
   ```

### 5. Run the Application

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 6. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Uploading and Converting Files

1. **Upload a DWG File**:
   - Drag and drop a `.dwg` file onto the upload area, or
   - Click "Select File" to browse and choose a file
   - Maximum file size: 50MB

2. **Conversion Process**:
   - The file is uploaded to Autodesk's cloud storage
   - A conversion job is started to process the DWG file
   - The system monitors the job status until completion
   - Progress updates are shown in real-time

3. **3D Model Viewing**:
   - Once converted, the 3D model appears in the viewer
   - Use mouse controls to interact with the model:
     - **Rotate**: Left click and drag
     - **Zoom**: Mouse wheel or right click and drag
     - **Pan**: Middle click and drag

### Supported File Formats

- **Input**: AutoCAD DWG files (.dwg)
- **Output**: Interactive 3D models viewable in web browsers

## Project Structure

```
dwg-3d-viewer/
├── package.json              # Project dependencies and scripts
├── .env.example              # Environment variables template
├── README.md                 # This file
├── public/                   # Frontend static files
│   ├── index.html           # Main HTML page
│   └── js/
│       └── app.js           # Frontend JavaScript application
└── server/                   # Backend Node.js application
    ├── index.js             # Main server file
    ├── uploads/             # Temporary file storage (auto-created)
    └── services/
        └── autodeskService.js # Autodesk Platform Services integration
```

## API Endpoints

### `POST /api/convert`
Uploads and converts a DWG file to 3D format.

**Request**: Multipart form data with `dwgFile` field
**Response**: 
```json
{
  "success": true,
  "urn": "converted_model_urn",
  "viewerToken": "access_token_for_viewer",
  "message": "File converted successfully"
}
```

### `GET /api/viewer-token`
Gets a fresh viewer token for accessing 3D models.

**Response**:
```json
{
  "success": true,
  "token": "viewer_access_token",
  "expires_in": 3600
}
```

### `GET /api/health`
Health check endpoint.

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `APS_CLIENT_ID` | Autodesk Platform Services Client ID | Yes | - |
| `APS_CLIENT_SECRET` | Autodesk Platform Services Client Secret | Yes | - |
| `PORT` | Server port number | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |

### File Upload Limits

- **Maximum file size**: 50MB
- **Supported formats**: .dwg files only
- **Concurrent uploads**: 1 per session

## Troubleshooting

### Common Issues

1. **"Authentication failed" error**:
   - Verify your APS_CLIENT_ID and APS_CLIENT_SECRET are correct
   - Ensure your Autodesk Platform Services app has the required permissions
   - Check that your credentials haven't expired

2. **"File conversion failed" error**:
   - Ensure the uploaded file is a valid DWG format
   - Check that the file isn't corrupted
   - Verify the file size is under 50MB

3. **"Failed to load 3D model" error**:
   - This may occur if the conversion process was interrupted
   - Try uploading the file again
   - Check the browser console for detailed error messages

4. **Viewer not loading**:
   - Ensure you have a stable internet connection
   - Check if third-party cookies are blocked
   - Try refreshing the page

### Debug Mode

To enable detailed logging, set the environment variable:
```env
NODE_ENV=development
```

This will provide more detailed console output for troubleshooting.

### Log Files

Server logs are output to the console. In production, consider redirecting these to log files:

```bash
npm start > app.log 2>&1
```

## Development

### Adding New Features

1. **Frontend**: Modify `public/js/app.js` and `public/index.html`
2. **Backend**: Add new routes in `server/index.js` or create new service files
3. **Styling**: Update the Tailwind CSS classes in the HTML

### Testing

Test the application with various DWG files to ensure compatibility:

1. Simple 2D drawings
2. Complex 3D models  
3. Files with different AutoCAD versions
4. Large files (approaching the 50MB limit)

## Security Considerations

1. **API Keys**: Never commit your `.env` file to version control
2. **File Validation**: The application validates file types and sizes
3. **CORS**: Configure CORS settings for production deployment
4. **Rate Limiting**: Consider adding rate limiting for production use

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure proper logging
3. Set up process monitoring (PM2, etc.)
4. Configure reverse proxy (Nginx, Apache)
5. Enable HTTPS

### Example PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dwg-3d-viewer',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

1. Check the troubleshooting section above
2. Review the [Autodesk Platform Services documentation](https://forge.autodesk.com/en/docs/)
3. Create an issue in this repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Acknowledgments

- [Autodesk Platform Services](https://forge.autodesk.com/) for the conversion and viewing capabilities
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Express.js](https://expressjs.com/) for the web framework
