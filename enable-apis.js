#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleApiEnabler {
  constructor() {
    this.auth = null;
    this.serviceUsage = null;
    this.scriptsFolder = __dirname;
    this.requiredApis = [
      'drive.googleapis.com',
      'slides.googleapis.com',
      'sheets.googleapis.com',
      'script.googleapis.com'
    ];
    this.requiredScopes = [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/service.management'
    ];
  }

  async authenticate() {
    console.log('🔐 Authenticating with Google Cloud APIs...');
    
    // Load credentials
    const credentials = await this.loadCredentials();
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
    
    this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    // Try to load existing token
    try {
      const token = await this.loadToken();
      this.auth.setCredentials(token);
      console.log('✅ Using existing authentication token');
    } catch (error) {
      console.log('🔄 Getting new authentication token...');
      await this.getNewToken();
    }
    
    this.serviceUsage = google.serviceusage({ version: 'v1', auth: this.auth });
    console.log('✅ Authentication successful');
  }

  async loadCredentials() {
    const credentialsPath = path.join(this.scriptsFolder, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error('credentials.json not found. Run setup-credentials.js first.');
    }
    
    return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }

  async loadToken() {
    const tokenPath = path.join(this.scriptsFolder, 'cloud-token.json');
    if (!fs.existsSync(tokenPath)) {
      throw new Error('Cloud token file not found');
    }
    
    return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  }

  async getNewToken() {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.requiredScopes,
    });

    console.log('🌐 Please visit this URL to authorize API management:');
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
          const tokenPath = path.join(this.scriptsFolder, 'cloud-token.json');
          fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
          console.log('💾 Cloud token saved for future use');
          
          resolve(tokens);
        } catch (error) {
          reject(new Error(`Authentication failed: ${error.message}`));
        }
      });
    });
  }

  async getProjectId() {
    // Try to get project ID from credentials
    const credentials = await this.loadCredentials();
    const config = credentials.installed || credentials.web;
    
    if (config.project_id) {
      return config.project_id;
    }
    
    // If not in credentials, prompt user
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('📋 Enter your Google Cloud Project ID: ', (projectId) => {
        rl.close();
        resolve(projectId.trim());
      });
    });
  }

  async checkApiStatus(projectId, apiName) {
    try {
      const serviceName = `projects/${projectId}/services/${apiName}`;
      const response = await this.serviceUsage.services.get({
        name: serviceName
      });
      
      return response.data.state === 'ENABLED';
    } catch (error) {
      if (error.code === 403) {
        console.log(`⚠️  Insufficient permissions to check ${apiName} status`);
        return null; // Unknown status
      }
      return false;
    }
  }

  async enableApi(projectId, apiName) {
    try {
      console.log(`🔧 Enabling ${apiName}...`);
      
      const serviceName = `projects/${projectId}/services/${apiName}`;
      
      const response = await this.serviceUsage.services.enable({
        name: serviceName
      });
      
      console.log(`✅ ${apiName} enabled successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to enable ${apiName}: ${error.message}`);
      
      if (error.code === 403) {
        console.log('   This might require Project Editor or Service Usage Admin role');
      }
      
      return false;
    }
  }

  async enableAllApis() {
    try {
      console.log('🚀 Starting Google API enablement process...');
      console.log('');
      
      // Authenticate
      await this.authenticate();
      
      // Get project ID
      const projectId = await this.getProjectId();
      console.log(`📋 Using project: ${projectId}`);
      console.log('');
      
      let enabledCount = 0;
      let alreadyEnabledCount = 0;
      let failedCount = 0;
      
      console.log('📡 Checking and enabling required APIs...');
      
      for (const apiName of this.requiredApis) {
        console.log(`\n🔍 Checking ${apiName}...`);
        
        const isEnabled = await this.checkApiStatus(projectId, apiName);
        
        if (isEnabled === true) {
          console.log(`✅ ${apiName} is already enabled`);
          alreadyEnabledCount++;
        } else if (isEnabled === false) {
          const success = await this.enableApi(projectId, apiName);
          if (success) {
            enabledCount++;
          } else {
            failedCount++;
          }
        } else {
          console.log(`❓ ${apiName} status unknown (insufficient permissions)`);
          // Try to enable anyway
          const success = await this.enableApi(projectId, apiName);
          if (success) {
            enabledCount++;
          } else {
            failedCount++;
          }
        }
      }
      
      console.log('');
      console.log('📊 API Enablement Summary:');
      console.log(`   ✅ Already enabled: ${alreadyEnabledCount}`);
      console.log(`   🔧 Newly enabled: ${enabledCount}`);
      console.log(`   ❌ Failed: ${failedCount}`);
      
      if (failedCount > 0) {
        console.log('');
        console.log('⚠️  Some APIs could not be enabled automatically.');
        console.log('   Please enable them manually at:');
        console.log('   https://console.cloud.google.com/apis/dashboard');
        console.log('');
        console.log('   Required APIs:');
        this.requiredApis.forEach(api => {
          console.log(`   • ${api}`);
        });
      } else {
        console.log('');
        console.log('🎉 All required APIs are enabled!');
        console.log('   You can now run: npm run deploy');
      }
      
    } catch (error) {
      console.error('❌ API enablement failed:', error.message);
      console.log('');
      console.log('🔧 Manual setup required:');
      console.log('1. Go to: https://console.cloud.google.com/apis/dashboard');
      console.log('2. Enable these APIs:');
      this.requiredApis.forEach(api => {
        console.log(`   • ${api}`);
      });
      throw error;
    }
  }

  async showManualInstructions() {
    console.log('📋 Manual API Enablement Instructions');
    console.log('=====================================');
    console.log('');
    console.log('If automatic enablement fails, follow these steps:');
    console.log('');
    console.log('1️⃣  Go to Google Cloud Console:');
    console.log('   https://console.cloud.google.com/apis/dashboard');
    console.log('');
    console.log('2️⃣  Click "+ ENABLE APIS AND SERVICES"');
    console.log('');
    console.log('3️⃣  Search for and enable each API:');
    this.requiredApis.forEach((api, index) => {
      const displayName = api.replace('.googleapis.com', '').toUpperCase();
      console.log(`   ${index + 1}. ${displayName} API (${api})`);
    });
    console.log('');
    console.log('4️⃣  Wait a few minutes for activation');
    console.log('');
    console.log('5️⃣  Run: npm run deploy');
  }
}

// Main execution
async function main() {
  const enabler = new GoogleApiEnabler();
  
  try {
    await enabler.enableAllApis();
  } catch (error) {
    console.log('');
    await enabler.showManualInstructions();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GoogleApiEnabler;