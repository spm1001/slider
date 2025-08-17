#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

class AppsScriptDeployer {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.scriptsFolder = __dirname;
    this.projectName = 'Slide Formatter';
    this.requiredScopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.scripts',
      'https://www.googleapis.com/auth/script.projects'
    ];
  }

  async authenticate() {
    console.log('🔐 Authenticating with Google APIs...');
    
    // Initialize OAuth2 client
    const credentials = await this.loadCredentials();
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
    
    this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    // Check for existing token
    try {
      const token = await this.loadToken();
      this.auth.setCredentials(token);
      console.log('✅ Using existing authentication token');
    } catch (error) {
      console.log('🔄 No valid token found, starting authentication flow...');
      await this.getNewToken();
    }
    
    this.drive = google.drive({ version: 'v2', auth: this.auth });
    console.log('✅ Authentication successful');
  }

  async loadCredentials() {
    const credentialsPath = path.join(this.scriptsFolder, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`
❌ Credentials file not found: ${credentialsPath}

Please download your OAuth 2.0 credentials from Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID for Desktop Application
3. Download the JSON file and save as 'credentials.json'
      `);
    }
    
    return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }

  async loadToken() {
    const tokenPath = path.join(this.scriptsFolder, 'token.json');
    if (!fs.existsSync(tokenPath)) {
      throw new Error('Token file not found');
    }
    
    return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  }

  async getNewToken() {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.requiredScopes,
    });

    console.log('🌐 Please visit this URL to authorize the application:');
    console.log(authUrl);
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('📋 Enter the authorization code: ', async (code) => {
        rl.close();
        
        try {
          const { tokens } = await this.auth.getToken(code);
          this.auth.setCredentials(tokens);
          
          // Save token for future use
          const tokenPath = path.join(this.scriptsFolder, 'token.json');
          fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
          console.log('💾 Token saved for future use');
          
          resolve(tokens);
        } catch (error) {
          reject(new Error(`Authentication failed: ${error.message}`));
        }
      });
    });
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

  async findExistingProject() {
    console.log('🔍 Checking for existing Apps Script project...');
    
    try {
      const response = await this.drive.files.list({
        q: `mimeType='application/vnd.google-apps.script' and title='${this.projectName}' and trashed=false`,
        fields: 'items(id,title,modifiedDate)'
      });
      
      if (response.data.items && response.data.items.length > 0) {
        const project = response.data.items[0];
        console.log(`✅ Found existing project: ${project.title} (${project.id})`);
        console.log(`   Last modified: ${project.modifiedDate}`);
        return project.id;
      }
      
      console.log('📝 No existing project found, will create new one');
      return null;
    } catch (error) {
      console.warn(`⚠️  Error searching for existing project: ${error.message}`);
      return null;
    }
  }

  async createNewProject(files) {
    console.log('🚀 Creating new Apps Script project...');
    
    const projectData = {
      files: files
    };
    
    try {
      const response = await this.drive.files.insert({
        requestBody: {
          title: this.projectName,
          mimeType: 'application/vnd.google-apps.script'
        },
        media: {
          mimeType: 'application/vnd.google-apps.script+json',
          body: JSON.stringify(projectData)
        },
        uploadType: 'multipart',
        convert: true
      });
      
      const projectId = response.data.id;
      const projectUrl = `https://script.google.com/d/${projectId}/edit`;
      
      console.log('✅ Apps Script project created successfully!');
      console.log(`📋 Project ID: ${projectId}`);
      console.log(`🌐 Project URL: ${projectUrl}`);
      
      return { projectId, projectUrl };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async updateExistingProject(projectId, files) {
    console.log(`🔄 Updating existing Apps Script project (${projectId})...`);
    
    const projectData = {
      files: files
    };
    
    try {
      await this.drive.files.update({
        fileId: projectId,
        media: {
          mimeType: 'application/vnd.google-apps.script+json',
          body: JSON.stringify(projectData)
        },
        uploadType: 'media'
      });
      
      const projectUrl = `https://script.google.com/d/${projectId}/edit`;
      
      console.log('✅ Apps Script project updated successfully!');
      console.log(`🌐 Project URL: ${projectUrl}`);
      
      return { projectId, projectUrl };
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async deployProject() {
    try {
      console.log('🎯 Starting Apps Script project deployment...');
      console.log('');
      
      // Authenticate
      await this.authenticate();
      
      // Load project files
      const files = await this.loadProjectFiles();
      
      if (files.length === 0) {
        throw new Error('No .gs files found to deploy');
      }
      
      // Check for existing project
      const existingProjectId = await this.findExistingProject();
      
      let result;
      if (existingProjectId) {
        // Update existing project
        result = await this.updateExistingProject(existingProjectId, files);
      } else {
        // Create new project
        result = await this.createNewProject(files);
      }
      
      console.log('');
      console.log('🎉 Deployment completed successfully!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Open the project URL above');
      console.log('2. Run the testFontSwap() function to verify installation');
      console.log('3. Open any Google Sheets to see the "Slide Formatter" menu');
      console.log('4. Test with target presentation: 1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA');
      console.log('');
      
      return result;
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('- Ensure credentials.json is in the project directory');
      console.log('- Check that required APIs are enabled in Google Cloud Console');
      console.log('- Verify OAuth scopes match the required permissions');
      throw error;
    }
  }

  async enableRequiredApis() {
    console.log('🔧 Note: Please ensure these APIs are enabled in Google Cloud Console:');
    console.log('  • Google Drive API');
    console.log('  • Google Slides API');
    console.log('  • Google Sheets API');
    console.log('  • Apps Script API');
    console.log('');
    console.log('🌐 Enable at: https://console.cloud.google.com/apis/dashboard');
  }
}

// Main execution
async function main() {
  const deployer = new AppsScriptDeployer();
  
  try {
    await deployer.enableRequiredApis();
    await deployer.deployProject();
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  main();
}

module.exports = AppsScriptDeployer;