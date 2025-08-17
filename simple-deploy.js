#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SimpleDeployer {
  constructor() {
    this.scriptsFolder = __dirname;
    this.projectName = 'Slide Formatter';
  }

  async loadProjectFiles() {
    console.log('📁 Loading Apps Script project files...');
    
    const files = [];
    const fileExtensions = ['.gs'];
    
    // Read all .gs files in the current directory
    const dirFiles = fs.readdirSync(this.scriptsFolder);
    
    for (const fileName of dirFiles) {
      const filePath = path.join(this.scriptsFolder, fileName);
      const ext = path.extname(fileName);
      
      if (fileExtensions.includes(ext)) {
        const baseName = path.basename(fileName, ext);
        const source = fs.readFileSync(filePath, 'utf8');
        
        files.push({
          name: baseName,
          type: 'server_js',
          source: source
        });
        
        console.log(`  ✓ Loaded ${fileName} (${source.length} characters)`);
      }
    }
    
    // Add manifest file
    const manifest = this.generateManifest();
    files.push({
      name: 'appsscript',
      type: 'json',
      source: JSON.stringify(manifest, null, 2)
    });
    
    console.log(`  ✓ Generated appsscript.json manifest`);
    console.log(`📊 Total files: ${files.length}`);
    
    return files;
  }

  generateManifest() {
    return {
      timeZone: 'America/New_York',
      dependencies: {
        enabledAdvancedServices: [
          {
            userSymbol: 'Slides',
            serviceId: 'slides',
            version: 'v1'
          },
          {
            userSymbol: 'Drive',
            serviceId: 'drive',
            version: 'v2'
          },
          {
            userSymbol: 'Sheets',
            serviceId: 'sheets',
            version: 'v4'
          }
        ]
      },
      oauthScopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
      runtimeVersion: 'V8',
      executionApi: {
        access: 'MYSELF'
      }
    };
  }

  async generateProjectBundle() {
    try {
      console.log('🚀 Preparing Apps Script project bundle...');
      
      // Load project files
      const files = await this.loadProjectFiles();
      
      if (files.length === 0) {
        throw new Error('No .gs files found to deploy');
      }
      
      const projectData = {
        files: files
      };
      
      // Save as JSON for manual import
      const bundlePath = path.join(this.scriptsFolder, 'apps-script-bundle.json');
      fs.writeFileSync(bundlePath, JSON.stringify(projectData, null, 2));
      
      console.log('');
      console.log('✅ Apps Script project bundle created successfully!');
      console.log(`📁 Bundle saved as: ${bundlePath}`);
      console.log('');
      console.log('📋 Manual deployment instructions:');
      console.log('1. Go to https://script.google.com');
      console.log('2. Click "New Project"');
      console.log('3. Name it "Slide Formatter"');
      console.log('4. Copy the contents of each file from the bundle below:');
      console.log('');
      
      // Display file contents for easy copying
      files.forEach(file => {
        if (file.type === 'server_js') {
          console.log(`=== ${file.name}.gs ===`);
          console.log(file.source);
          console.log('');
        }
      });
      
      console.log('=== appsscript.json (Manifest) ===');
      console.log('Go to Project Settings → Show "appsscript.json" manifest file in editor');
      console.log(files.find(f => f.name === 'appsscript').source);
      console.log('');
      
      console.log('🎯 After manual setup:');
      console.log('1. Run the testFontSwap() function to verify installation');
      console.log('2. Open any Google Sheets to see the "Slide Formatter" menu');
      console.log('3. Test with presentation: 1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA');
      
      return bundlePath;
      
    } catch (error) {
      console.error('❌ Bundle generation failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const deployer = new SimpleDeployer();
  
  try {
    await deployer.generateProjectBundle();
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  main();
}

module.exports = SimpleDeployer;