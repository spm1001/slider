# Machine Transfer Instructions

## OAuth Token Management Strategies

### 🔐 **Option 1: GitHub Secrets (RECOMMENDED)**
Store the OAuth refresh token in GitHub repository secrets for seamless machine portability:

1. **Extract refresh token**: From existing `token.json` file
2. **Add to GitHub Secrets**: Repository Settings → Secrets → Actions
   - Secret name: `OAUTH_REFRESH_TOKEN`
   - Value: `[YOUR_REFRESH_TOKEN_FROM_TOKEN_JSON]`
3. **Deploy on any machine**: `npm run deploy` works automatically

**Benefits**:
- ✅ **No manual file transfer** required
- ✅ **Team access** via repository permissions  
- ✅ **CI/CD ready** for automated deployments
- ✅ **Secure** encrypted storage

### 🔐 **Option 2: Manual File Transfer**
```bash
# File: token.json
# Contains: Long-lived refresh token (expires December 2025)
# Purpose: Enables deployment without re-authorization
# Action: COPY THIS FILE MANUALLY to new machine
```

**Token Details**:
- **Expires**: 2025-12-31 (check expiry_date field: 1755422833973)
- **Scopes**: drive, drive.scripts, script.projects
- **Current refresh token**: Available in local `token.json` file

## Critical Files for Machine Transfer

### 🔑 **Environment Variables**
```bash
# File: .env
# Contains: Development and deployment API keys
# Action: Copy .env.template → .env and fill in actual keys
```

**Required API Keys**:
- `GOOGLE_API_KEY`: Development key (Custom Search API)  
- `DEPLOYMENT_API_KEY`: Deployment key (Apps Script + Drive + Slides + Sheets APIs)

### 📄 **OAuth Client Credentials**
```bash
# File: credentials.json  
# Contains: OAuth 2.0 web client configuration
# Action: Download fresh from Google Cloud Console or copy existing
```

## Transfer Procedure

### **Method 1: GitHub Secrets (Recommended)**

#### On Source Machine:
1. ✅ **Add refresh token to GitHub Secrets**
2. ✅ **Commit and push all code changes**
3. ✅ **Note API key values** from .env file

#### On Target Machine:
1. **Clone repository**: `git clone https://github.com/spm1001/slider.git`
2. **Install dependencies**: `npm install`
3. **Setup environment**: `cp .env.template .env` and fill in API keys
4. **Copy credentials.json**: Place in project root
5. **Test deployment**: `npm run deploy` (uses GitHub Secret automatically)

### **Method 2: Manual File Transfer**

#### On Source Machine:
1. ✅ **Commit and push all code changes**
2. ✅ **Copy token.json to secure location** (password manager, encrypted drive)
3. ✅ **Note API key values** from .env file
4. ✅ **Verify credentials.json is available**

#### On Target Machine:
1. **Clone repository**: `git clone https://github.com/spm1001/slider.git`
2. **Install dependencies**: `npm install`
3. **Copy token.json**: Place in project root
4. **Setup environment**: `cp .env.template .env` and fill in API keys
5. **Copy credentials.json**: Place in project root
6. **Test deployment**: `npm run deploy` (should work immediately)

## Verification

After transfer, these commands should work without re-authorization:
```bash
npm run deploy          # Should update Apps Script project
npm run security:check  # Should pass validation
```

If deployment fails with OAuth errors, the token may have expired and you'll need to re-authorize.

## Security Notes

- **GitHub Secrets**: Encrypted, access-controlled, ideal for team development
- **token.json**: Contains sensitive OAuth tokens - store securely if using manual transfer
- **.env**: Contains API keys - never commit to git
- **credentials.json**: OAuth client config - keep secure but less sensitive than tokens

## GitHub Secrets Setup Instructions

1. **Go to**: Repository → Settings → Secrets and variables → Actions
2. **Click**: "New repository secret"
3. **Add secrets**:
   - Name: `OAUTH_REFRESH_TOKEN`
   - Value: `[YOUR_REFRESH_TOKEN_FROM_TOKEN_JSON]`

## Current Project Status

- **Deployment**: ✅ Successfully deployed and functional
- **Apps Script Project**: `1I2dUX4hBHie4JvxELe5Mog8PxHXRWLUDACYzw94NqMrQr-YGawsNsouu`
- **OAuth Token Expiry**: 2025-12-31
- **Next Step**: Test slide formatter with target presentation

---

**Generated**: 2025-08-17 (Session closedown)
**Ready for**: Development machine transfer and continued testing