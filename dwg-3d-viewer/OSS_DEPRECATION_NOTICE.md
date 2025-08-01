# 🚨 IMPORTANT: Autodesk Platform Services Update (2025)

## 📋 Current Status

The **Object Storage Service (OSS) v2 API has been officially deprecated** by Autodesk as of 2025. This means the traditional approach of uploading DWG files to OSS buckets and converting them using the Model Derivative API is **no longer supported**.

## 🔄 What This Means

1. **OSS v2 Upload**: ❌ Deprecated (returns "Legacy endpoint is deprecated")
2. **Model Derivative API**: ⚠️  Still works but requires different file sources
3. **Bucket Creation**: ✅ Still works (for compatibility)
4. **Authentication**: ✅ Still works

## 🎯 Current Working Solutions

### Option 1: Autodesk Construction Cloud (ACC) Integration

**Recommended Approach** - Use ACC for file management:

```javascript
// Upload to ACC project instead of OSS
const accResponse = await axios.post(
  'https://developer.api.autodesk.com/data/v1/projects/{project_id}/storage',
  storagePayload,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json'
    }
  }
);
```

**Requirements:**
- ACC/BIM 360 account and project setup
- Different API scopes and permissions
- Project-based file management

### Option 2: Alternative Conversion Services

**Third-party solutions that might work:**
- **Open Design Alliance (ODA)** - DWG file conversion
- **ASPOSE.CAD** - Cloud-based CAD conversion
- **CloudConvert** - Multi-format file conversion
- **LibreCAD** or **FreeCAD** - Open source conversion tools

### Option 3: Local Conversion + Web Viewer

**Hybrid approach:**
1. Convert DWG to OBJ/STL/glTF locally using open-source tools
2. Upload converted files to your own storage
3. Display using Three.js or other web 3D viewers

## 🛠️ Implementation Recommendations

### Immediate Solution: Local Conversion

1. **Install DWG conversion tools:**
   ```bash
   # Install ODA File Converter (free)
   # Or use LibreCAD command line tools
   ```

2. **Update the backend to use local conversion:**
   ```javascript
   // Convert DWG to OBJ locally
   const convertedFile = await convertDWGLocally(dwgFile);
   // Serve the converted file directly
   ```

3. **Use Three.js for 3D viewing** (already implemented in frontend)

### Long-term Solution: ACC Integration

1. **Set up Autodesk Construction Cloud account**
2. **Create a project in ACC**
3. **Update API to use Data Management API with proper project ID**
4. **Use ACC as file storage instead of deprecated OSS**

## 🔧 Code Updates Needed

### Backend Changes
- Replace OSS upload with ACC Data Management API
- Update authentication scopes for ACC access
- Implement project-based file management

### Frontend Changes
- Update file upload to handle ACC workflow
- Add project selection if multiple projects
- Handle different response formats

## 📞 Next Steps

**Choose one of these paths:**

1. **Quick Fix**: Implement local DWG conversion + Three.js viewer
2. **Proper Fix**: Set up ACC integration and update all APIs
3. **Alternative**: Use third-party conversion service

The current codebase is well-structured and can support any of these approaches with modifications to the upload and conversion logic.

---

**Note**: This deprecation affects all applications using OSS v2 for file uploads. The entire Autodesk ecosystem is moving towards Construction Cloud-based workflows.
