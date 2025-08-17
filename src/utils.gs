function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isValidUrl(url) {
  try {
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  } catch (error) {
    return false;
  }
}

function isValidPresentationUrl(url) {
  const presentationPattern = /\/presentation\/d\/([a-zA-Z0-9-_]+)/;
  return presentationPattern.test(url);
}

function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

function formatTimestamp() {
  return new Date().toISOString();
}

function logWithTimestamp(message) {
  Logger.log(`[${formatTimestamp()}] ${message}`);
}

function sanitizeString(str) {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str
    .replace(/[<>]/g, '')
    .trim();
}

function truncateString(str, maxLength) {
  if (typeof str !== 'string') {
    return str;
  }
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - 3) + '...';
}

function createDeepLink(presentationId, slideId) {
  return `https://docs.google.com/presentation/d/${presentationId}/edit#slide=id.${slideId}`;
}

function getErrorContext(error, elementId, slideId) {
  return {
    error: error.toString(),
    elementId: elementId,
    slideId: slideId,
    timestamp: formatTimestamp(),
    deepLink: slideId ? createDeepLink('unknown', slideId) : null
  };
}

function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let attempt = 0;
  
  function executeAttempt() {
    try {
      return fn();
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logWithTimestamp(`Attempt ${attempt} failed, retrying in ${delay}ms: ${error.toString()}`);
      
      Utilities.sleep(delay);
      return executeAttempt();
    }
  }
  
  return executeAttempt();
}

function batchArray(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

function measureExecutionTime(fn) {
  const startTime = Date.now();
  const result = fn();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  return {
    result: result,
    duration: duration,
    formattedDuration: formatDuration(duration)
  };
}

function validateRequiredProperties(obj, requiredProps) {
  const missing = [];
  
  for (const prop of requiredProps) {
    if (!(prop in obj) || obj[prop] === null || obj[prop] === undefined) {
      missing.push(prop);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required properties: ${missing.join(', ')}`);
  }
  
  return true;
}

function safeJsonStringify(obj, space = 2) {
  try {
    return JSON.stringify(obj, null, space);
  } catch (error) {
    return `[JSON Stringify Error: ${error.message}]`;
  }
}

function getMemoryUsage() {
  try {
    return DriveApp.getStorageUsed();
  } catch (error) {
    return 'Unknown';
  }
}

function performanceLog(operation, duration) {
  const message = `Performance: ${operation} completed in ${formatDuration(duration)}`;
  Logger.log(message);
  
  if (duration > 30000) {
    Logger.log(`WARNING: Slow operation detected: ${operation}`);
  }
}

function createProgressTracker(total) {
  return {
    total: total,
    completed: 0,
    
    increment() {
      this.completed++;
      return this.getProgress();
    },
    
    getProgress() {
      return {
        completed: this.completed,
        total: this.total,
        percentage: Math.round((this.completed / this.total) * 100),
        remaining: this.total - this.completed
      };
    },
    
    isComplete() {
      return this.completed >= this.total;
    }
  };
}

function logConfigurationSummary(config) {
  Logger.log('=== Configuration Summary ===');
  Logger.log(`Font mappings: ${Object.keys(config.fontMappings).length}`);
  Logger.log(`Process notes: ${config.processNotes}`);
  Logger.log(`Skip errors: ${config.skipErrors}`);
  Logger.log(`Batch size: ${config.batchSize}`);
  Logger.log(`API retries: ${config.apiRetries}`);
  Logger.log(`API retry delay: ${config.apiRetryDelay}ms`);
  Logger.log('============================');
}

function generateSessionId() {
  return Utilities.getUuid().substring(0, 8);
}