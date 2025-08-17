#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');

/**
 * OAuth flow with proper background monitoring
 * Starts OAuth server in background and provides progress updates
 */
class MonitoredOAuthFlow {
  constructor() {
    this.oauthProcess = null;
    this.startTime = Date.now();
  }

  async startBackgroundAuth() {
    console.log('🚀 Starting OAuth Flow with Background Monitoring');
    console.log('=================================================');
    
    // Remove existing token to ensure fresh auth
    if (fs.existsSync('token.json')) {
      fs.unlinkSync('token.json');
      console.log('🗑️  Removed existing token for fresh authentication');
    }

    console.log('⏳ Starting OAuth server in background...');
    
    // Start OAuth process in background  
    this.oauthProcess = spawn('node', ['oauth-background.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });
    
    // Unref to allow parent to exit independently
    this.oauthProcess.unref();

    // Capture output for monitoring
    let output = '';
    this.oauthProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // Show real-time output
      process.stdout.write(text);
    });

    this.oauthProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      // Show real-time errors
      process.stderr.write(text);
    });

    // Monitoring will be called separately from main()
    
    return new Promise((resolve, reject) => {
      this.oauthProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ OAuth process completed successfully');
        } else {
          console.log(`\n❌ OAuth process failed with code ${code}`);
        }
        resolve(); // Always resolve - monitoring handles the real completion detection
      });

      this.oauthProcess.on('error', (error) => {
        console.error('❌ Failed to start OAuth process:', error);
        reject(error);
      });
    });
  }

  async monitorProgress() {
    console.log('\n📊 Starting progress monitoring (every 15 seconds)...');
    console.log('💡 You can authorize at any time - no rush!');
    
    return new Promise((resolve) => {
      const monitor = setInterval(async () => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${minutes}m ${seconds}s`;

        // Check if token was created (success)
        if (fs.existsSync('token.json')) {
          console.log(`🎊 SUCCESS: OAuth completed! (${timeStr})`);
          console.log('✅ Token file created - ready to test!');
          clearInterval(monitor);
          resolve();
          return;
        }

        // Check if process is still running
        if (this.oauthProcess && !this.oauthProcess.killed) {
          console.log(`⏳ Still waiting for authorization... (${timeStr})`);
          console.log('🔗 Remember: Copy URL from oauth-url.txt file');
        } else {
          console.log(`❌ OAuth process stopped unexpectedly (${timeStr})`);
          clearInterval(monitor);
          resolve();
          return;
        }

        // Stop monitoring after 15 minutes
        if (elapsed > 15 * 60) {
          console.log('⏰ Monitoring timeout after 15 minutes');
          console.log('🔍 Check oauth-url.txt and try authorization manually');
          clearInterval(monitor);
          resolve();
          return;
        }
      }, 15000); // Check every 15 seconds
    });
  }

  cleanup() {
    if (this.oauthProcess && !this.oauthProcess.killed) {
      console.log('🧹 Cleaning up OAuth process...');
      this.oauthProcess.kill('SIGTERM');
    }
  }
}

async function main() {
  const monitor = new MonitoredOAuthFlow();
  
  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Interrupted - cleaning up...');
    monitor.cleanup();
    process.exit(0);
  });

  try {
    // Start the OAuth process (non-blocking)
    const oauthPromise = monitor.startBackgroundAuth();
    
    // Start monitoring concurrently (this will resolve when token is created)
    const monitorPromise = monitor.monitorProgress();
    
    // Wait for either OAuth process or monitoring to complete
    await Promise.race([oauthPromise, monitorPromise]);
    
    // Final verification
    if (fs.existsSync('token.json')) {
      console.log('\n🎊 OAuth flow completed successfully!');
      console.log('🎯 Ready for testing: npm test');
    } else {
      console.log('\n⚠️  OAuth may not have completed properly');
      console.log('🔍 Check if token.json was created');
    }
    
  } catch (error) {
    console.error('\n💥 OAuth monitoring failed:', error.message);
    process.exit(1);
  } finally {
    monitor.cleanup();
  }
}

if (require.main === module) {
  main();
}