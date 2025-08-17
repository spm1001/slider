#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function generateAuthUrl() {
  try {
    // Load credentials
    const credentialsPath = path.join(__dirname, 'credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const { client_id, client_secret } = credentials.installed || credentials.web;
    
    // Create OAuth2 client
    const auth = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    // Required scopes
    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.scripts',
      'https://www.googleapis.com/auth/script.projects'
    ];
    
    // Generate auth URL
    const authUrl = auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    
    console.log('🔗 OAuth Authorization URL:');
    console.log('');
    console.log('COPY THIS ENTIRE URL:');
    console.log('─'.repeat(50));
    console.log(authUrl);
    console.log('─'.repeat(50));
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Copy the URL above');
    console.log('2. Paste it into your browser');
    console.log('3. Sign in and grant permissions');
    console.log('4. Copy the authorization code from the final page');
    console.log('5. Run: node deploy-with-device-flow.js');
    console.log('6. Paste the authorization code when prompted');
    
  } catch (error) {
    console.error('❌ Error generating auth URL:', error.message);
  }
}

generateAuthUrl();