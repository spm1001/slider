# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script development project for creating a Google Slides and Sheets formatting tool. The project aims to automatically format Google Slides presentations and linked Google Sheets charts according to a standard template.

## Development Environment

This project has a comprehensive technical specification (see readme.md) ready for implementation. All development will use Google Apps Script (.gs files) and the Google Workspace APIs.

### Project Structure
The Apps Script project will follow this modular organization:
- `main.gs` - Entry point and orchestration
- `config.gs` - YAML configuration management  
- `slides-api.gs` - Google Slides API interactions
- `formatter.gs` - Core formatting logic
- `ui.gs` - User interface and progress reporting
- `utils.gs` - Utility functions and helpers
- `constants.gs` - API scopes, constants, and mappings

### Configuration System
- **Format**: YAML configuration files for designer-friendly editing
- **Template Integration**: Reference Google Slides presentation for style extraction
- **Validation**: JSON schema validation with comprehensive error reporting

### MCP Server Configuration

The project includes an enhanced MCP server configuration that provides access to:
- **Custom patched `@googleworkspace/mcp-dev-assist`**: Located in `mcp-dev-assist-local/`
- **Fixed Search Functionality**: Switched from Discovery Engine to Custom Search API
- **Google Workspace Card previews**: Working with API key `YOUR_GOOGLE_API_KEY_HERE`
- **Up-to-date API reference materials**: Custom Search Engine ID `701ecba480bf443fa`

**Configuration**: Use local modified package via `npx tsx mcp-dev-assist-local/src/index.ts --stdio`

### Key Google Workspace APIs

The project will primarily use:
- **Apps Script API**: For managing script projects, deployments, and executions
- **Google Slides API**: For reading and modifying presentation content, formatting, and objects
  - Primary methods: `presentations.get`, `presentations.batchUpdate`, `presentations.pages.get`
  - Batch operations: `updateTextStyle`, `updateShapeProperties`, `updateImageProperties`
- **Google Sheets API**: For chart object formatting and data manipulation (Phase 2+)

### Authentication Requirements
Required OAuth 2.0 scopes (configured in `apps-script-bundle.json`):
- `https://www.googleapis.com/auth/presentations` - Read and modify presentations
- `https://www.googleapis.com/auth/drive.readonly` - Access reference templates  
- `https://www.googleapis.com/auth/spreadsheets` - Chart modifications (Phase 2+)

**Deployment Authentication**: Requires OAuth 2.0 flow for Apps Script API with scopes:
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/drive.scripts` 
- `https://www.googleapis.com/auth/script.projects`

## Development Phases

The project follows a phased approach:

1. **Phase 1**: Standalone Apps Script with hardcoded formatting rules
2. **Phase 2**: Template-based formatting using reference Slides presentation
3. **Phase 3**: Multi-component architecture with UI for feature selection
4. **Phase 4**: Extended Google Sheets chart formatting capabilities
5. **Phase 5**: External database for formatting specifications
6. **Phase 6**: Google Cloud Platform integration for enterprise use

## Testing Framework

The project includes comprehensive testing specifications covering:
- **Unit Tests**: Configuration parsing, API integration, formatting logic
- **Integration Tests**: End-to-end presentation processing with all object types
- **Performance Tests**: 50-slide presentations processed in <60 seconds
- **User Acceptance Tests**: Real-world scenario validation

### Test 1 - Font Swapping (Primary Test Case)
- Target presentation: `https://docs.google.com/presentation/d/1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA/`
- Requirements:
  - Process all objects including notes pages
  - Change "Comic Sans MS" fonts to "Arial"
  - Change "Arial" fonts to "Comic Sans MS"
- Expected: All font changes applied correctly with detailed success/error reporting

### Additional Test Scenarios
- **Comprehensive Object Types**: Multi-slide presentation with text, shapes, images, tables, charts
- **Large Presentation Performance**: 50 slides with 20+ objects each
- **Error Handling**: Permission errors, locked objects, API failures
- **Template Integration**: Reference presentation + YAML configuration merging

## Performance Requirements

- Process presentations up to 50 slides
- Handle slides with tens of objects each  
- Complete processing in under 60 seconds
- Memory usage: <100MB peak
- Success rate: >95% of objects formatted correctly
- API efficiency: Intelligent batching and rate limiting

## Current Project Status

**Apps Script Implementation: COMPLETED** ✅
- All 7 core .gs files implemented and functional (main, config, slides-api, formatter, ui, utils, constants)
- Font swapping logic complete (Comic Sans MS ↔ Arial) with configurable YAML mappings
- Google Slides API integration with retry logic and intelligent batching
- Progress UI with halt capability and error reporting
- Test presentation configured: `1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA`
- **Phase 1 implementation ready for testing**

**Repository & Version Control: COMPLETED** ✅
- **GitHub Repository**: https://github.com/spm1001/slider
- **All commits**: Implementation, deployment system, and cleanup committed
- **Git authentication**: Configured via GitHub CLI (user: spm1001)
- **Remote origin**: Properly configured for clone/pull operations
- **Ready for development**: Can be cloned to any machine with `git clone`

**Automated Deployment System: COMPLETED** ✅
- **Successful deployment**: Apps Script project deployed to Google account
- **Project ID**: `1I2dUX4hBHie4JvxELe5Mog8PxHXRWLUDACYzw94NqMrQr-YGawsNsouu`
- **Project URL**: https://script.google.com/d/1I2dUX4hBHie4JvxELe5Mog8PxHXRWLUDACYzw94NqMrQr-YGawsNsouu/edit
- **OAuth 2.0 Flow**: Web application client working with manual auth code exchange
- **Deployment script**: `deploy-web-manual.js` - proven functional deployment method
- **MCP Server Enhancement**: Created patched `@googleworkspace/mcp-dev-assist` for efficient documentation access

**PROJECT STATUS: DEPLOYMENT COMPLETE** ✅
Apps Script project successfully deployed and ready for testing. All 7 .gs files uploaded and configured.

## Learning and Knowledge Transfer

### Learning Documentation Preference
**IMPORTANT**: The user prefers a Socratic approach to learning and technical explanation:

- **Always explain "how" and "why"** when performing technical operations
- **Record learning experiences** in `LEARNING_LOG.md` (append, never overwrite)
- **Structure explanations** with:
  - The original question or curiosity
  - Step-by-step breakdown of concepts
  - Underlying principles and deeper insights
  - Technical concepts learned
- **Use Socratic method**: Build understanding through questions and guided discovery
- **Connect new concepts** to previously learned material in the log

When teaching new technical concepts, always append to `LEARNING_LOG.md` following the established format.

## Security Infrastructure and Procedures

### Critical Security Status
**🔒 SECURITY POSTURE: HARDENED** - This project has implemented comprehensive security measures following a critical incident response.

### Implemented Security Measures

**Secrets Management System**:
- ✅ Environment variable architecture (.env.template system)
- ✅ Comprehensive .gitignore excluding all secret file patterns
- ✅ Git history cleaned of all exposed credentials
- ✅ Documentation uses placeholder values only

**Automated Security Validation**:
- ✅ Pre-commit hooks for secret detection
- ✅ Automated security scanning (`npm run security:check`)
- ✅ Git pre-commit validation preventing secret commits
- ✅ Multiple detection layers (pattern matching, file scanning, documentation review)

**Security Documentation**:
- ✅ Complete incident response procedures (`secrets/incident-response.md`)
- ✅ Detailed setup guides (`secrets/setup-guide.md`, `secrets/README.md`)
- ✅ Security requirements integrated into SPECIFICATION.md
- ✅ Global security preferences in ~/.claude/CLAUDE.md

**Emergency Response Capability**:
- ✅ Proven incident response procedures (successfully cleaned exposed API key)
- ✅ Git history rewriting capabilities
- ✅ Rapid credential revocation and replacement processes
- ✅ Comprehensive monitoring and detection systems

### Security Commands and Tools

**Daily Security Operations**:
```bash
npm run security:check     # Run comprehensive security validation
npm run security:setup     # Install and configure security tools
./scripts/security-check.sh # Direct security validation script
pre-commit run --all       # Run all pre-commit security hooks
```

**Emergency Response**:
```bash
# IF SECRETS ARE EXPOSED:
# 1. STOP all work immediately
# 2. Revoke credentials at source (Google Cloud Console)
# 3. Follow procedures in secrets/incident-response.md
# 4. Run git history cleaning
# 5. Force push cleaned history
# 6. Generate new credentials
```

### Security Validation Requirements

**Before ANY commit**:
- [ ] Run `npm run security:check` and ensure it passes
- [ ] Verify no real API keys, passwords, or tokens in any files
- [ ] Confirm all secrets are in environment variables
- [ ] Check documentation uses placeholder values only

**Before ANY deployment**:
- [ ] Validate .env file contains all required variables
- [ ] Test credentials in secure environment
- [ ] Verify API key restrictions are properly configured
- [ ] Confirm OAuth scopes are minimal and appropriate

### Lessons Learned from Security Incident

**Root Cause**: API key hardcoded in documentation and configuration files, then committed to public repository.

**Prevention Measures Implemented**:
1. **Global Security Culture**: Updated ~/.claude/CLAUDE.md with mandatory security practices
2. **Design-Time Security**: Added comprehensive security requirements to SPECIFICATION.md
3. **Automated Prevention**: Implemented pre-commit hooks and security scanning
4. **Repository Defaults**: Default to private repositories, security review before public
5. **Response Capability**: Proven procedures for rapid incident response

**Key Insights**:
- Security must be designed in from day one, not added later
- Multiple layers of prevention are essential (one layer will eventually fail)
- Rapid response capabilities are critical for minimizing exposure impact
- Documentation and training are as important as technical controls

### Ongoing Security Maintenance

**Monthly Tasks**:
- Review repository for accidentally committed secrets
- Validate all security tools are working correctly
- Update security documentation as needed

**Quarterly Tasks**:
- Rotate API keys and credentials
- Review and update security procedures
- Test incident response procedures

**Project Security Contacts**:
- Primary: Project owner (immediate credential revocation authority)
- Escalation: [To be defined based on organization]

When teaching new technical concepts, always append to `LEARNING_LOG.md` following the established format.

## Implementation Notes

### User Interface Requirements
- Simple "working" progress indicator without percentage completion
- Graceful halt execution capability
- Error reporting with hyperlinked deep links to specific slides
- URL format: `https://docs.google.com/presentation/d/{presentationId}/edit#slide=id.{slideId}`

### Chart Strategy Decision
- **Phase 1**: Local chart modification (simpler implementation, immediate results)
- **Phase 2+**: Optional remote chart modification (persistent changes, requires additional permissions)

### Error Handling Approach
- Skip failed objects and continue processing
- Provide detailed error list for manual resolution
- Maintain graceful degradation for partial completion

## Git Workflow & Repository Management

### Repository Structure
- **GitHub Repository**: https://github.com/spm1001/slider
- **Local Repository**: `/home/modha/slider/` (SSH environment)
- **Git Authentication**: GitHub CLI with token (`gho_****` with repo permissions)
- **Remote Configuration**: `origin` → `https://github.com/spm1001/slider.git`

### Git Concepts for Development
- **Multiple Remotes**: Can add additional remotes for backups, forks, or deployment targets
- **Remote Naming**: `origin` is convention (not special meaning) - other remotes can be `upstream`, `backup`, `staging`, etc.
- **Branch Tracking**: Local `main` branch tracks `origin/main` for synchronization
- **Security**: `credentials.json` excluded from commits (contains sensitive OAuth data)

### Clone Instructions for Local Development
```bash
git clone https://github.com/spm1001/slider.git
cd slider
npm install
# Add your credentials.json file (web application OAuth 2.0 client)
npm run deploy  # Uses deploy-web-manual.js
```

### Deployment Instructions
1. **Create OAuth 2.0 Credentials**: Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=mit-dev-362409) and create a "Web application" OAuth 2.0 client
2. **Download credentials.json**: Save the downloaded JSON file as `credentials.json` in the project root
3. **Run deployment**: Execute `npm run deploy` and follow the browser OAuth flow
4. **Complete authorization**: Copy the authorization code from the failed localhost redirect URL
5. **Project deployed**: The script will create/update your Apps Script project

## Key Documentation Links

- **Repository**: https://github.com/spm1001/slider
- Apps Script API concepts: https://developers.google.com/apps-script/api/concepts
- Google Slides API: https://developers.google.com/workspace/slides/api/guides/overview  
- Google Workspace Add-ons: https://developers.google.com/workspace/add-ons/editors/gsao