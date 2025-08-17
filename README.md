# Google Slides Formatter - Automated Deployment

🚀 **Automated Apps Script deployment with Google Workspace APIs**

This project provides a complete Google Apps Script solution for formatting Google Slides presentations, with **fully automated deployment** using the Google Drive API and Apps Script API.

> 📋 **For detailed technical specifications**, see [SPECIFICATION.md](./SPECIFICATION.md) - comprehensive architecture, API design, and implementation phases.

## ✨ Key Features

### 🎯 Font Formatting
- **Smart Font Swapping**: Comic Sans MS ↔ Arial (configurable)
- **Batch Processing**: Efficient API usage with intelligent batching
- **Notes Support**: Includes presentation notes pages
- **Error Handling**: Skip failed objects, continue processing

### 🚀 Automated Deployment
- **One-Command Setup**: `npm run deploy` creates entire Apps Script project
- **API Management**: Automatic Google API enablement
- **OAuth Setup**: Streamlined authentication flow
- **Project Updates**: Seamless updates to existing projects

### 🔧 Developer Experience
- **Modular Architecture**: 7 specialized .gs files
- **YAML Configuration**: Designer-friendly settings
- **Progress Tracking**: Real-time UI with halt capability
- **Deep Linking**: Direct links to problematic slides

## 🏃‍♂️ Quick Start

### 🚀 New Machine Setup (Essential Steps)

**If you're setting up on a new development machine**, these are the critical steps:

1. **Clone & Install**: `git clone https://github.com/spm1001/slider.git && cd slider && npm install`
2. **Environment Variables**: `cp .env.template .env` then edit `.env` with your API keys ⚠️ **MANDATORY**
3. **OAuth Credentials**: Place your `credentials.json` file in project root
4. **Deploy**: `npm run deploy` and complete OAuth flow
5. **Enable User APIs**: Visit https://script.google.com/home/usersettings ⚠️ **CRITICAL**

### Prerequisites
- Node.js 14+
- Google Cloud Project with billing enabled
- Google Account with appropriate permissions

### 1️⃣ Setup
```bash
# Clone the project
git clone https://github.com/spm1001/slider.git
cd slider
npm install
```

### 2️⃣ Configure Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **TWO API keys** with different scopes:
   - **Development Key**: Custom Search API (for MCP documentation lookup)
   - **Deployment Key**: Apps Script + Drive + Slides + Sheets APIs  
3. Create OAuth 2.0 Client ID (**Web application** - not Desktop)
4. Download OAuth client and save as `credentials.json`
5. Enable required APIs: Drive, Slides, Sheets, Apps Script

### 2️⃣.5 Enable User-Level Apps Script API
🚨 **CRITICAL**: Visit https://script.google.com/home/usersettings and **enable the Apps Script API**

This user-level permission is required in addition to project-level API enablement. Without this step, deployment will fail with permission errors.

### 2️⃣.6 Configure Environment Variables ⚠️ **REQUIRED**
```bash
# Copy template and fill in your API keys
cp .env.template .env
# Edit .env with your actual API keys:
# GOOGLE_API_KEY=your_development_key_here (for MCP documentation lookup)
# DEPLOYMENT_API_KEY=your_deployment_key_here (for Apps Script deployment)
```

**🔑 This step is mandatory** - deployment will fail without both API keys properly configured in `.env`

### 3️⃣ Deploy
```bash
# Deploy complete Apps Script project
npm run deploy
# Follow browser OAuth flow and copy authorization code
```

### 5️⃣ Test
1. Open the generated Apps Script project URL
2. Run `testFontSwap()` function
3. Open any Google Sheets to see "Slide Formatter" menu
4. Test with presentation: `1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA`

## 📁 Project Structure

### Apps Script Files (Auto-deployed)
```
main.gs          # Entry point and orchestration
config.gs        # YAML configuration management
slides-api.gs    # Google Slides API client with retry logic
formatter.gs     # Core formatting logic and batch processing
ui.gs           # User interface and progress tracking
utils.gs        # Utility functions and performance tools
constants.gs    # API scopes, element types, defaults
```

### Deployment System
```
deploy-web-manual.js # Web OAuth deployment script (Google Drive API)
package.json        # Node.js dependencies and scripts
credentials.json    # OAuth 2.0 web application credentials (user-provided)
token.json          # Generated OAuth tokens (auto-created)
```

## 🎯 Usage Examples

### Basic Font Swapping
```javascript
// In Google Sheets, use the menu:
// Slide Formatter → Format Presentation
// Enter: https://docs.google.com/presentation/d/YOUR_ID/edit
```

### Custom Configuration
```yaml
# Settings → YAML Configuration
fontMappings:
  - "Comic Sans MS": "Arial"
  - "Times New Roman": "Helvetica"
  - "Calibri": "Roboto"

processNotes: true
skipErrors: true
batchSize: 25
apiRetries: 5
apiRetryDelay: 2000
```

### Programmatic Usage
```javascript
// Direct function call in Apps Script
const config = getDefaultConfig();
const formatter = new SlideFormatter(config);
const result = formatter.formatPresentation('PRESENTATION_ID');
```

## 🔧 Configuration Options

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| `fontMappings` | Font replacement pairs | Comic Sans ↔ Arial | Any font names |
| `processNotes` | Include notes pages | `true` | boolean |
| `skipErrors` | Continue on errors | `true` | boolean |
| `batchSize` | API batch size | `50` | 1-100 |
| `apiRetries` | Retry attempts | `3` | 1-10 |
| `apiRetryDelay` | Retry delay (ms) | `1000` | 100+ |

## 🚨 Troubleshooting

### Common Issues

**"Service invoked too many times"**
```yaml
# Reduce batch size and increase delays
batchSize: 25
apiRetryDelay: 2000
```

**"Permission denied"**
- Ensure presentation is accessible
- Check if presentation is in "Suggesting" mode
- Verify OAuth scopes are properly configured

**"Invalid presentation URL"**
- Use full Google Slides URL
- Format: `https://docs.google.com/presentation/d/ID/edit`

### API Enablement Issues
```bash
# Manual API enablement
https://console.cloud.google.com/apis/dashboard

Required APIs:
• Google Drive API
• Google Slides API  
• Google Sheets API
• Apps Script API
```

### OAuth Permission Issues
- Ensure credentials.json is from **Web Application** type (not Desktop)
- Check that all required scopes are included
- Clear token.json if authentication fails

## 📊 Performance Characteristics

- **Capacity**: 50+ slides, 20+ objects per slide
- **Speed**: <60 seconds for typical presentations  
- **Memory**: <100MB peak usage
- **Success Rate**: >95% of objects processed correctly
- **API Efficiency**: Intelligent batching with rate limiting

## 🔒 Security & Permissions

### Required OAuth Scopes
```javascript
[
  'https://www.googleapis.com/auth/presentations',      // Modify slides
  'https://www.googleapis.com/auth/drive.readonly',     // Read templates
  'https://www.googleapis.com/auth/spreadsheets'        // UI integration
]
```

### Deployment Scopes (Additional)
```javascript
[
  'https://www.googleapis.com/auth/drive',              // Create projects
  'https://www.googleapis.com/auth/drive.scripts'       // Upload scripts
]
```

## 🚀 Advanced Features

### Automated Project Updates
```bash
# Update existing project with new code
npm run deploy  # Automatically detects and updates existing project
```

### Batch Font Processing
```javascript
// Process multiple presentations
const presentations = ['ID1', 'ID2', 'ID3'];
presentations.forEach(id => processPresentation(id));
```

### Error Reporting with Deep Links
```javascript
// Automatic deep link generation
https://docs.google.com/presentation/d/ID/edit#slide=id.SLIDE_ID
```

## 🔄 Development Workflow

### Local Development
1. Edit .gs files locally
2. Test with `npm run deploy`
3. Verify in Apps Script editor
4. Test in Google Sheets

### Version Control
```bash
git add *.gs deploy.js package.json
git commit -m "Update font formatting logic"
```

### Continuous Integration
```bash
# In CI/CD pipeline
npm install
npm run deploy  # Automated deployment
```

## 🎯 Test Cases

### Primary Test (Included)
- **URL**: `1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA`
- **Test**: Comic Sans MS ↔ Arial font swap
- **Scope**: All slides + notes pages
- **Expected**: <60 seconds, >95% success rate

### Custom Test Presentations
1. Create test presentation with various fonts
2. Add to configuration for automated testing
3. Verify results with detailed reporting

## 🤝 Contributing

### Adding New Features
1. Edit appropriate .gs file
2. Update constants.gs if needed
3. Run `npm run deploy` to test
4. Submit pull request

### Reporting Issues
- Include presentation ID (if public)
- Provide error logs from execution transcript
- Specify configuration used

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Workspace APIs for comprehensive functionality
- Apps Script platform for serverless execution
- Drive API for automated deployment capabilities

---

**Ready to transform your slide formatting workflow?** 🎨

Run `npm run deploy` and start automating your Google Slides formatting today!