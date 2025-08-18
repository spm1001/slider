#!/bin/bash

# Security validation script for Google Slides Formatter project
# Checks for common security issues before commits

set -e

echo "🔒 Running security validation checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues found
ISSUES_FOUND=0

# Function to report issues
report_issue() {
    echo -e "${RED}❌ SECURITY ISSUE: $1${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

report_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check 1: Scan for potential API keys
echo "🔍 Scanning for potential API keys..."

# Google API keys (enhanced detection for MCP configs and all JSON files)
if grep -r "AIzaSy[A-Za-z0-9_-]\{35\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=scripts --exclude-dir=.claude --include="*.json" --include="*.js" --include="*.ts" --include="*.md" --exclude="*.bak" --exclude="LEARNING_LOG.md" --exclude="secrets/incident-response.md" --exclude=".mcp.json.template" 2>/dev/null; then
    report_issue "Google API key pattern detected"
fi

# Specifically scan for MCP configuration with API keys (exclude .claude directory)
if grep -r "GOOGLE_API_KEY.*AIzaSy" . --include="*.json" --exclude-dir=.claude --exclude=".mcp.json.template" 2>/dev/null; then
    report_issue "MCP configuration file contains hardcoded Google API key (use environment variables)"
fi

# AWS keys
if grep -r "AKIA[0-9A-Z]\{16\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=scripts 2>/dev/null; then
    report_issue "AWS access key pattern detected"
fi

# Slack tokens
if grep -r "xoxb-[0-9A-Za-z-]\{50,\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=scripts 2>/dev/null; then
    report_issue "Slack bot token pattern detected"
fi

# OpenAI API keys
if grep -r "sk-[A-Za-z0-9]\{48\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=scripts 2>/dev/null; then
    report_issue "OpenAI API key pattern detected"
fi

# Check 2: Scan for hardcoded secrets in common patterns
echo "🔍 Scanning for hardcoded secret patterns..."

# Common secret variable names
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]*['\"]"
    "secret\s*=\s*['\"][^'\"]*['\"]"
    "token\s*=\s*['\"][^'\"]*['\"]"
    "key\s*=\s*['\"][^'\"]*['\"]"
    "api_key\s*=\s*['\"][^'\"]*['\"]"
    "client_secret\s*=\s*['\"][^'\"]*['\"]"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rE "$pattern" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=scripts --include="*.js" --include="*.ts" --include="*.json" --include="*.py" 2>/dev/null; then
        report_warning "Potential hardcoded secret pattern found: $pattern"
    fi
done

# Check 3: Verify required security files exist
echo "🔍 Checking for required security files..."

REQUIRED_FILES=(
    ".env.template"
    ".gitignore"
    "secrets/README.md"
    "secrets/setup-guide.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        report_success "Required security file exists: $file"
    else
        report_issue "Missing required security file: $file"
    fi
done

# Check 4: Verify .gitignore includes secret patterns
echo "🔍 Validating .gitignore coverage..."

REQUIRED_GITIGNORE_PATTERNS=(
    ".env"
    "credentials.json"
    "token.json"
    "*secret*"
    "*key*"
)

if [[ -f ".gitignore" ]]; then
    for pattern in "${REQUIRED_GITIGNORE_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            report_success ".gitignore includes: $pattern"
        else
            report_warning ".gitignore missing pattern: $pattern"
        fi
    done
else
    report_issue ".gitignore file not found"
fi

# Check 5: Verify no actual secret files are tracked
echo "🔍 Checking for tracked secret files..."

DANGEROUS_FILES=(
    ".env"
    "credentials.json"
    "token.json"
    "client_secret.json"
    "service-account.json"
    ".mcp.json"
    "mcp-config.json"
)

for file in "${DANGEROUS_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" 2>/dev/null; then
        report_issue "Dangerous file is tracked by git: $file"
    fi
done

# Also check for any MCP config files with patterns
echo "🔍 Checking for MCP configuration files..."
if git ls-files | grep -E "\.(mcp\.json|mcp-config\.json)$|^\.mcp\.json$"; then
    report_issue "MCP configuration file detected in git tracking (should use .mcp.json.template with environment variables)"
fi

# Check 6: Scan documentation for non-placeholder values
echo "🔍 Scanning documentation for potential real secrets..."

# Look for non-placeholder API key patterns in documentation
if grep -r "AIzaSy[A-Za-z0-9_-]\{35\}" . --include="*.md" --exclude="LEARNING_LOG.md" --exclude="secrets/incident-response.md" 2>/dev/null | grep -v "YOUR_GOOGLE_API_KEY_HERE" | grep -v "your_google_api_key_here"; then
    report_issue "Potential real API key found in documentation"
fi

# Check 7: Validate environment template
echo "🔍 Validating environment template..."

if [[ -f ".env.template" ]]; then
    # Check that template uses placeholder values
    if grep -q "your_.*_here\|YOUR_.*_HERE\|<.*>" .env.template; then
        report_success "Environment template uses placeholder values"
    else
        report_warning "Environment template may contain real values instead of placeholders"
    fi
    
    # Check for common required variables
    REQUIRED_ENV_VARS=(
        "GOOGLE_API_KEY"
        "GOOGLE_SEARCH_ENGINE_ID"
        "GOOGLE_CLOUD_PROJECT_ID"
    )
    
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if grep -q "$var" .env.template; then
            report_success "Environment template includes: $var"
        else
            report_warning "Environment template missing: $var"
        fi
    done
fi

# Check 8: Validate that .env file is not committed if it exists
echo "🔍 Checking local .env file status..."

if [[ -f ".env" ]]; then
    if git check-ignore .env >/dev/null 2>&1; then
        report_success ".env file exists and is properly ignored by git"
    else
        report_issue ".env file exists but is NOT ignored by git"
    fi
fi

# Final report
echo ""
echo "🔒 Security validation complete!"
echo "================================"

if [[ $ISSUES_FOUND -eq 0 ]]; then
    echo -e "${GREEN}✅ No security issues found! Safe to proceed.${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES_FOUND security issue(s). Please fix before committing.${NC}"
    echo ""
    echo "📋 Quick fixes:"
    echo "  - Remove any real API keys from files"
    echo "  - Use environment variables for all secrets"
    echo "  - Update .gitignore to exclude secret files"
    echo "  - Use placeholder values in documentation"
    echo ""
    exit 1
fi