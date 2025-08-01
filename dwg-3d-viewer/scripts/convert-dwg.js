// scripts/convert-dwg.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function convertDWGtoGLTF(inDwg, outGltf) {
  const tmpDxf = path.join(path.dirname(inDwg), path.basename(inDwg, '.dwg') + '.dxf');

  try {
    // 1) DWG → DXF using LibreDWG
    console.log(`Converting DWG → DXF: ${inDwg} → ${tmpDxf}`);
    execSync(`dwgread "${inDwg}" -o "${tmpDxf}"`, { stdio: 'inherit' });

    // Check if DXF was created
    if (!fs.existsSync(tmpDxf)) {
      throw new Error('DXF conversion failed - output file not created');
    }

    // 2) DXF → glTF using Assimp
    console.log(`Converting DXF → glTF: ${tmpDxf} → ${outGltf}`);
    execSync(`assimp export "${tmpDxf}" "${outGltf}"`, { stdio: 'inherit' });

    // Check if glTF was created
    if (!fs.existsSync(outGltf)) {
      throw new Error('glTF conversion failed - output file not created');
    }

    // Clean up temporary DXF file
    try {
      fs.unlinkSync(tmpDxf);
      console.log(`Cleaned up temporary file: ${tmpDxf}`);
    } catch (cleanupError) {
      console.warn(`Warning: Could not clean up temporary file ${tmpDxf}:`, cleanupError.message);
    }

    console.log('✅ Conversion complete:', outGltf);
    return outGltf;

  } catch (error) {
    // Clean up temporary files on error
    try {
      if (fs.existsSync(tmpDxf)) {
        fs.unlinkSync(tmpDxf);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    console.error('❌ Conversion failed:', error.message);
    throw error;
  }
}

// Export for use as module
module.exports = { convertDWGtoGLTF };

// CLI usage: node convert-dwg.js model.dwg model.gltf
if (require.main === module) {
  const [,, inDwg, outGltf] = process.argv;
  
  if (!inDwg) {
    console.error('Usage: node scripts/convert-dwg.js <input.dwg> [output.gltf]');
    console.error('');
    console.error('Prerequisites:');
    console.error('  sudo apt install libredwg-utils assimp-utils');
    process.exit(1);
  }

  const outputFile = outGltf || path.join(path.dirname(inDwg), path.basename(inDwg, '.dwg') + '.gltf');
  
  try {
    convertDWGtoGLTF(inDwg, outputFile);
  } catch (error) {
    process.exit(1);
  }
} 