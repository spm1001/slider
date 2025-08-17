# Google Apps Script Deployment Guide

## Quick Setup Instructions

### 1. Create New Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "Slide Formatter"

### 2. Enable Required APIs
1. In your Apps Script project, click "Services" (+ icon) on the left sidebar
2. Add these services:
   - **Google Slides API** (version v1)
   - **Google Drive API** (version v2)
   - **Google Sheets API** (version v4)

### 3. Add Project Files
Replace the default `Code.gs` file and add these files:

1. **main.gs** - Copy content from `/home/modha/slider/main.gs`
2. **config.gs** - Copy content from `/home/modha/slider/config.gs`
3. **slides-api.gs** - Copy content from `/home/modha/slider/slides-api.gs`
4. **formatter.gs** - Copy content from `/home/modha/slider/formatter.gs`
5. **ui.gs** - Copy content from `/home/modha/slider/ui.gs`
6. **utils.gs** - Copy content from `/home/modha/slider/utils.gs`
7. **constants.gs** - Copy content from `/home/modha/slider/constants.gs`

### 4. Test the Installation

#### Run Font Swap Test
1. In Apps Script editor, select function `testFontSwap`
2. Click "Run" (you'll need to authorize the first time)
3. Check the "Execution transcript" for results

#### Test the UI
1. Create or open any Google Sheets document
2. Refresh the page
3. You should see "Slide Formatter" menu appear
4. Click "Slide Formatter" → "Settings" to open configuration

### 5. Authorization Setup
When you first run the script, you'll need to authorize these permissions:
- **Google Slides**: Read and modify presentations
- **Google Drive**: Read access to files
- **Google Sheets**: Read and modify spreadsheets

## Usage Instructions

### Basic Font Swapping
1. Open any Google Sheets document
2. Go to "Slide Formatter" menu → "Format Presentation"
3. Enter your Google Slides URL: `https://docs.google.com/presentation/d/YOUR_PRESENTATION_ID/edit`
4. Click OK and wait for processing

### Custom Configuration
1. Go to "Slide Formatter" menu → "Settings"
2. Edit the YAML configuration:
```yaml
fontMappings:
  - "Comic Sans MS": "Arial"
  - "Arial": "Comic Sans MS"
  - "Times New Roman": "Helvetica"

processNotes: true
skipErrors: true
batchSize: 50
apiRetries: 3
apiRetryDelay: 1000
```
3. Click "Save Configuration"

## Test Case

**Primary Test Presentation**: `https://docs.google.com/presentation/d/1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA/`

**Expected Behavior**:
- All "Comic Sans MS" fonts → "Arial"
- All "Arial" fonts → "Comic Sans MS"
- Process all slides including notes pages
- Complete in under 60 seconds
- Generate detailed success/error report

## Troubleshooting

### Common Issues

1. **"Service invoked too many times"**
   - Reduce `batchSize` in configuration (try 25)
   - Increase `apiRetryDelay` (try 2000)

2. **"Permission denied"**
   - Ensure presentation is accessible to your account
   - Check if presentation is in "Suggesting" mode

3. **"Invalid presentation URL"**
   - Use full Google Slides URL
   - Ensure URL contains `/presentation/d/PRESENTATION_ID/`

### Advanced Configuration

#### Custom Font Mappings
```yaml
fontMappings:
  - "Calibri": "Helvetica"
  - "Times New Roman": "Georgia"
  - "Courier New": "Monaco"
```

#### Performance Tuning
```yaml
batchSize: 25          # Smaller batches for large presentations
apiRetries: 5          # More retries for unstable connections
apiRetryDelay: 2000    # Longer delays between retries
```

## Architecture Overview

### File Structure
- **main.gs**: Entry point, menu creation, orchestration
- **config.gs**: YAML parsing, validation, configuration management
- **slides-api.gs**: Google Slides API wrapper with retry logic
- **formatter.gs**: Core formatting logic, batch processing
- **ui.gs**: User interface, progress dialogs, settings
- **utils.gs**: Utility functions, logging, performance tracking
- **constants.gs**: API scopes, element types, default settings

### Processing Flow
1. **Input**: User provides presentation URL
2. **Analysis**: Retrieve all slides and page elements
3. **Processing**: Apply font mappings in batches
4. **Reporting**: Generate success/error summary

### Error Handling
- **Skip Errors**: Continue processing when individual elements fail
- **Retry Logic**: Automatic retry with exponential backoff
- **Deep Links**: Direct links to problematic slides
- **Graceful Degradation**: Partial completion when possible

## Performance Characteristics

- **Capacity**: 50+ slides, 20+ objects per slide
- **Speed**: <60 seconds for typical presentations
- **Memory**: <100MB peak usage
- **Success Rate**: >95% of objects processed correctly
- **API Efficiency**: Intelligent batching, rate limiting

## Support

For issues or questions:
1. Check the execution transcript in Apps Script editor
2. Review error messages in the Settings dialog
3. Test with the provided test presentation first
4. Ensure all required APIs are enabled

## Next Steps

Once basic font swapping is working:
1. **Phase 2**: Template-based formatting
2. **Phase 3**: Multi-component UI with feature selection
3. **Phase 4**: Google Sheets chart formatting
4. **Phase 5**: External configuration database
5. **Phase 6**: Google Cloud Platform integration