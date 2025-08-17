# Detailed Secrets Setup Guide

Complete step-by-step guide for setting up all required credentials and API keys for the Google Slides Formatter project.

## Prerequisites

- Google Cloud Project with billing enabled
- Access to Google Cloud Console  
- Node.js 14+ installed locally
- Git repository cloned locally

## Step 1: Google Cloud Project Setup

### 1.1 Verify Project Access
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `mit-dev-362409` (or your project)
3. Verify you have Editor/Owner permissions

### 1.2 Enable Required APIs
```bash
# Navigate to APIs & Services → Library
# Enable these APIs:
- Google Drive API
- Google Slides API
- Google Sheets API  
- Apps Script API
- Custom Search API
```

## Step 2: Generate New API Key

### 2.1 Create API Key
1. Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. **Important**: Restrict the key immediately

### 2.2 Restrict API Key
1. Click on the newly created key
2. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Custom Search API"
3. Under "Application restrictions" (optional):
   - Add your domain if deploying to production
4. Click "Save"

### 2.3 Copy API Key
```bash
# Copy the key - it looks like:
AIzaSy...abc123 (39 characters)

# Keep this secure - you'll add it to .env shortly
```

## Step 3: OAuth 2.0 Client Setup

### 3.1 Create OAuth Client
1. In [API Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. **Application type**: Web application (NOT Desktop)
4. **Name**: "Slide Formatter Deployer"

### 3.2 Configure OAuth Client
1. **Authorized JavaScript origins**: Leave empty for now
2. **Authorized redirect URIs**: Add:
   - `http://localhost:3000/oauth/callback`
3. Click "Create"

### 3.3 Download OAuth Credentials
1. Click the download button (⬇️) next to your OAuth client
2. Save the file as `credentials.json` in your project root
3. **Verify the file structure**:
```json
{
  "web": {
    "client_id": "...",
    "project_id": "mit-dev-362409",
    "client_secret": "...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "redirect_uris": ["http://localhost:3000/oauth/callback"]
  }
}
```

## Step 4: Environment Variables Setup

### 4.1 Create .env File
```bash
# In your project directory
cp .env.template .env
```

### 4.2 Fill in Environment Variables
Edit `.env` with your actual values:

```bash
# Google API Configuration
GOOGLE_API_KEY=AIzaSy_your_new_api_key_here
GOOGLE_SEARCH_ENGINE_ID=701ecba480bf443fa

# Project Information  
GOOGLE_CLOUD_PROJECT_ID=mit-dev-362409
GOOGLE_CLOUD_PROJECT_NUMBER=1018230309720

# OAuth Configuration
OAUTH_CLIENT_TYPE=web

# Development Settings
NODE_ENV=development
DEBUG_MODE=false

# Test Configuration
TEST_PRESENTATION_ID=1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA
```

### 4.3 Verify File Permissions
```bash
# Ensure .env is not world-readable
chmod 600 .env

# Verify .env is in .gitignore (should show nothing)
git check-ignore .env
```

## Step 5: Test Configuration

### 5.1 Verify Environment Loading
```bash
# Test that variables are loaded
source .env && echo "API Key: ${GOOGLE_API_KEY:0:20}..."
```

### 5.2 Test Deployment
```bash
# Install dependencies
npm install

# Run deployment (will trigger OAuth flow)
npm run deploy
```

### 5.3 Expected OAuth Flow
1. Script opens browser with authorization URL
2. Sign in to Google account
3. Grant permissions to the application
4. Browser redirects to localhost:3000 (will show error - that's OK!)
5. Copy authorization code from URL
6. Paste code into terminal
7. Script exchanges code for tokens and creates Apps Script project

## Step 6: Verify MCP Server Configuration

### 6.1 Test MCP Server
The MCP server should automatically read from environment variables. Test by:

```bash
# Check if MCP server starts properly
cd mcp-dev-assist-local
npm run build
node dist/index.js --stdio
```

### 6.2 Update Claude Code Settings
Your `.claude/settings.local.json` should reference environment variables, not hardcoded keys.

## Step 7: Security Verification

### 7.1 Check Git Status
```bash
# Verify no secrets are staged for commit
git status

# Should show:
# - .env (untracked) ✅
# - credentials.json (untracked) ✅ 
# - token.json (untracked) ✅
```

### 7.2 Test .gitignore
```bash
# These should all return the filename (meaning ignored):
git check-ignore .env
git check-ignore credentials.json
git check-ignore token.json
git check-ignore .claude/
```

### 7.3 Scan for Accidental Secrets
```bash
# Check working directory for any API keys
grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git || echo "No API keys found in working directory ✅"
```

## Troubleshooting

### Issue: OAuth Flow Fails
**Solution**: 
- Verify OAuth client is "Web application" type
- Check redirect URI: `http://localhost:3000/oauth/callback`
- Ensure APIs are enabled in Google Cloud Console

### Issue: MCP Server Can't Find API Key  
**Solution**:
- Verify `.env` file exists and has `GOOGLE_API_KEY`
- Check MCP server configuration references environment variables
- Restart Claude Code to reload environment

### Issue: Deployment Permissions Error
**Solution**:
- Verify Google Cloud project permissions
- Check Apps Script API is enabled
- Ensure OAuth scopes include Drive and Scripts APIs

### Issue: API Key Doesn't Work
**Solution**:
- Verify Custom Search API is enabled
- Check API key restrictions allow Custom Search API
- Test API key with direct Custom Search query

## Success Criteria

✅ **Environment Variables**: `.env` file with all required variables  
✅ **OAuth Credentials**: `credentials.json` with web application config  
✅ **API Access**: New API key works with Custom Search  
✅ **Deployment**: `npm run deploy` successfully creates Apps Script project  
✅ **MCP Server**: Reads environment variables correctly  
✅ **Security**: No secrets in git history or working directory  

---

**Next Steps**: After successful setup, test the complete workflow with the target presentation to verify font swapping functionality.