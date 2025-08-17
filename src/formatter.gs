class SlideFormatter {
  constructor(config) {
    this.config = config;
    this.apiClient = new SlidesApiClient(config);
    this.results = {
      totalElements: 0,
      processedElements: 0,
      errors: [],
      fontChanges: []
    };
  }
  
  formatPresentation(presentationId) {
    Logger.log(`Starting presentation formatting for ID: ${presentationId}`);
    
    try {
      const pageElements = this.apiClient.getAllPageElements(presentationId);
      Logger.log(`Found ${pageElements.length} page elements to process`);
      
      // Enhanced diagnostic logging
      this.logElementTypes(pageElements);
      
      this.results.totalElements = pageElements.length;
      
      const textElements = this.apiClient.getTextElements(pageElements);
      const tableElements = this.apiClient.getTableElements(pageElements);
      
      Logger.log(`Found ${textElements.length} text elements and ${tableElements.length} table elements`);
      
      this.processTextElements(presentationId, textElements);
      this.processTableElements(presentationId, tableElements);
      
      Logger.log('Presentation formatting completed');
      Logger.log(`Results: ${this.results.processedElements}/${this.results.totalElements} elements processed`);
      Logger.log(`Font changes made: ${this.results.fontChanges.length}`);
      Logger.log(`Errors encountered: ${this.results.errors.length}`);
      
      return this.results;
    } catch (error) {
      Logger.log(`Error formatting presentation: ${error.toString()}`);
      this.results.errors.push({
        elementId: 'presentation',
        error: error.toString(),
        location: 'Presentation level'
      });
      throw error;
    }
  }
  
  logElementTypes(pageElements) {
    const elementTypes = {};
    pageElements.forEach((elementInfo, index) => {
      const element = elementInfo.element;
      let type = 'unknown';
      
      if (element.shape) {
        if (element.shape.text) type = 'shape_with_text';
        else type = 'shape_no_text';
      } else if (element.table) {
        type = 'table';
      } else if (element.image) {
        type = 'image';
      } else if (element.video) {
        type = 'video';
      } else if (element.line) {
        type = 'line';
      }
      
      elementTypes[type] = (elementTypes[type] || 0) + 1;
      
      // Log details for first few elements
      if (index < 3) {
        Logger.log(`Element ${index}: type=${type}, id=${element.objectId}, shape=${!!element.shape}, text=${!!(element.shape && element.shape.text)}`);
      }
    });
    
    Logger.log(`Element type breakdown: ${JSON.stringify(elementTypes)}`);
  }
  
  processTextElements(presentationId, textElements) {
    Logger.log(`Processing ${textElements.length} text elements`);
    
    const batches = this.createBatches(textElements, this.config.batchSize);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      Logger.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} elements`);
      
      try {
        this.processBatch(presentationId, batch);
      } catch (error) {
        if (this.config.skipErrors) {
          Logger.log(`Batch ${batchIndex + 1} failed, skipping: ${error.toString()}`);
          this.results.errors.push({
            batch: batchIndex + 1,
            error: error.toString(),
            location: 'Batch processing'
          });
        } else {
          throw error;
        }
      }
    }
  }
  
  processTableElements(presentationId, tableElements) {
    Logger.log(`Processing ${tableElements.length} table elements`);
    
    for (const elementInfo of tableElements) {
      try {
        this.processTableElement(presentationId, elementInfo);
      } catch (error) {
        if (this.config.skipErrors) {
          Logger.log(`Table element ${elementInfo.elementId} failed, skipping: ${error.toString()}`);
          this.results.errors.push({
            elementId: elementInfo.elementId,
            slideId: elementInfo.slideId,
            error: error.toString(),
            location: `Slide ${elementInfo.slideIndex + 1}`
          });
        } else {
          throw error;
        }
      }
    }
  }
  
  processBatch(presentationId, batch) {
    const requests = [];
    
    for (const elementInfo of batch) {
      try {
        const elementRequests = this.generateTextStyleRequests(elementInfo);
        requests.push(...elementRequests);
        this.results.processedElements++;
      } catch (error) {
        if (this.config.skipErrors) {
          Logger.log(`Element ${elementInfo.elementId} failed, skipping: ${error.toString()}`);
          this.results.errors.push({
            elementId: elementInfo.elementId,
            slideId: elementInfo.slideId,
            error: error.toString(),
            location: `Slide ${elementInfo.slideIndex + 1}`
          });
        } else {
          throw error;
        }
      }
    }
    
    if (requests.length > 0) {
      this.apiClient.batchUpdate(presentationId, requests);
    }
  }
  
  processTableElement(presentationId, elementInfo) {
    const table = elementInfo.element.table;
    const requests = [];
    
    for (let rowIndex = 0; rowIndex < table.tableRows.length; rowIndex++) {
      const row = table.tableRows[rowIndex];
      
      for (let colIndex = 0; colIndex < row.tableCells.length; colIndex++) {
        const cell = row.tableCells[colIndex];
        
        if (cell.text && cell.text.textElements) {
          const cellRequests = this.generateTableCellTextStyleRequests(
            elementInfo.elementId,
            rowIndex,
            colIndex,
            cell.text.textElements
          );
          requests.push(...cellRequests);
        }
      }
    }
    
    if (requests.length > 0) {
      this.apiClient.batchUpdate(presentationId, requests);
    }
    
    this.results.processedElements++;
  }
  
  generateTextStyleRequests(elementInfo) {
    const requests = [];
    const shape = elementInfo.element.shape;
    
    if (!shape.text || !shape.text.textElements) {
      return requests;
    }
    
    const textElements = shape.text.textElements;
    const fontsFound = new Set();
    
    for (const textElement of textElements) {
      if (textElement.textRun && textElement.textRun.style) {
        const style = textElement.textRun.style;
        
        if (style.fontFamily) {
          const currentFont = style.fontFamily;
          fontsFound.add(currentFont);
          const newFont = this.config.fontMappings[currentFont];
          
          if (newFont && newFont !== currentFont) {
            const request = {
              updateTextStyle: {
                objectId: elementInfo.elementId,
                fields: 'fontFamily',
                style: {
                  fontFamily: newFont
                },
                textRange: {
                  type: 'ALL'
                }
              }
            };
            
            requests.push(request);
            
            this.results.fontChanges.push({
              elementId: elementInfo.elementId,
              slideId: elementInfo.slideId,
              slideIndex: elementInfo.slideIndex,
              fromFont: currentFont,
              toFont: newFont,
              isNotesPage: elementInfo.isNotesPage || false
            });
            
            Logger.log(`Font change: ${currentFont} → ${newFont} in element ${elementInfo.elementId}`);
          }
        }
      }
    }
    
    // Log fonts found in this element
    if (fontsFound.size > 0) {
      Logger.log(`Element ${elementInfo.elementId} fonts: [${Array.from(fontsFound).join(', ')}]`);
    }
    
    return requests;
  }
  
  generateTableCellTextStyleRequests(tableId, rowIndex, colIndex, textElements) {
    const requests = [];
    
    for (const textElement of textElements) {
      if (textElement.textRun && textElement.textRun.style) {
        const style = textElement.textRun.style;
        
        if (style.fontFamily) {
          const currentFont = style.fontFamily;
          const newFont = this.config.fontMappings[currentFont];
          
          if (newFont && newFont !== currentFont) {
            const request = {
              updateTextStyle: {
                objectId: tableId,
                fields: 'fontFamily',
                style: {
                  fontFamily: newFont
                },
                textRange: {
                  type: 'ALL'
                },
                cellLocation: {
                  rowIndex: rowIndex,
                  columnIndex: colIndex
                }
              }
            };
            
            requests.push(request);
            
            this.results.fontChanges.push({
              elementId: tableId,
              cellLocation: `Row ${rowIndex + 1}, Col ${colIndex + 1}`,
              fromFont: currentFont,
              toFont: newFont
            });
            
            Logger.log(`Table font change: ${currentFont} → ${newFont} in table ${tableId} cell [${rowIndex},${colIndex}]`);
          }
        }
      }
    }
    
    return requests;
  }
  
  createBatches(items, batchSize) {
    const batches = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  generateErrorReport() {
    if (this.results.errors.length === 0) {
      return 'No errors encountered during processing.';
    }
    
    let report = `Error Report (${this.results.errors.length} errors):\n\n`;
    
    for (let i = 0; i < this.results.errors.length; i++) {
      const error = this.results.errors[i];
      report += `${i + 1}. ${error.location}\n`;
      report += `   Element: ${error.elementId || 'N/A'}\n`;
      if (error.slideId) {
        report += `   Slide: ${error.slideId}\n`;
      }
      report += `   Error: ${error.error}\n\n`;
    }
    
    return report;
  }
  
  generateSuccessReport() {
    let report = `Formatting Results:\n\n`;
    report += `Total Elements: ${this.results.totalElements}\n`;
    report += `Processed Elements: ${this.results.processedElements}\n`;
    report += `Font Changes: ${this.results.fontChanges.length}\n`;
    report += `Errors: ${this.results.errors.length}\n\n`;
    
    if (this.results.fontChanges.length > 0) {
      report += `Font Changes Made:\n`;
      for (const change of this.results.fontChanges) {
        report += `- ${change.fromFont} → ${change.toFont}`;
        if (change.cellLocation) {
          report += ` (${change.cellLocation})`;
        }
        if (change.isNotesPage) {
          report += ` [Notes Page]`;
        }
        report += `\n`;
      }
    }
    
    return report;
  }
}