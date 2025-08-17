class SlidesApiClient {
  constructor(config) {
    this.config = config;
    this.retryCount = config.apiRetries || 3;
    this.retryDelay = config.apiRetryDelay || 1000;
  }
  
  getPresentation(presentationId) {
    return this.withRetry(() => {
      return Slides.Presentations.get(presentationId);
    });
  }
  
  getSlide(presentationId, slideId) {
    return this.withRetry(() => {
      return Slides.Presentations.Pages.get(presentationId, slideId);
    });
  }
  
  batchUpdate(presentationId, requests) {
    if (!requests || requests.length === 0) {
      return { replies: [] };
    }
    
    return this.withRetry(() => {
      const requestBody = {
        requests: requests
      };
      
      Logger.log(`Executing batch update with ${requests.length} requests`);
      const response = Slides.Presentations.batchUpdate(requestBody, presentationId);
      Logger.log(`Batch update completed successfully`);
      return response;
    });
  }
  
  withRetry(apiCall) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return apiCall();
      } catch (error) {
        lastError = error;
        Logger.log(`API call failed (attempt ${attempt}/${this.retryCount}): ${error.toString()}`);
        
        if (attempt < this.retryCount) {
          if (this.isRetryableError(error)) {
            Logger.log(`Retrying in ${this.retryDelay}ms...`);
            Utilities.sleep(this.retryDelay);
          } else {
            Logger.log('Non-retryable error, throwing immediately');
            throw error;
          }
        }
      }
    }
    
    throw new Error(`API call failed after ${this.retryCount} attempts. Last error: ${lastError.toString()}`);
  }
  
  isRetryableError(error) {
    const errorString = error.toString().toLowerCase();
    
    const retryableErrors = [
      'service invoked too many times',
      'rate limit exceeded',
      'quota exceeded',
      'internal error',
      'backend error',
      'temporarily unavailable',
      'timeout'
    ];
    
    return retryableErrors.some(retryableError => errorString.includes(retryableError));
  }
  
  getAllSlides(presentationId) {
    const presentation = this.getPresentation(presentationId);
    const slides = [];
    
    if (presentation.slides) {
      for (const slide of presentation.slides) {
        slides.push({
          slideId: slide.objectId,
          slideIndex: slides.length,
          slide: slide
        });
      }
    }
    
    return slides;
  }
  
  getAllPageElements(presentationId) {
    const slides = this.getAllSlides(presentationId);
    const allElements = [];
    
    for (const slideInfo of slides) {
      const slide = slideInfo.slide;
      
      if (slide.pageElements) {
        for (const element of slide.pageElements) {
          allElements.push({
            slideId: slideInfo.slideId,
            slideIndex: slideInfo.slideIndex,
            elementId: element.objectId,
            element: element,
            elementType: this.getElementType(element)
          });
        }
      }
      
      if (this.config.processNotes && slide.slideProperties && slide.slideProperties.notesPage) {
        const notesPage = slide.slideProperties.notesPage;
        if (notesPage.pageElements) {
          for (const element of notesPage.pageElements) {
            allElements.push({
              slideId: slideInfo.slideId,
              slideIndex: slideInfo.slideIndex,
              elementId: element.objectId,
              element: element,
              elementType: this.getElementType(element),
              isNotesPage: true
            });
          }
        }
      }
    }
    
    return allElements;
  }
  
  getElementType(element) {
    if (element.shape) return 'shape';
    if (element.table) return 'table';
    if (element.image) return 'image';
    if (element.video) return 'video';
    if (element.line) return 'line';
    if (element.wordArt) return 'wordArt';
    if (element.sheetsChart) return 'sheetsChart';
    return 'unknown';
  }
  
  getTextElements(pageElements) {
    return pageElements.filter(elementInfo => {
      const element = elementInfo.element;
      return element.shape && element.shape.text && element.shape.text.textElements;
    });
  }
  
  getTableElements(pageElements) {
    return pageElements.filter(elementInfo => {
      const element = elementInfo.element;
      return element.table && element.table.tableRows;
    });
  }
}