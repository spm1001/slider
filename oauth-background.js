#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const { URL } = require('url');
const { google } = require('googleapis');
require('dotenv').config();

/**
 * Background OAuth flow with progress monitoring
 * Runs server in background and provides status updates
 */
class BackgroundOAuthFlow {
  constructor() {
    this.server = null;
    this.auth = null;
    this.port = 32790;
    this.authCode = null;
    this.status = 'initializing';
    this.startTime = Date.now();
  }

  async initialize() {
    console.log('🚀 Background OAuth Flow with Progress Monitoring');
    console.log('================================================');
    
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
    const { client_id, client_secret } = credentials.web;

    // OAuth server will run on pre-configured port

    this.auth = new google.auth.OAuth2(
      client_id,
      client_secret,
      `http://localhost:${this.port}/oauth/callback`
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/script.projects',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/logging.read'
    ];

    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    console.log('\n🎯 BACKGROUND PROCESS FLOW:');
    console.log('1. ✅ Server starts in background');
    console.log('2. 📊 Progress updates every 10 seconds');
    console.log('3. 🌐 URL saved to oauth-url.txt for easy access');
    console.log('4. 👤 You authorize when ready (no time pressure)');
    console.log('5. ✅ Automatic completion with status updates');
    
    // Save URL to project file for easy access
    fs.writeFileSync('/home/modha/slider/oauth-url.txt', authUrl);
    console.log('\n📁 OAuth URL saved to: /home/modha/slider/oauth-url.txt');
    console.log('💡 Copy the URL from that file when you\'re ready to authorize');
    
    return authUrl;
  }

  async startBackgroundServer() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://localhost:${this.port}`);
        
        if (parsedUrl.pathname === '/oauth/callback') {
          const code = parsedUrl.searchParams.get('code');
          const error = parsedUrl.searchParams.get('error');
          
          if (error) {
            this.status = 'error';
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #d32f2f;">❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window and check your terminal.</p>
              </body></html>
            `);
            reject(new Error(`OAuth error: ${error}`));
            return;
          }
          
          if (code) {
            this.status = 'received_code';
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #2e7d32;">✅ Authorization Received!</h1>
                <p>Processing your authorization...</p>
                <p>Check your terminal for completion status.</p>
                <script>
                  setTimeout(() => {
                    try { window.close(); } catch(e) {}
                  }, 3000);
                </script>
              </body></html>
            `);
            
            this.authCode = code;
            resolve(code);
            return;
          }
          
          this.status = 'no_code';
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #d32f2f;">❌ No Authorization Code</h1>
              <p>The callback did not contain an authorization code.</p>
            </body></html>
          `);
          reject(new Error('No authorization code received'));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      this.server.listen(this.port, 'localhost', () => {
        this.status = 'waiting_for_auth';
        console.log('🚀 Background OAuth server started');
        console.log('⏳ Server running in background - waiting for authorization...');
      });

      this.server.on('error', (err) => {
        this.status = 'server_error';
        reject(err);
      });
    });
  }

  getStatus() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}m ${seconds}s`;

    switch (this.status) {
      case 'initializing':
        return `🔄 Initializing... (${timeStr})`;
      case 'waiting_for_auth':
        return `⏳ Waiting for authorization... (${timeStr})`;
      case 'received_code':
        return `✅ Authorization received! Processing... (${timeStr})`;
      case 'exchanging_token':
        return `🔄 Exchanging code for tokens... (${timeStr})`;
      case 'completed':
        return `🎊 OAuth flow completed! (${timeStr})`;
      case 'error':
        return `❌ Error occurred (${timeStr})`;
      default:
        return `❓ Unknown status: ${this.status} (${timeStr})`;
    }
  }

  async monitorProgress() {
    const interval = setInterval(() => {
      // Status monitoring active
      
      // Check if token.json was created (success indicator)
      if (fs.existsSync('token.json') && this.status !== 'completed') {
        this.status = 'completed';
        console.log('🎊 Token file detected - OAuth completed successfully!');
        clearInterval(interval);
      }
      
      // Stop monitoring after 10 minutes
      if (Date.now() - this.startTime > 10 * 60 * 1000) {
        console.log('⏰ Monitoring stopped after 10 minutes - check manually');
        clearInterval(interval);
      }
    }, 10000); // Update every 10 seconds

    return interval;
  }

  async exchangeCodeForTokens() {
    this.status = 'exchanging_token';
    console.log('\n🔄 Exchanging authorization code for tokens...');
    
    try {
      const { tokens } = await this.auth.getToken(this.authCode);
      
      fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
      this.status = 'completed';
      console.log('✅ Tokens saved to token.json');
      
      return tokens;
    } catch (error) {
      this.status = 'error';
      console.error('❌ Token exchange failed:', error.message);
      throw error;
    }
  }

  cleanup() {
    if (this.server) {
      this.server.close();
      console.log('🧹 Background server stopped');
    }
  }
}

async function main() {
  const oauth = new BackgroundOAuthFlow();
  
  try {
    // Initialize and get auth URL
    const authUrl = await oauth.initialize();
    
    // Start monitoring progress
    const progressInterval = await oauth.monitorProgress();
    
    // Start server and wait for callback
    await oauth.startBackgroundServer();
    
    // Stop progress monitoring
    clearInterval(progressInterval);
    
    // Exchange code for tokens
    await oauth.exchangeCodeForTokens();
    
    console.log('\n🎊 Background OAuth flow completed successfully!');
    console.log('🎯 You can now run: npm test');
    
  } catch (error) {
    console.error('\n💥 OAuth flow failed:', error.message);
    console.log('🔍 Check the URL in oauth-url.txt and try again');
    process.exit(1);
  } finally {
    oauth.cleanup();
  }
}

if (require.main === module) {
  main();
}