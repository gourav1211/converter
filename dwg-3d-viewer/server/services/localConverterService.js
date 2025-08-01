const path = require('path');
const fs = require('fs');
const { convertDWGtoGLTF } = require('../../scripts/convert-dwg');

/**
 * Handles local DWG to glTF conversion using LibreDWG + Assimp.
 * 
 * Prerequisites:
 * - sudo apt install libredwg-utils (provides dwgread)
 * - sudo apt install assimp-utils (provides assimp CLI)
 */
class LocalConverterService {
    constructor() {
        // Check if required tools are available
        this.checkDependencies();
    }

    /**
     * Check if LibreDWG and Assimp are installed
     */
    checkDependencies() {
        const { execSync } = require('child_process');
        
        try {
            // Check dwgread
            execSync('which dwgread', { stdio: 'pipe' });
        } catch (error) {
            console.warn('⚠️  dwgread not found. Install with: sudo apt install libredwg-utils');
        }

        try {
            // Check assimp
            execSync('which assimp', { stdio: 'pipe' });
        } catch (error) {
            console.warn('⚠️  assimp not found. Install with: sudo apt install assimp-utils');
        }
    }

    /**
     * Converts a DWG file to glTF format using LibreDWG → Assimp pipeline.
     * @param {string} dwgFilePath - The absolute path to the input DWG file.
     * @returns {Promise<string>} A promise that resolves with the path to the converted glTF file.
     */
    async convert(dwgFilePath) {
        try {
            console.log(`🔄 Converting DWG to glTF: ${dwgFilePath}`);
            
            // Generate output path
            const outputDir = path.dirname(dwgFilePath);
            const outputFileName = `${path.basename(dwgFilePath, path.extname(dwgFilePath))}.gltf`;
            const outputPath = path.join(outputDir, outputFileName);

            // Use our conversion script
            const result = await convertDWGtoGLTF(dwgFilePath, outputPath);
            
            console.log(`✅ Conversion successful. Output: ${result}`);
            return result;

        } catch (error) {
            console.error(`❌ Local conversion failed: ${error.message}`);
            
            // Provide helpful error messages
            if (error.message.includes('dwgread')) {
                throw new Error('LibreDWG not found. Install with: sudo apt install libredwg-utils');
            } else if (error.message.includes('assimp')) {
                throw new Error('Assimp not found. Install with: sudo apt install assimp-utils');
            } else {
                throw new Error(`DWG conversion failed: ${error.message}`);
            }
        }
    }
}

module.exports = new LocalConverterService();

