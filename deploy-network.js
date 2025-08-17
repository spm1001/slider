#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const { execSync } = require('child_process');

class AppsScriptNetworkDeployer {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.scriptsFolder = __dirname;
    this.projectName = 'Slide Formatter';
    this.serverIP = this.getServerIP();
    this.redirectUri = `http://${this.serverIP}:3000/oauth/callback`;
    this.requiredScopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.scripts',
      'https://www.googleapis.com/auth/script.projects'
    ];
  }

  getServerIP() {
    try {
      // Get the first IP address
      const ip = execSync("hostname -I | awk '{print $1}'", { encoding: 'utf8' }).trim();
      return ip;
    } catch (error) {
      console.warn('Could not determine server IP, falling back to localhost');
      return 'localhost';
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating with Google APIs (Network Server)...');
    console.log(`🌐 Server IP: ${this.serverIP}`);
    
    // Load credentials
    const credentials = await this.loadCredentials();
    const { client_id, client_secret } = credentials.installed || credentials.web;
    
    this.auth = new google.auth.OAuth2(client_id, client_secret, this.redirectUri);
    
    // Check for existing token
    try {
      const token = await this.loadToken();
      this.auth.setCredentials(token);
      console.log('✅ Using existing authentication token');
    } catch (error) {
      console.log('🔄 No valid token found, starting network authentication flow...');
      await this.getNetworkToken();
    }
    
    this.drive = google.drive({ version: 'v2', auth: this.auth });
    console.log('✅ Authentication successful');
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

  async getNetworkToken() {
    return new Promise((resolve, reject) => {
      // Create local HTTP server
      const server = http.createServer((req, res) => {
        const reqUrl = url.parse(req.url, true);
        
        if (reqUrl.pathname === '/oauth/callback') {
          const code = reqUrl.query.code;
          const error = reqUrl.query.error;
          
          if (error) {
            res.writeHead(400, {'Content-Type': 'text/html'});
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1 style="color: #d32f2f;">❌ Authorization Failed</h1>
                  <p>Error: ${error}</p>
                  <p>You can close this window and try again.</p>
                </body>
              </html>
            `);
            server.close();
            reject(new Error(`Authorization failed: ${error}`));
            return;
          }
          
          if (code) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1 style="color: #4caf50;">✅ Authorization Successful!</h1>
                  <p>Google Apps Script deployment will continue automatically.</p>
                  <p>You can close this window.</p>
                  <script>setTimeout(() => window.close(), 3000);</script>
                </body>
              </html>
            `);
            
            // Exchange code for tokens
            this.auth.getToken(code)
              .then(({ tokens }) => {
                this.auth.setCredentials(tokens);
                
                // Save token for future use
                const tokenPath = path.join(this.scriptsFolder, 'token.json');
                fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
                console.log('💾 Token saved for future use');
                
                server.close();
                resolve(tokens);
              })
              .catch(err => {
                server.close();
                reject(new Error(`Token exchange failed: ${err.message}`));
              });
          } else {
            res.writeHead(400, {'Content-Type': 'text/html'});
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1 style="color: #d32f2f;">❌ No Authorization Code</h1>
                  <p>No authorization code received. Please try again.</p>
                </body>
              </html>
            `);
            server.close();
            reject(new Error('No authorization code received'));
          }
        } else {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end('Not Found');
        }
      });
      
      // Start server on all interfaces (0.0.0.0) so it's accessible from other machines
      server.listen(3000, '0.0.0.0', () => {
        console.log(`🌐 Started server on http://${this.serverIP}:3000`);
        console.log('📡 Server is accessible from your local machine via the network');
        
        // Generate auth URL
        const authUrl = this.auth.generateAuthUrl({
          access_type: 'offline',
          scope: this.requiredScopes,
        });
        
        console.log('');
        console.log('🌐 Please open this URL in your browser:');
        console.log('');
        console.log(authUrl);
        console.log('');
        console.log('📋 After authorizing, you will be redirected back automatically');
        console.log(`   The redirect will go to: http://${this.serverIP}:3000/oauth/callback`);
        console.log('   The browser window will show "Authorization Successful" when done');
        console.log('');
        
        // Save URL to file as well
        const urlInfo = `Network OAuth URL (for SSH users):

COPY THIS ENTIRE URL:
──────────────────────────────────────────────────
${authUrl}
──────────────────────────────────────────────────

📋 Instructions:
1. Copy the URL above  
2. Paste it into your browser (on your local machine)
3. Sign in and grant permissions
4. You will be redirected to: http://${this.serverIP}:3000/oauth/callback
5. The browser will show "Authorization Successful!" when done
6. The deployment will continue automatically

🌐 Server IP: ${this.serverIP}
📡 Make sure port 3000 is accessible from your machine to the dev server`;

        fs.writeFileSync(path.join(this.scriptsFolder, 'network-auth-url.txt'), urlInfo);
        console.log('💾 URL and instructions saved to: network-auth-url.txt');
      });
      
      // Handle server errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error('Port 3000 is already in use. Please close other applications using this port and try again.'));
        } else {
          reject(new Error(`Server error: ${err.message}`));
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
      console.log('- Make sure port 3000 is accessible from your machine to the dev server');
      console.log('- Check firewall settings if connection fails');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const deployer = new AppsScriptNetworkDeployer();
  
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

module.exports = AppsScriptNetworkDeployer;