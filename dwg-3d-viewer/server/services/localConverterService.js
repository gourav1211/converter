const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Handles local DWG to glTF conversion using a command-line tool.
 */
class LocalConverterService {
    constructor() {
        // IMPORTANT: You must install a DWG to glTF converter (like the ODA File Converter)
        // and update the path to the executable below.
        // ODA Converter download: https://www.opendesign.com/guestfiles/oda-file-converter
        //
        // After installation, replace the placeholder path with the actual path.
        // Example for Windows: 'C:\\Program Files\\ODA\\ODAFileConverter_25.12.0\\ODAFileConverter.exe'
        this.converterPath = 'c:\Program Files\ODA\ODAFileConverter26.4.0\ODAFileConverter.exe'; // <-- 🚨 UPDATE THIS PATH
    }

    /**
     * Converts a DWG file to glTF format.
     * @param {string} dwgFilePath - The absolute path to the input DWG file.
     * @returns {Promise<string>} A promise that resolves with the path to the converted glTF file.
     */
    async convert(dwgFilePath) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.converterPath) || this.converterPath.includes('C:\\path\\to\\your\\ODAFileConverter.exe')) {
                const errorMessage = `Converter executable not found or path not set. Please install a DWG converter (e.g., ODA File Converter) and update the path in server/services/localConverterService.js.`;
                console.error(`❌ ${errorMessage}`);
                return reject(new Error(errorMessage));
            }

            const outputDir = path.dirname(dwgFilePath);
            const outputFileName = `${path.basename(dwgFilePath, path.extname(dwgFilePath))}.gltf`;
            const outputPath = path.join(outputDir, outputFileName);

            // This command is specific to the ODA File Converter.
            // It specifies input, output, format, and other parameters.
            const command = `"${this.converterPath}" "${dwgFilePath}" "${outputDir}" "" "GLTF" "1"`;

            console.log(`Executing conversion: ${command}`);

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Conversion execution failed: ${error.message}`);
                    console.error(`stderr: ${stderr}`);
                    return reject(new Error(`File conversion process failed.`));
                }

                if (!fs.existsSync(outputPath)) {
                    console.error(`❌ Conversion error: Output file not found at ${outputPath}.`);
                    console.error(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    return reject(new Error('Conversion failed: The output file was not created. Check converter logs.'));
                }
                
                console.log(`✅ Conversion successful. Output: ${outputPath}`);
                resolve(outputPath);
            });
        });
    }
}

module.exports = new LocalConverterService();

