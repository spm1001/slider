#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

class AppsScriptManualCodeDeployer {
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
    console.log('🔐 Authenticating with Google APIs (Manual Code Input)...');
    
    // Load credentials
    const credentials = await this.loadCredentials();
    const { client_id, client_secret } = credentials.installed || credentials.web;
    
    // Use postmessage redirect URI for manual code flow
    this.auth = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      'postmessage'
    );
    
    // Check for existing token
    try {
      const token = await this.loadToken();
      this.auth.setCredentials(token);
      console.log('✅ Using existing authentication token');
      
      // Test if token is still valid
      this.drive = google.drive({ version: 'v2', auth: this.auth });
      await this.drive.about.get();
      console.log('✅ Token is valid');
      
    } catch (error) {
      console.log('🔄 No valid token found or token expired, getting new authorization...');
      await this.getManualAuthCode();
    }
  }

  async loadCredentials() {
    const credentialsPath = path.join(this.scriptsFolder, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`
❌ Credentials file not found: ${credentialsPath}
Please ensure your credentials.json file is in the project directory.
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

  async getManualAuthCode() {
    // Generate auth URL for manual authorization
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.requiredScopes,
      prompt: 'consent',  // Force consent screen to ensure we get refresh token
      origin: 'https://script.google.com'  // Required for postmessage redirect
    });

    console.log('');
    console.log('🌐 AUTHORIZATION REQUIRED');
    console.log('========================');
    console.log('');
    console.log('1. Copy this URL and open it in your browser:');
    console.log('');
    console.log(authUrl);
    console.log('');
    console.log('2. Sign in with your Google account');
    console.log('3. Grant the requested permissions');
    console.log('4. You will see a message: "Please copy this code, switch to your application and paste it there:"');
    console.log('5. Copy the authorization code from that page');
    console.log('6. Paste it below when prompted');
    console.log('');

    // Save URL to file for easy access
    const urlContent = `OAuth Authorization URL:

Copy this entire URL and open in your browser:
──────────────────────────────────────────────────
${authUrl}
──────────────────────────────────────────────────

Instructions:
1. Open the URL above in your browser
2. Sign in and grant permissions  
3. Copy the authorization code shown
4. Return to the terminal and paste it when prompted

Note: You may see "This app isn't verified" - click "Advanced" then "Go to MIT-Dev (unsafe)" to continue.
This is normal for development OAuth applications.`;

    fs.writeFileSync(path.join(this.scriptsFolder, 'auth-manual-url.txt'), urlContent);
    console.log('💾 URL saved to: auth-manual-url.txt');
    console.log('');

    // Prompt for authorization code
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('📋 Paste the authorization code here: ', async (code) => {
        rl.close();
        
        try {
          console.log('🔄 Exchanging authorization code for access token...');
          const { tokens } = await this.auth.getToken(code.trim());
          this.auth.setCredentials(tokens);
          
          // Save token for future use
          const tokenPath = path.join(this.scriptsFolder, 'token.json');
          fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
          console.log('💾 Token saved for future use');
          
          // Initialize Drive API
          this.drive = google.drive({ version: 'v2', auth: this.auth });
          console.log('✅ Authentication successful');
          
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
      console.log('   This method works perfectly for enterprise CI/CD!');
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
      console.log('💡 For enterprise deployment:');
      console.log('   - The token.json can be reused for automated deployments');
      console.log('   - This same process can be scripted for CI/CD pipelines');
      console.log('   - Multiple projects can be deployed with the same token');
      console.log('');
      
      return result;
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('- Ensure credentials.json is in the project directory');
      console.log('- Check that required APIs are enabled in Google Cloud Console');
      console.log('- Verify OAuth scopes match the required permissions');
      console.log('- Try refreshing the authorization if token expired');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const deployer = new AppsScriptManualCodeDeployer();
  
  try {
    console.log('🔧 Required APIs (ensure these are enabled):');
    console.log('  • Google Drive API');
    console.log('  • Google Slides API');
    console.log('  • Google Sheets API');
    console.log('  • Apps Script API');
    console.log('🌐 Enable at: https://console.cloud.google.com/apis/dashboard');
    console.log('');
    
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

module.exports = AppsScriptManualCodeDeployer;