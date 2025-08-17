#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CredentialsSetup {
  constructor() {
    this.credentialsPath = path.join(__dirname, 'credentials.json');
  }

  async setupCredentials() {
    console.log('🔑 Google Cloud Credentials Setup');
    console.log('=================================');
    console.log('');

    if (fs.existsSync(this.credentialsPath)) {
      console.log('✅ credentials.json already exists');
      this.validateCredentials();
      return;
    }

    console.log('📋 To set up automated deployment, you need OAuth 2.0 credentials:');
    console.log('');
    console.log('1️⃣  Go to Google Cloud Console:');
    console.log('   https://console.cloud.google.com/apis/credentials');
    console.log('');
    console.log('2️⃣  Create OAuth 2.0 Client ID:');
    console.log('   • Click "Create Credentials" → "OAuth 2.0 Client ID"');
    console.log('   • Application type: "Desktop application"');
    console.log('   • Name: "Slide Formatter Deployer"');
    console.log('');
    console.log('3️⃣  Download the JSON file:');
    console.log('   • Click the download button next to your client ID');
    console.log('   • Save as "credentials.json" in this directory');
    console.log('');
    console.log('4️⃣  Enable required APIs:');
    console.log('   https://console.cloud.google.com/apis/dashboard');
    console.log('   • Google Drive API');
    console.log('   • Google Slides API');
    console.log('   • Google Sheets API');
    console.log('   • Apps Script API');
    console.log('');

    // Create a template credentials file
    const template = {
      "installed": {
        "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
        "project_id": "your-project-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "YOUR_CLIENT_SECRET",
        "redirect_uris": ["http://localhost"]
      }
    };

    const templatePath = path.join(__dirname, 'credentials.template.json');
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    
    console.log('📝 Template created: credentials.template.json');
    console.log('   Replace with your actual credentials.json file');
    console.log('');
    console.log('🎯 After setup, run: npm run deploy');
  }

  validateCredentials() {
    try {
      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
      
      const config = credentials.installed || credentials.web;
      if (!config) {
        throw new Error('Invalid credentials format');
      }

      const required = ['client_id', 'client_secret', 'redirect_uris'];
      const missing = required.filter(field => !config[field]);
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      if (config.client_id.includes('YOUR_CLIENT_ID')) {
        throw new Error('Credentials file contains template values - please replace with actual values');
      }

      console.log('✅ Credentials file is valid');
      console.log(`   Project ID: ${config.project_id || 'Not specified'}`);
      console.log(`   Client ID: ${config.client_id.substring(0, 20)}...`);
      
    } catch (error) {
      console.error('❌ Credentials validation failed:', error.message);
      console.log('');
      console.log('🔧 Please check your credentials.json file format');
      process.exit(1);
    }
  }

  async createQuickSetupScript() {
    const quickSetupScript = `#!/bin/bash

echo "🚀 Quick Setup for Slide Formatter Deployment"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for credentials
if [ ! -f "credentials.json" ]; then
    echo ""
    echo "⚠️  credentials.json not found!"
    echo ""
    echo "📋 Please follow these steps:"
    echo "1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "2. Create OAuth 2.0 Client ID (Desktop application)"
    echo "3. Download and save as 'credentials.json'"
    echo "4. Enable APIs: Drive, Slides, Sheets, Apps Script"
    echo ""
    echo "Then run: npm run deploy"
else
    echo "✅ credentials.json found"
    echo ""
    echo "🎯 Setup complete! Run deployment:"
    echo "   npm run deploy"
fi
`;

    const setupPath = path.join(__dirname, 'setup.sh');
    fs.writeFileSync(setupPath, quickSetupScript);
    
    // Make it executable on Unix systems
    try {
      fs.chmodSync(setupPath, '755');
    } catch (error) {
      // Ignore chmod errors on Windows
    }
    
    console.log('📝 Created setup.sh for quick setup');
  }
}

// Main execution
async function main() {
  const setup = new CredentialsSetup();
  
  try {
    await setup.setupCredentials();
    await setup.createQuickSetupScript();
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CredentialsSetup;