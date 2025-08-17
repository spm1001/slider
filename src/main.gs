function onOpen() {
  createMenu();
}

function createMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Slide Formatter')
    .addItem('Format Presentation', 'formatPresentation')
    .addItem('Settings', 'showSettings')
    .addToUi();
}

function formatPresentation() {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Format Presentation',
      'Enter the Google Slides presentation URL:',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() === ui.Button.OK) {
      const presentationUrl = response.getResponseText().trim();
      
      if (!presentationUrl) {
        ui.alert('Error', 'Please enter a valid presentation URL.', ui.ButtonSet.OK);
        return;
      }
      
      const presentationId = extractPresentationId(presentationUrl);
      if (!presentationId) {
        ui.alert('Error', 'Invalid presentation URL format.', ui.ButtonSet.OK);
        return;
      }
      
      showProgressDialog();
      
      processPresentation(presentationId);
      
      ui.alert('Success', 'Presentation formatting completed!', ui.ButtonSet.OK);
    }
  } catch (error) {
    Logger.log('Error in formatPresentation: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error', 'An error occurred: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function processPresentation(presentationId) {
  const config = getConfigWithPersistedToggleMode(presentationId);
  const formatter = new SlideFormatter(config);
  return formatter.formatPresentation(presentationId);
}

function extractPresentationId(url) {
  const regex = /\/presentation\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function testFontSwap() {
  const testPresentationId = '1_WxqIvBQ2ArGjUqamVhVYKdAie5YrEgXmmUFMgNNpPA';
  
  try {
    Logger.log('Starting font swap test...');
    const result = processPresentation(testPresentationId);
    Logger.log('Font swap test completed successfully');
    Logger.log('Results: ' + JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log('Font swap test failed: ' + error.toString());
    throw error;
  }
}

function simpleTest() {
  return {
    message: 'Hello from Apps Script!',
    timestamp: new Date().toISOString(),
    success: true
  };
}