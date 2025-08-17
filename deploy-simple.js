#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

class AppsScriptSimpleDeployer {
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
    console.log('🔐 Authenticating with Google APIs (Simple Flow)...');
    
    // Load credentials
    const credentials = await this.loadCredentials();
    const { client_id, client_secret } = credentials.web || credentials.installed;
    
    // Use a redirect that will actually show the code on screen
    this.auth = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      'http://localhost'
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
      await this.getSimpleAuthCode();
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

  async getSimpleAuthCode() {
    // Generate auth URL for simple authorization
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.requiredScopes,
      prompt: 'consent'
    });

    console.log('');
    console.log('🌐 SIMPLE AUTHORIZATION');
    console.log('======================');
    console.log('');
    console.log('1. Copy this URL and open it in your browser:');
    console.log('');
    console.log(authUrl);
    console.log('');
    console.log('2. Sign in with your Google account');
    console.log('3. Grant the requested permissions');
    console.log('4. When redirected to localhost (which will show an error), look at the URL');
    console.log('5. Copy the code from the URL (after "code=" parameter)');
    console.log('   Example: http://localhost/?code=4/XXXXX&scope=...');
    console.log('   Copy just the 4/XXXXX part');
    console.log('6. Paste the code below');
    console.log('');

    // Save URL to file 
    const urlContent = `🔗 Simple OAuth Authorization URL

COPY THIS ENTIRE URL:
──────────────────────────────────────────────────
${authUrl}
──────────────────────────────────────────────────

📋 Instructions:
1. Copy URL above → paste in browser
2. Sign in + grant permissions
3. When redirected to localhost (error page), look at URL bar
4. Copy the code parameter from URL
   Example: http://localhost/?code=4/XXXXX&scope=...
   Copy just the 4/XXXXX part
5. Paste code in terminal

✅ Simple flow - works every time!
💡 Perfect for SSH and enterprise deployment`;

    fs.writeFileSync(path.join(this.scriptsFolder, 'oauth-url.txt'), urlContent);
    console.log('💾 URL saved to: oauth-url.txt');
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
    
    const projectData = { files: files };
    
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
    
    const projectData = { files: files };
    
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
      console.log('   Simple and reliable method for all environments!');
      console.log('');
      
      await this.authenticate();
      
      const files = await this.loadProjectFiles();
      
      if (files.length === 0) {
        throw new Error('No .gs files found to deploy');
      }
      
      const existingProjectId = await this.findExistingProject();
      
      let result;
      if (existingProjectId) {
        result = await this.updateExistingProject(existingProjectId, files);
      } else {
        result = await this.createNewProject(files);
      }
      
      console.log('');
      console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Open the project URL above');
      console.log('2. Run testFontSwap() function to verify');
      console.log('3. Open Google Sheets to see "Slide Formatter" menu');
      console.log('4. Test with: 1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA');
      console.log('');
      
      return result;
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }
}

async function main() {
  const deployer = new AppsScriptSimpleDeployer();
  
  try {
    await deployer.deployProject();
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AppsScriptSimpleDeployer;