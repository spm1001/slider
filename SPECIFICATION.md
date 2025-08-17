# Technical Specification: Google Slides Formatter

> 🚀 **Ready to deploy?** See [README.md](./README.md) for installation and deployment instructions.

## Overview
This tool is meant to work on a Google Slides presentation and any linked objects, especially graphics charts inserted from Google Sheets, and ensure that everything is consistently formatted according to our standard template.

## Security and Secrets Management Requirements

### Critical Security Design Principles

This project handles sensitive Google API credentials and must implement comprehensive secrets management from day one. **Security is a primary architectural requirement, not a secondary consideration.**

#### Mandatory Security Infrastructure

**Environment Variable Architecture**:
- ALL secrets and configuration MUST use environment variables
- NO hardcoded API keys, tokens, or credentials in any code or configuration files
- Create `.env.template` documenting all required variables before any development
- Implement startup validation to ensure all required environment variables are present

**Repository Security**:
- Comprehensive `.gitignore` MUST exclude all secret files before first commit
- Repository MUST be private initially, only made public after security review
- All documentation MUST use placeholder values: `YOUR_API_KEY_HERE`, `your-secret-here`
- Pre-commit security validation MUST be implemented

**API Key Management**:
- Apply principle of least privilege to all API keys
- Restrict API keys to minimum required services (Custom Search API, Apps Script API, etc.)
- Implement separate keys for development, staging, and production environments
- Document key rotation procedures and schedules

#### Security Boundaries and Threat Model

**Threat Assessment**:
- Public repository exposure (highest risk - complete credential compromise)
- Unauthorized API usage (medium risk - billing impact, quota exhaustion)
- Man-in-the-middle attacks (low risk - HTTPS mitigates)
- Local credential theft (medium risk - environment variable protection)

**Mitigation Strategies**:
- Environment variable storage for all secrets
- Git history protection (never commit real secrets)
- API key restrictions and monitoring
- Regular credential rotation
- Security incident response procedures

#### Required Security Documentation

**Security Setup Guide** (`secrets/setup-guide.md`):
- Complete credential generation procedures
- Environment variable configuration steps
- API key restriction configuration
- Security validation checklists

**Incident Response Procedures** (`secrets/incident-response.md`):
- Steps for credential compromise response
- Git history cleaning procedures
- Emergency contact information
- Lessons learned documentation templates

### Authentication and Authorization Architecture

#### Google Cloud Platform Security

**Project Configuration**:
- Project ID: `mit-dev-362409` (development environment)
- Separate projects MUST be used for staging and production
- Billing alerts MUST be configured to detect unauthorized usage
- API usage monitoring MUST be enabled

**OAuth 2.0 Security**:
- Web application OAuth clients for deployment (not desktop clients)
- Minimum required scopes: presentations, drive.readonly, spreadsheets
- Deployment scopes: drive, drive.scripts, script.projects
- Token storage in environment variables only

**API Key Security**:
- Custom Search API key restricted to Google Workspace documentation
- Apps Script API access through OAuth only
- Regular key rotation (quarterly for development, monthly for production)
- Usage monitoring and alerting

### Data Protection and Privacy

#### Sensitive Data Handling

**Presentation Data**:
- Process presentations in-memory only
- NO persistent storage of presentation content
- Minimal data retention (process and discard)
- User consent for presentation access

**Credential Storage**:
- Local environment variables only
- NO credential persistence in application
- Secure token refresh mechanisms
- Automatic token expiration handling

**Logging and Monitoring**:
- NO secrets in application logs
- Redact all potentially sensitive information
- Structured logging for security audit trails
- Regular log review and analysis

### Security Testing and Validation

#### Pre-Deployment Security Checks

**Automated Security Validation**:
- Secret scanning in all files before commit
- Environment variable validation at startup
- API key functionality testing with restricted permissions
- OAuth flow validation in secure environment

**Manual Security Review**:
- Code review with security checklist
- Documentation review for accidental secret exposure
- Configuration review for hardcoded values
- Incident response procedure testing

#### Ongoing Security Maintenance

**Regular Security Tasks**:
- Monthly repository scans for accidentally committed secrets
- Quarterly API key rotation and validation
- Annual security architecture review
- Continuous monitoring of API usage patterns

**Security Metrics and KPIs**:
- Zero tolerance for committed secrets
- 100% environment variable coverage for configuration
- <24 hour response time for security incidents
- Regular security training and awareness updates

### Compliance and Governance

#### Security Governance Framework

**Roles and Responsibilities**:
- Developer: Implement security requirements, follow procedures
- Security Reviewer: Validate security implementation, approve deployments
- Incident Commander: Lead response to security incidents

**Security Review Gates**:
- Design phase: Security requirements validation
- Development phase: Code and configuration review
- Deployment phase: Security testing and approval
- Production phase: Monitoring and incident response

**Documentation Requirements**:
- All security decisions MUST be documented
- Security incidents MUST be logged and analyzed
- Regular security architecture updates
- Compliance audit trail maintenance

---

**Security Requirement Summary**: This project MUST implement comprehensive secrets management, environment variable architecture, and security monitoring before any development begins. Security failures that result in credential exposure are considered critical incidents requiring immediate response and remediation.

## Technical Architecture

### Project Structure
The Apps Script project will be organized into modular components:

```
slider-formatter/
├── main.gs              # Entry point and orchestration
├── config.gs            # Configuration management and YAML parsing
├── slides-api.gs        # Google Slides API interactions
├── sheets-api.gs        # Google Sheets API interactions (future phases)
├── formatter.gs         # Core formatting logic
├── ui.gs                # User interface and progress reporting
├── utils.gs             # Utility functions and helpers
└── constants.gs         # API scopes, constants, and mappings
```

### Authentication & Authorization
- **Required OAuth 2.0 Scopes**:
  - `https://www.googleapis.com/auth/presentations` - Read and modify presentations
  - `https://www.googleapis.com/auth/drive.readonly` - Access reference templates
  - `https://www.googleapis.com/auth/spreadsheets` - Chart modifications (Phase 2+)
- **Permission Strategy**: Individual user authorization initially, organization-wide deployment in later phases
- **Security**: Principle of least privilege, no persistent storage of user tokens

### Performance Architecture
- **Batch API Operations**: Group related API calls to minimize network roundtrips
- **Parallel Processing**: Process independent slides concurrently where possible
- **Memory Management**: Stream large presentations to avoid memory limits
- **Rate Limiting**: Intelligent throttling to stay within Google API quotas
- **Execution Time**: Target <60 seconds for 50-slide presentations

### Error Handling Strategy
- **Graceful Degradation**: Continue processing when individual objects fail
- **Detailed Logging**: Comprehensive error tracking with object-level details
- **User-Friendly Reporting**: Convert technical errors to actionable user guidance
- **Recovery Mechanisms**: Automatic retry for transient failures
- **Rollback Capability**: Preserve original state for critical failures

## Configuration System Design

### YAML Configuration Format
The formatting rules will be defined in a human-readable YAML configuration file that designers can edit without coding expertise:

```yaml
# slider-config.yaml
template:
  reference_presentation_id: "1ABC...XYZ"  # Google Slides template ID
  
fonts:
  mappings:
    - from: "Comic Sans MS"
      to: "Arial"
    - from: "Arial" 
      to: "Comic Sans MS"
  default_font: "Arial"
  
colors:
  brand_primary: "#1a73e8"
  brand_secondary: "#ea4335"
  text_primary: "#202124"
  text_secondary: "#5f6368"
  
shapes:
  default_stroke_width: 1
  default_stroke_color: "#dadce0"
  
images:
  auto_layering: true  # Automatically handle master slide layering issues
  max_width: 800
  max_height: 600
  
charts:
  strategy: "local"  # "local" or "remote" modification
  default_colors: ["#1a73e8", "#ea4335", "#fbbc04", "#34a853"]
  
processing:
  include_notes: true
  include_master_slides: false
  skip_locked_objects: true
```

### Configuration Processing
- **YAML Parser**: Custom parser that validates configuration syntax
- **Schema Validation**: Ensure all required fields are present and correctly formatted
- **Runtime Compilation**: Convert YAML to optimized JSON structure for performance
- **Template Integration**: Merge YAML rules with properties extracted from reference presentation
- **Validation Rules**: Check for conflicting rules and provide designer-friendly error messages

### Template Reference System
- **Reference Presentation**: Single organization-wide Google Slides presentation containing approved styles
- **Property Extraction**: Automatically extract formatting properties from template objects
- **Precedence Rules**: YAML configuration overrides template defaults where specified
- **Template Validation**: Verify template accessibility and structural requirements

## API Integration Specifications

### Google Slides API Methods
The tool will utilize specific Slides API endpoints optimized for batch operations:

**Core API Operations:**
- `presentations.get` - Retrieve presentation structure and metadata
- `presentations.batchUpdate` - Apply multiple formatting changes in single request
- `presentations.pages.get` - Access individual slide and notes page content

**Batch Update Request Types:**
- `updateTextStyle` - Font, size, color, formatting changes
- `updateShapeProperties` - Fill, outline, shadow, and positioning
- `updateImageProperties` - Size, positioning, transparency
- `updateTableColumnProperties` / `updateTableRowProperties` - Table formatting
- `replaceAllText` - Bulk text replacement operations

**Optimization Strategies:**
- **Request Batching**: Group up to 500 operations per batchUpdate call
- **Parallel Processing**: Process independent slides simultaneously
- **Smart Ordering**: Sequence operations to avoid conflicts and dependencies
- **Incremental Updates**: Only modify objects that need changes

### Object Type Processing
**Supported Object Types and Operations:**

1. **Text Elements**
   - Font family, size, weight, style changes
   - Color and highlight modifications
   - Alignment and spacing adjustments
   - List and bullet formatting

2. **Shapes and Graphics**
   - Fill colors and transparency
   - Outline colors, weights, and styles
   - Shadow and reflection effects
   - Transform and positioning

3. **Images**
   - Size and aspect ratio adjustments
   - Positioning and layering (including master slide workarounds)
   - Transparency and effects
   - Alt text standardization

4. **Tables** 
   - Cell formatting and borders
   - Header row styling
   - Column width and row height
   - Text formatting within cells

5. **Charts** (Phase 1: Local Modification)
   - Chart colors and styling
   - Legend and axis formatting
   - Data label appearance
   - Chart size and positioning

### Chart Handling Strategy

**Phase 1: Local Chart Modification**
- **Approach**: Modify chart formatting directly within the presentation
- **API Methods**: Use Slides API chart-specific update requests
- **Advantages**: No additional permissions required, immediate results
- **Limitations**: Changes may be overwritten if chart refreshes from source sheet
- **Implementation**: Detect chart objects and apply styling through `updateChartProperties`

**Phase 2+: Remote Chart Modification**
- **Approach**: Modify chart formatting in source Google Sheets
- **API Methods**: Sheets API `spreadsheets.batchUpdate` with chart formatting requests
- **Advantages**: Changes persist through chart refreshes, comprehensive formatting control
- **Requirements**: Additional Sheets API permissions, source sheet access management
- **Implementation**: Track chart-to-sheet relationships, apply changes at source

### Rate Limiting and Performance
- **API Quotas**: Respect Google API rate limits (100 requests/100 seconds/user)
- **Retry Logic**: Exponential backoff for rate limit and temporary failure handling
- **Progress Tracking**: Maintain processing state for long-running operations
- **Memory Management**: Stream large presentations to avoid Apps Script memory limits

## Phases of development
Over time the tool wil have to go through a number of phases of development. Overall, we need to achieve fast processing of Slide presentations up to 50 slides in length, with slides containing tens of objects. A presentation should ideally be processed in under 60 seconds. 

1. The tool will need to start by using the Apps Script API to manage the script project, create and deploy new script versions, and monitor script executions.
2. To begin with the core script will be a standalone script will contain the data on which properties are to be changed to align with the standard template. It may also depend on the ability to read a template Theme for Google Slides that is contained in a read-only Slide presentation. 
3. As the functionality becomes more complex we imagine that it may be necessary to refactor the script, potentially into multiple components. It may also be necessary to provide a UI at this point to allow the choice of features which are run, control script execution and report back on progress, successes and errors.
4. Over time the tool will develop to include the ability to extend to reformatting Google Sheets chart objects. In the same way it may depend on a 'reference' Google Sheet, as well as some specification in the form of a table of entries.
5. At some point we imagine the data which represents all the properties that are defined as correct for the standard template will migrate to a separate database.
6. Similarly, at some point, the tool will become more popular and be used by less technical people. At that point we may also start to need to use Google Cloud projects for the Apps Scripts to manage authorisations, advanced services and other details. 

## User Interface and Experience

### Progress Reporting
The tool will provide simple, non-intrusive progress feedback:

**Progress Indicator:**
- Simple "working" status display without percentage completion
- Processing status: "Initializing", "Processing slides", "Applying formatting", "Finalizing"
- Current operation indicator: "Processing slide 15 of 42"
- Estimated time remaining (optional, if reliably calculable)

**User Controls:**
- **Start Button**: Initiate formatting process
- **Stop Button**: Gracefully halt execution at any point
- **Progress Dialog**: Modal dialog showing current status
- **Background Processing**: Allow continued work while processing runs

### Error Reporting System
When formatting operations fail, the tool will provide actionable feedback:

**Error List Format:**
- **Hyperlinked Navigation**: Each error includes a clickable link using Google Slides URL format
- **Deep Link Format**: `https://docs.google.com/presentation/d/{presentationId}/edit#slide=id.{slideId}`
- **Error Descriptions**: Human-readable explanation of what failed and why
- **Suggested Actions**: Specific steps users can take to manually resolve issues

**Error Categories:**
- **Permission Errors**: Object locked, insufficient access rights
- **Format Conflicts**: Incompatible property combinations
- **API Limitations**: Unsupported object types or properties
- **Template Issues**: Missing reference styles, invalid configuration

### User Interface Evolution by Phase

**Phase 1: Basic Execution**
- Simple menu item in Extensions menu
- Basic progress dialog
- Text-based error reporting

**Phase 2: Template Integration**
- Template selection interface
- Configuration validation feedback
- Enhanced error details with template context

**Phase 3: Advanced Controls**
- Sidebar interface for feature selection
- Real-time progress with detailed logging
- Preview mode for non-destructive testing
- Undo/rollback capabilities

**Phase 4+: Enterprise Features**
- Batch processing queue management
- User permission and role management
- Audit logging and reporting
- Integration with organization template libraries

### Accessibility and Usability
- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Error Recovery**: Clear paths to resolve and retry failed operations
- **Help Integration**: Contextual help and documentation links

## Key reference material 
Most importantly there is a dev-assist repo on GitHub that provides tools to query the Google Workspace documentation in machine readable form: https://github.com/googleworkspace/dev-assist

Your environment will be configured to make this MCP server to allow you to
- retrieve up-to-date information about Google Workspace APIs and services
- Preview Google Workspace Cards

Note that there is a cap of 100 queries per day for this tool so use it carefully. 

If you want to look at human-readable documentation (for which there are no limits) here are some useful links. You could use these to refine your understanding before using the API to search the documentation more comprehensively. 
- this guide to getting started: https://developers.google.com/workspace/guides/get-started
- the REST API for managing Scripts: https://developers.google.com/apps-script/api/concepts
- the guide to Google Workspace add-ons is here: https://developers.google.com/workspace/add-ons/editors/gsao and here https://developers.google.com/workspace/add-ons/how-tos/building-workspace-addons
- the Slides API guide is here https://developers.google.com/workspace/slides/api/guides/overview and the API reference is here https://developers.google.com/workspace/slides/api/reference/rest
- the Sheets API guide is here and the API reference is here

## Comprehensive Testing Framework

### Testing Strategy Overview
The testing framework will ensure reliability, performance, and correctness across all phases of development:

**Testing Levels:**
1. **Unit Tests** - Individual function validation
2. **Integration Tests** - End-to-end presentation processing  
3. **Performance Tests** - Speed and memory usage benchmarks
4. **User Acceptance Tests** - Real-world scenario validation
5. **Regression Tests** - Ensure new features don't break existing functionality

### Unit Testing Specifications

**Configuration System Tests:**
- YAML parsing and validation
- Schema compliance checking
- Error handling for malformed configurations
- Template reference resolution

**API Integration Tests:**
- Google Slides API request/response validation
- Batch operation optimization verification
- Rate limiting and retry logic testing
- Authentication and authorization flows

**Formatting Logic Tests:**
- Font mapping and replacement accuracy
- Color conversion and application
- Shape and image property modifications
- Chart formatting (local and remote strategies)

### Integration Testing Framework

**End-to-End Test Scenarios:**

1. **Basic Font Swapping Test (Current Test 1)**
   - **Presentation**: `https://docs.google.com/presentation/d/1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA/`
   - **Operations**:
     - Iterate over all objects including notes pages
     - Change "Comic Sans MS" fonts to "Arial"
     - Change "Arial" fonts to "Comic Sans MS"
   - **Validation**: Verify all font changes applied correctly

2. **Comprehensive Object Types Test**
   - **Test Presentation**: Multi-slide presentation with all object types
   - **Objects**: Text boxes, shapes, images, tables, charts, notes
   - **Operations**: Apply complete formatting template
   - **Validation**: Verify each object type formatted according to rules

3. **Large Presentation Performance Test**
   - **Scale**: 50 slides with 20+ objects each
   - **Complexity**: Mixed object types, embedded charts, rich formatting
   - **Requirements**: Complete processing in under 60 seconds
   - **Monitoring**: Memory usage, API call efficiency, error rates

4. **Error Handling and Recovery Test**
   - **Scenarios**: Permission errors, locked objects, API failures
   - **Expected Behavior**: Graceful degradation, detailed error reporting
   - **Validation**: Verify partial completion and accurate error lists

5. **Template Integration Test**
   - **Components**: Reference presentation + YAML configuration
   - **Operations**: Extract template styles, merge with config, apply formatting
   - **Validation**: Ensure template precedence rules work correctly

### Performance Benchmarking

**Performance Metrics:**
- **Processing Speed**: Slides processed per minute
- **API Efficiency**: Requests per operation, batch optimization effectiveness
- **Memory Usage**: Peak memory consumption, garbage collection patterns
- **Error Rate**: Percentage of objects processed successfully

**Benchmark Presentations:**
- **Small**: 5 slides, 10 objects each (baseline test)
- **Medium**: 25 slides, 15 objects each (typical use case)
- **Large**: 50 slides, 20 objects each (maximum supported size)

**Performance Targets:**
- Small presentations: <10 seconds
- Medium presentations: <30 seconds  
- Large presentations: <60 seconds
- Memory usage: <100MB peak
- Success rate: >95% of objects formatted correctly

### Edge Case Testing

**Boundary Conditions:**
- Empty presentations
- Presentations with only master slides
- Objects with no formatting properties
- Circular template references
- Invalid configuration files

**Error Conditions:**
- Network connectivity issues
- API quota exhaustion
- Insufficient permissions
- Corrupted presentation files
- Template accessibility problems

**Recovery Scenarios:**
- Partial processing interruption
- Configuration changes during execution
- Template updates mid-process
- User cancellation at various stages

### Automated Testing Pipeline

**Test Execution Framework:**
- **Test Runner**: Apps Script testing harness
- **Assertion Library**: Custom validation functions for Slides objects
- **Mock Services**: Simulated API responses for unit testing
- **Test Data Management**: Versioned test presentations and configurations

**Continuous Integration:**
- **Trigger**: On code changes and scheduled intervals
- **Environment**: Isolated Google Apps Script projects for testing
- **Reporting**: Detailed test results with performance metrics
- **Alerts**: Notification system for test failures or performance degradation

### Manual Testing Procedures

**User Acceptance Testing:**
- **Real-world Scenarios**: Actual organization presentations
- **User Workflows**: Complete end-to-end user journeys
- **Usability Testing**: Interface responsiveness and error handling
- **Accessibility Testing**: Keyboard navigation and screen reader compatibility

**Regression Testing:**
- **Before Each Release**: Complete test suite execution
- **Feature-specific**: Targeted testing for new functionality
- **Cross-browser**: Ensure compatibility across different browsers and devices

## Data Models and Schemas

### YAML Configuration Schema
The configuration file will follow a strict schema for validation and consistency:

```yaml
# Schema Definition (slider-config-schema.yaml)
$schema: "http://json-schema.org/draft-07/schema#"
type: object
required: ["template", "processing"]
properties:
  template:
    type: object
    required: ["reference_presentation_id"]
    properties:
      reference_presentation_id:
        type: string
        pattern: "^[a-zA-Z0-9_-]+$"
        description: "Google Slides presentation ID for template reference"
      
  fonts:
    type: object
    properties:
      mappings:
        type: array
        items:
          type: object
          required: ["from", "to"]
          properties:
            from: { type: string }
            to: { type: string }
      default_font:
        type: string
        default: "Arial"
        
  colors:
    type: object
    properties:
      brand_primary: { type: string, pattern: "^#[0-9a-fA-F]{6}$" }
      brand_secondary: { type: string, pattern: "^#[0-9a-fA-F]{6}$" }
      text_primary: { type: string, pattern: "^#[0-9a-fA-F]{6}$" }
      text_secondary: { type: string, pattern: "^#[0-9a-fA-F]{6}$" }
      
  shapes:
    type: object
    properties:
      default_stroke_width: { type: number, minimum: 0 }
      default_stroke_color: { type: string, pattern: "^#[0-9a-fA-F]{6}$" }
      
  images:
    type: object
    properties:
      auto_layering: { type: boolean, default: true }
      max_width: { type: number, minimum: 1 }
      max_height: { type: number, minimum: 1 }
      
  charts:
    type: object
    properties:
      strategy: { type: string, enum: ["local", "remote"] }
      default_colors: 
        type: array
        items: { type: string, pattern: "^#[0-9a-fA-F]{6}$" }
        
  processing:
    type: object
    required: ["include_notes"]
    properties:
      include_notes: { type: boolean }
      include_master_slides: { type: boolean, default: false }
      skip_locked_objects: { type: boolean, default: true }
```

### Template Object Model
Internal representation of formatting rules extracted from templates and configurations:

```javascript
// TypeScript-style interface definitions
interface FormattingTemplate {
  id: string;
  version: string;
  metadata: TemplateMetadata;
  rules: FormattingRules;
}

interface TemplateMetadata {
  name: string;
  description: string;
  author: string;
  created: Date;
  lastModified: Date;
  referencePresentation: string;
}

interface FormattingRules {
  fonts: FontRules;
  colors: ColorRules;
  shapes: ShapeRules;
  images: ImageRules;
  tables: TableRules;
  charts: ChartRules;
}

interface FontRules {
  mappings: FontMapping[];
  defaultFont: string;
  defaultSize: number;
  allowedFonts: string[];
}

interface FontMapping {
  from: string;
  to: string;
  preserveSize: boolean;
  preserveWeight: boolean;
  preserveStyle: boolean;
}

interface ColorRules {
  palette: ColorPalette;
  mappings: ColorMapping[];
  fallbackColors: ColorPalette;
}

interface ColorPalette {
  brandPrimary: string;
  brandSecondary: string;
  textPrimary: string;
  textSecondary: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  accent: string[];
}
```

### Processing State Model
Data structures for tracking formatting operations and progress:

```javascript
interface ProcessingSession {
  sessionId: string;
  presentationId: string;
  templateId: string;
  startTime: Date;
  status: ProcessingStatus;
  progress: ProcessingProgress;
  results: ProcessingResults;
  errors: ProcessingError[];
}

interface ProcessingProgress {
  totalSlides: number;
  processedSlides: number;
  totalObjects: number;
  processedObjects: number;
  currentSlide: number;
  currentOperation: string;
  estimatedTimeRemaining?: number;
}

interface ProcessingResults {
  successful: ProcessedObject[];
  failed: ProcessedObject[];
  skipped: ProcessedObject[];
  summary: ResultSummary;
}

interface ProcessedObject {
  slideId: string;
  objectId: string;
  objectType: SlideObjectType;
  operations: AppliedOperation[];
  deepLink: string;
}

interface AppliedOperation {
  type: OperationType;
  property: string;
  oldValue: any;
  newValue: any;
  success: boolean;
  errorMessage?: string;
}

enum ProcessingStatus {
  INITIALIZING = "initializing",
  PROCESSING = "processing", 
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

enum SlideObjectType {
  TEXT = "text",
  SHAPE = "shape", 
  IMAGE = "image",
  TABLE = "table",
  CHART = "chart",
  GROUP = "group",
  LINE = "line"
}

enum OperationType {
  FONT_CHANGE = "font_change",
  COLOR_CHANGE = "color_change",
  SIZE_CHANGE = "size_change",
  POSITION_CHANGE = "position_change",
  STYLE_CHANGE = "style_change"
}
```

### Error Reporting Schema
Structured error information for user feedback and debugging:

```javascript
interface ProcessingError {
  errorId: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  slideId: string;
  objectId?: string;
  message: string;
  userMessage: string;
  deepLink: string;
  suggestedActions: string[];
  technicalDetails: TechnicalErrorDetails;
}

interface TechnicalErrorDetails {
  errorCode: string;
  apiMethod?: string;
  httpStatus?: number;
  stackTrace?: string;
  requestId?: string;
}

enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning", 
  ERROR = "error",
  CRITICAL = "critical"
}

enum ErrorCategory {
  PERMISSION = "permission",
  API_LIMIT = "api_limit",
  NETWORK = "network",
  VALIDATION = "validation",
  FORMATTING = "formatting",
  TEMPLATE = "template",
  CONFIGURATION = "configuration"
}
```

### API Response Models
Standardized response structures for consistent data handling:

```javascript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: ResponseMetadata;
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface ResponseMetadata {
  requestId: string;
  timestamp: Date;
  processingTime: number;
  apiQuotaUsed: number;
  apiQuotaRemaining: number;
}

interface BatchUpdateResponse {
  operations: OperationResult[];
  totalSuccessful: number;
  totalFailed: number;
  presentationRevision: string;
}

interface OperationResult {
  index: number;
  success: boolean;
  objectId?: string;
  error?: ApiError;
}
```

### Configuration Validation Rules
Business logic constraints for configuration validation:

```javascript
interface ValidationRules {
  fonts: {
    maxMappings: number;
    allowedFonts: string[];
    forbiddenFonts: string[];
  };
  colors: {
    requiredPalette: string[];
    maxCustomColors: number;
    contrastRequirements: ContrastRule[];
  };
  performance: {
    maxProcessingTime: number;
    maxObjectsPerSlide: number;
    maxTotalObjects: number;
  };
  security: {
    allowedDomains: string[];
    requiredPermissions: string[];
    dataRetentionPeriod: number;
  };
}

interface ContrastRule {
  foregroundColor: string;
  backgroundColor: string;
  minimumRatio: number;
}
```

## Deployment and Operations

### Deployment Strategy by Phase

**Phase 1: Individual User Deployment**
- **Installation Method**: Manual Apps Script project creation
- **Configuration**: User-provided YAML files and template references
- **Permissions**: Individual OAuth consent for required scopes
- **Distribution**: Shared code repository with setup instructions

**Phase 2-3: Enhanced Individual Deployment**
- **Installation Method**: Apps Script library or add-on marketplace
- **Configuration**: Improved UI for template and config management
- **Permissions**: Streamlined authorization flow
- **Distribution**: Google Workspace Marketplace listing (private/organization)

**Phase 4+: Organization-wide Deployment**
- **Installation Method**: Admin-deployed organization add-on
- **Configuration**: Centrally managed templates and policies
- **Permissions**: Organization-wide consent and role-based access
- **Distribution**: Enterprise deployment through Google Admin Console

### Version Management

**Apps Script Versioning:**
- **Development Versions**: Numbered deployments for testing and staging
- **Release Versions**: Stable versions with semantic versioning (1.0.0, 1.1.0, etc.)
- **Rollback Procedures**: Ability to revert to previous stable versions
- **Change Management**: Detailed changelog and migration guides

**Configuration Versioning:**
- **Schema Evolution**: Backward-compatible YAML schema updates
- **Template Versioning**: Versioned reference presentations with migration paths
- **Deprecation Policies**: Planned obsolescence of old configuration formats

### Operations and Monitoring

**Error Tracking and Logging:**
- **Centralized Logging**: Structured logging for all operations and errors
- **Error Classification**: Categorized error types with severity levels
- **Performance Metrics**: Response times, API usage, success rates
- **User Analytics**: Usage patterns, feature adoption, error frequencies

**Monitoring and Alerting:**
- **System Health**: API quota usage, error rates, performance degradation
- **Usage Monitoring**: Active users, processing volumes, resource consumption
- **Alert Thresholds**: Automated notifications for critical issues
- **Dashboard**: Real-time status dashboard for administrators

**Maintenance and Support:**
- **Regular Updates**: Monthly releases with bug fixes and improvements
- **Security Patches**: Immediate response to security vulnerabilities
- **User Support**: Documentation, FAQ, and support ticket system
- **Training Materials**: User guides, video tutorials, best practices

### Security and Compliance

**Data Protection:**
- **Privacy Policy**: Clear statement of data usage and retention
- **Data Minimization**: Only access necessary presentation data
- **Encryption**: All data transmission over HTTPS/TLS
- **Audit Logging**: Complete audit trail of all formatting operations

**Access Control:**
- **Principle of Least Privilege**: Minimal required permissions
- **Role-based Access**: Different permission levels for users vs admins
- **Permission Scoping**: Granular control over accessible presentations
- **Session Management**: Secure token handling and session expiration

**Compliance Requirements:**
- **GDPR Compliance**: Data subject rights, consent management
- **Enterprise Policies**: Integration with organization security policies
- **Audit Requirements**: Detailed logging for compliance reporting
- **Data Residency**: Respect for regional data storage requirements

### Backup and Recovery

**Data Backup Strategy:**
- **Configuration Backup**: Versioned storage of YAML configurations
- **Template Backup**: Archived copies of reference presentations
- **User Preferences**: Backup of user-specific settings and customizations

**Disaster Recovery:**
- **Service Restoration**: Recovery procedures for Apps Script service outages
- **Data Recovery**: Restoration of configurations and templates
- **Communication Plan**: User notification during service disruptions
- **Business Continuity**: Fallback procedures for critical formatting needs

### Performance Optimization

**Scalability Considerations:**
- **Concurrent Users**: Support for multiple simultaneous users
- **Resource Management**: Efficient memory and CPU usage
- **API Optimization**: Intelligent batching and caching strategies
- **Load Balancing**: Distribution of processing load across instances

**Capacity Planning:**
- **Growth Projections**: Anticipated user base and usage growth
- **Resource Scaling**: Plans for increasing computational resources
- **Cost Management**: Monitoring and optimization of operational costs
- **Performance Baselines**: Established benchmarks for system performance
