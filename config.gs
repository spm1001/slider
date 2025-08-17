function getDefaultConfig() {
  return {
    fontMappings: {
      'Comic Sans MS': 'Arial',
      'Arial': 'Comic Sans MS'
    },
    processNotes: true,
    skipErrors: true,
    batchSize: 50,
    apiRetries: 3,
    apiRetryDelay: 1000
  };
}

function parseYamlConfig(yamlString) {
  try {
    const config = parseSimpleYaml(yamlString);
    validateConfig(config);
    return config;
  } catch (error) {
    throw new Error('Invalid YAML configuration: ' + error.message);
  }
}

function parseSimpleYaml(yamlString) {
  const lines = yamlString.split('\n');
  const config = {
    fontMappings: {},
    processNotes: true,
    skipErrors: true,
    batchSize: 50,
    apiRetries: 3,
    apiRetryDelay: 1000
  };
  
  let currentSection = null;
  let inFontMappings = false;
  
  for (let line of lines) {
    line = line.trim();
    
    if (line.startsWith('#') || line === '') {
      continue;
    }
    
    if (line === 'fontMappings:') {
      inFontMappings = true;
      continue;
    }
    
    if (line.match(/^[a-zA-Z]/)) {
      inFontMappings = false;
    }
    
    if (inFontMappings && line.startsWith('-')) {
      const mapping = line.substring(1).trim();
      const parts = mapping.split(':');
      if (parts.length === 2) {
        const from = parts[0].trim().replace(/['"]/g, '');
        const to = parts[1].trim().replace(/['"]/g, '');
        config.fontMappings[from] = to;
      }
    } else {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        switch (key) {
          case 'processNotes':
            config.processNotes = value === 'true';
            break;
          case 'skipErrors':
            config.skipErrors = value === 'true';
            break;
          case 'batchSize':
            config.batchSize = parseInt(value) || 50;
            break;
          case 'apiRetries':
            config.apiRetries = parseInt(value) || 3;
            break;
          case 'apiRetryDelay':
            config.apiRetryDelay = parseInt(value) || 1000;
            break;
        }
      }
    }
  }
  
  return config;
}

function validateConfig(config) {
  if (!config) {
    throw new Error('Configuration is null or undefined');
  }
  
  if (!config.fontMappings || typeof config.fontMappings !== 'object') {
    throw new Error('fontMappings must be an object');
  }
  
  if (Object.keys(config.fontMappings).length === 0) {
    throw new Error('fontMappings cannot be empty');
  }
  
  if (typeof config.processNotes !== 'boolean') {
    throw new Error('processNotes must be a boolean');
  }
  
  if (typeof config.skipErrors !== 'boolean') {
    throw new Error('skipErrors must be a boolean');
  }
  
  if (!Number.isInteger(config.batchSize) || config.batchSize < 1 || config.batchSize > 100) {
    throw new Error('batchSize must be an integer between 1 and 100');
  }
  
  if (!Number.isInteger(config.apiRetries) || config.apiRetries < 1 || config.apiRetries > 10) {
    throw new Error('apiRetries must be an integer between 1 and 10');
  }
  
  if (!Number.isInteger(config.apiRetryDelay) || config.apiRetryDelay < 100) {
    throw new Error('apiRetryDelay must be an integer >= 100 milliseconds');
  }
  
  return true;
}

function getConfigFromSheet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    if (!sheet) {
      return getDefaultConfig();
    }
    
    const yamlRange = sheet.getRange('B1');
    const yamlString = yamlRange.getValue();
    
    if (!yamlString || yamlString.trim() === '') {
      return getDefaultConfig();
    }
    
    return parseYamlConfig(yamlString);
  } catch (error) {
    Logger.log('Error loading config from sheet: ' + error.toString());
    return getDefaultConfig();
  }
}

function saveConfigToSheet(config) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config') || 
                  SpreadsheetApp.getActiveSpreadsheet().insertSheet('Config');
    
    const yamlString = configToYaml(config);
    sheet.getRange('A1').setValue('Configuration (YAML):');
    sheet.getRange('B1').setValue(yamlString);
    
    return true;
  } catch (error) {
    Logger.log('Error saving config to sheet: ' + error.toString());
    return false;
  }
}

function configToYaml(config) {
  let yaml = '';
  yaml += 'fontMappings:\n';
  
  for (const [from, to] of Object.entries(config.fontMappings)) {
    yaml += `  - "${from}": "${to}"\n`;
  }
  
  yaml += `\nprocessNotes: ${config.processNotes}\n`;
  yaml += `skipErrors: ${config.skipErrors}\n`;
  yaml += `batchSize: ${config.batchSize}\n`;
  yaml += `apiRetries: ${config.apiRetries}\n`;
  yaml += `apiRetryDelay: ${config.apiRetryDelay}\n`;
  
  return yaml;
}