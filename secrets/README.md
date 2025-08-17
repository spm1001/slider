# Secrets Management Guide

This directory contains documentation and templates for managing secrets securely in the Google Slides Formatter project.

## ✅ Security Status

**RESOLVED**: Compromised API key has been deleted from Google Cloud Console.

## Quick Setup

### 1. Environment Variables
```bash
# Copy the template
cp .env.template .env

# Edit with your actual values
# NEVER commit .env to git!
```

### 2. OAuth Credentials
```bash
# Download from Google Cloud Console → Credentials
# Save as: credentials.json (in project root)
# Type: Web Application OAuth 2.0 Client
```

### 3. Generate New API Key
1. Go to [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Create new API Key
3. Restrict to: Custom Search API
4. Add to `.env` file as `GOOGLE_API_KEY=your_new_key_here`

## File Structure

```
project-root/
├── .env                     # ❌ Never commit - local secrets
├── .env.template           # ✅ Template showing required variables  
├── credentials.json        # ❌ Never commit - OAuth client config
├── token.json             # ❌ Never commit - auto-generated OAuth tokens
├── secrets/               # ✅ Documentation only
│   ├── README.md          # This file
│   └── setup-guide.md     # Detailed setup instructions
└── .gitignore             # ✅ Excludes all secret files
```

## Security Best Practices

### What We Protect
- ✅ **API Keys**: Google Custom Search API key
- ✅ **OAuth Credentials**: Client ID, client secret  
- ✅ **OAuth Tokens**: Access tokens, refresh tokens
- ✅ **Project IDs**: Google Cloud project identifiers
- ✅ **Personal Configs**: Claude Code settings

### How We Protect
- ✅ **Environment Variables**: All secrets in .env files
- ✅ **Git Exclusion**: Comprehensive .gitignore rules
- ✅ **Documentation**: Templates and guides, no actual secrets
- ✅ **Validation**: Startup checks for required variables

### What Never Gets Committed
- ❌ `.env` files (any environment)
- ❌ `credentials.json` (OAuth config) 
- ❌ `token.json` (OAuth tokens)
- ❌ `.claude/` directory (personal settings)
- ❌ Any file containing actual API keys or secrets

## Troubleshooting

### Missing Environment Variables
```bash
# Check what's required
cat .env.template

# Verify your .env file has all variables
source .env && env | grep GOOGLE
```

### OAuth Issues
```bash
# Remove old tokens to re-authenticate
rm token.json

# Run deployment to trigger new OAuth flow
npm run deploy
```

### MCP Server Configuration
The MCP server now reads environment variables automatically. No manual configuration needed.

## Emergency Procedures

### If Secrets Are Accidentally Committed
1. **Immediately revoke** all exposed keys/tokens
2. **Generate new credentials** 
3. **Clean git history** (contact team for assistance)
4. **Force push** cleaned history

### Regular Security Maintenance
- 🔄 **Rotate API keys** every 90 days
- 🔍 **Audit git history** for accidental exposures
- ✅ **Validate .gitignore** rules regularly
- 📋 **Update this documentation** when procedures change

## Next Steps

1. ✅ API key revoked (DONE)
2. ⏳ Set up .env file with new credentials
3. ⏳ Test deployment with secure configuration
4. ⏳ Verify MCP server works with environment variables

---

**Remember**: When in doubt, never commit anything that looks like a secret. It's easier to prevent exposure than to clean it up later!