#!/bin/bash

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
