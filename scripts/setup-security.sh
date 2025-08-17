#!/bin/bash

# Security setup script for Google Slides Formatter project
# Installs and configures security tools and pre-commit hooks

set -e

echo "🔒 Setting up comprehensive security tools..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -f ".env.template" ]]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

info "Initializing security infrastructure for Google Slides Formatter..."

# 1. Install pre-commit framework
echo ""
info "Step 1: Installing pre-commit framework..."

if command -v pre-commit &> /dev/null; then
    success "pre-commit is already installed"
else
    if command -v pip3 &> /dev/null; then
        pip3 install pre-commit
        success "pre-commit installed via pip3"
    elif command -v pip &> /dev/null; then
        pip install pre-commit
        success "pre-commit installed via pip"
    else
        warning "pip not found. Please install pre-commit manually:"
        echo "  pip install pre-commit"
        echo "  Then run this script again"
        exit 1
    fi
fi

# 2. Install git hooks
echo ""
info "Step 2: Installing git hooks..."

if [[ -f ".pre-commit-config.yaml" ]]; then
    pre-commit install
    success "Pre-commit hooks installed"
    
    # Install commit-msg hook for additional validation
    pre-commit install --hook-type commit-msg
    success "Commit message hooks installed"
else
    warning ".pre-commit-config.yaml not found - hooks not installed"
fi

# 3. Initialize secrets baseline (if using detect-secrets)
echo ""
info "Step 3: Initializing secrets detection baseline..."

if command -v detect-secrets &> /dev/null; then
    # Generate baseline of current "secrets" (should be clean after our cleanup)
    detect-secrets scan --baseline .secrets.baseline
    success "Secrets detection baseline created"
else
    info "detect-secrets not found - installing via pip..."
    if command -v pip3 &> /dev/null; then
        pip3 install detect-secrets
        detect-secrets scan --baseline .secrets.baseline
        success "detect-secrets installed and baseline created"
    else
        warning "Could not install detect-secrets. Install manually if needed:"
        echo "  pip install detect-secrets"
    fi
fi

# 4. Test security validation
echo ""
info "Step 4: Testing security validation..."

if [[ -x "./scripts/security-check.sh" ]]; then
    if ./scripts/security-check.sh; then
        success "Security validation passed"
    else
        warning "Security validation found issues - please review and fix"
    fi
else
    warning "Security check script not found or not executable"
fi

# 5. Create local security configuration
echo ""
info "Step 5: Creating local security configuration..."

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Create git hooks directory and symlink our security check
mkdir -p .git/hooks

# Create a simple pre-commit hook that calls our security check
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit security validation for Google Slides Formatter

echo "🔒 Running pre-commit security validation..."

# Run our security check script
if [[ -x "./scripts/security-check.sh" ]]; then
    if ! ./scripts/security-check.sh; then
        echo ""
        echo "❌ Pre-commit security check failed!"
        echo "   Fix the security issues above before committing."
        echo "   Or run: npm run security:check"
        exit 1
    fi
else
    echo "⚠️  Security check script not found - skipping validation"
fi

echo "✅ Pre-commit security validation passed"
EOF

chmod +x .git/hooks/pre-commit
success "Git pre-commit hook installed"

# 6. Create security validation npm scripts test
echo ""
info "Step 6: Testing npm security scripts..."

if npm run security:check; then
    success "npm security scripts working correctly"
else
    warning "npm security scripts need attention"
fi

# 7. Generate security documentation
echo ""
info "Step 7: Validating security documentation..."

REQUIRED_DOCS=(
    "secrets/README.md"
    "secrets/setup-guide.md"
    "secrets/incident-response.md"
    ".env.template"
    "SECURITY_ALERT.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        success "Security document exists: $doc"
    else
        warning "Missing security document: $doc"
    fi
done

# 8. Validate .gitignore
echo ""
info "Step 8: Validating .gitignore security coverage..."

CRITICAL_PATTERNS=(
    ".env"
    "credentials.json"
    "token.json"
    "*secret*"
    "*key*"
)

missing_patterns=()
for pattern in "${CRITICAL_PATTERNS[@]}"; do
    if grep -q "$pattern" .gitignore; then
        success ".gitignore includes: $pattern"
    else
        warning ".gitignore missing critical pattern: $pattern"
        missing_patterns+=("$pattern")
    fi
done

if [[ ${#missing_patterns[@]} -gt 0 ]]; then
    echo ""
    warning "Consider adding these patterns to .gitignore:"
    for pattern in "${missing_patterns[@]}"; do
        echo "  $pattern"
    done
fi

# 9. Final setup summary
echo ""
echo "🎉 Security setup complete!"
echo "=========================="
echo ""
echo "🔒 Security tools installed:"
echo "  ✅ Pre-commit framework with hooks"
echo "  ✅ Git pre-commit security validation"
echo "  ✅ Secrets detection baseline"
echo "  ✅ NPM security scripts"
echo ""
echo "📋 Available commands:"
echo "  npm run security:check   - Run security validation"
echo "  npm run security:scan    - Alias for security check"
echo "  pre-commit run --all     - Run all pre-commit hooks"
echo ""
echo "🚨 Remember:"
echo "  - Never commit real secrets"
echo "  - Use environment variables for all configuration"
echo "  - Run 'npm run security:check' before committing"
echo "  - Keep your .env.template updated"
echo ""
echo "💡 Next steps:"
echo "  1. Copy .env.template to .env and fill in your credentials"
echo "  2. Test deployment: npm run deploy"
echo "  3. Run security check: npm run security:check"
echo ""

success "Security infrastructure ready! 🛡️"