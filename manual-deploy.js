#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Manual Apps Script Project Setup');
console.log('===================================');
console.log('');
console.log('Due to Google\'s recent OAuth security restrictions, automated deployment');
console.log('requires complex workarounds. Here\'s the simple manual approach:');
console.log('');

// Read all .gs files and generate the manual instructions
const scriptsFolder = __dirname;
const files = [];
const fileExtensions = ['.gs'];

console.log('📁 Project files to copy:');
console.log('');

// Read all .gs files
const dirFiles = fs.readdirSync(scriptsFolder);

for (const fileName of dirFiles) {
  const filePath = path.join(scriptsFolder, fileName);
  const ext = path.extname(fileName);
  
  if (fileExtensions.includes(ext)) {
    const baseName = path.basename(fileName, ext);
    const source = fs.readFileSync(filePath, 'utf8');
    
    files.push({
      name: baseName,
      type: 'server_js',
      source: source
    });
    
    console.log(`✓ ${fileName} (${source.length} characters)`);
  }
}

console.log('');
console.log('📋 Manual Setup Instructions:');
console.log('');
console.log('1. Go to https://script.google.com');
console.log('2. Click "New Project"');
console.log('3. Name it "Slide Formatter"');
console.log('4. Replace Code.gs content with main.gs content (see below)');
console.log('5. Add new files for each .gs file (File → New → Script file)');
console.log('6. Enable advanced services (see instructions below)');
console.log('7. Update manifest (see instructions below)');
console.log('');

// Generate the manifest
const manifest = {
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

// Create comprehensive setup file
const setupContent = `# Google Apps Script Manual Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Project
1. Go to https://script.google.com
2. Click "New Project"
3. Name it "Slide Formatter"

### Step 2: Add Files
Replace the default Code.gs and add new files:

${files.map(file => `
#### ${file.name}.gs
\`\`\`javascript
${file.source}
\`\`\`
`).join('\n')}

### Step 3: Enable Advanced Services
1. Click Services (+) in left sidebar
2. Add these services:
   - Google Slides API (v1) → Variable name: Slides
   - Google Drive API (v2) → Variable name: Drive  
   - Google Sheets API (v4) → Variable name: Sheets

### Step 4: Update Manifest
1. Go to Project Settings (gear icon)
2. Check "Show 'appsscript.json' manifest file in editor"
3. Click Editor, then click appsscript.json
4. Replace content with:

\`\`\`json
${JSON.stringify(manifest, null, 2)}
\`\`\`

### Step 5: Test Installation
1. Save all files (Ctrl+S)
2. Run testFontSwap() function
3. Authorize when prompted
4. Check execution logs for success

### Step 6: Use the Tool
1. Open any Google Sheets
2. Look for "Slide Formatter" menu
3. Click "Format Presentation"
4. Enter presentation URL
5. Watch it work!

## Test Presentation
Use this for testing: https://docs.google.com/presentation/d/1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA/edit

Expected result: Comic Sans MS ↔ Arial font swap on all slides + notes.

## Troubleshooting
- If menu doesn't appear: Refresh the Google Sheets page
- If errors occur: Check execution transcript for details
- If permissions fail: Re-run testFontSwap() to re-authorize
`;

// Save the complete setup guide
fs.writeFileSync(path.join(scriptsFolder, 'MANUAL_SETUP.md'), setupContent);

console.log('📄 Complete setup guide saved to: MANUAL_SETUP.md');
console.log('');
console.log('🎯 Estimated setup time: 5 minutes');
console.log('');
console.log('Next: Open MANUAL_SETUP.md and follow the step-by-step instructions');
console.log('');
console.log('This approach bypasses all OAuth complexity and works reliably!');