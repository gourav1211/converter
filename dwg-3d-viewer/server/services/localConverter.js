// DWG conversion service using LibreDWG + Assimp
const path = require('path');
const fs = require('fs');
const { convertDWGtoGLTF } = require('../../scripts/convert-dwg');

class LocalDWGConverter {
    constructor() {
        this.outputDir = path.join(__dirname, '../temp-conversions');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Convert DWG to glTF using LibreDWG + Assimp pipeline
     */
    async convertDWGToGLTF(inputPath, fileName) {
        try {
            console.log(`🔄 Converting ${fileName} locally using LibreDWG + Assimp...`);
            
            const outputName = fileName.replace('.dwg', '.gltf');
            const outputPath = path.join(this.outputDir, outputName);
            
            // Use LibreDWG → Assimp conversion
            await convertDWGtoGLTF(inputPath, outputPath);
            
            return { success: true, outputPath, format: 'gltf' };

        } catch (error) {
            console.error('❌ Local conversion failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Legacy method name for backward compatibility
     */
    async convertDWGToOBJ(inputPath, fileName) {
        console.log('⚠️  convertDWGToOBJ is deprecated, using convertDWGToGLTF instead');
        return this.convertDWGToGLTF(inputPath, fileName);
    }

    /**
     * Convert to a web-friendly format (glTF/GLB)
     */
    async convertToGLTF(objPath) {
        // This would require additional tools like Blender or Three.js CLI
        // For now, return the OBJ path as Three.js can load OBJ files
        return objPath;
    }

    /**
     * Clean up temporary files
     */
    cleanup(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🧹 Cleaned up: ${filePath}`);
            }
        } catch (error) {
            console.warn('Failed to cleanup file:', error.message);
        }
    }
}

module.exports = LocalDWGConverter;
