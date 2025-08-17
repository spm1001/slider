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
      
      // Universal font toggle logic
      if (this.config.universalToggle) {
        const discoveredFonts = this.discoverAllFonts(textElements, tableElements);
        Logger.log(`Font discovery complete. Found ${discoveredFonts.length} unique fonts`);
        
        // Create universal mappings based on current toggle mode
        const universalMappings = createUniversalFontMappings(discoveredFonts, this.config.toggleMode);
        
        // Toggle the mode for next run BEFORE processing
        const nextMode = (this.config.toggleMode === 'to_comic_sans') ? 'to_arial' : 'to_comic_sans';
        Logger.log(`Toggle mode will switch to: ${nextMode} for next run`);
        
        // Persist the next toggle mode for future runs
        persistToggleMode(presentationId, nextMode);
        
        // Replace the config font mappings with universal ones
        this.config.fontMappings = universalMappings;
        Logger.log(`Switched to universal font mappings: ${Object.keys(universalMappings).length} mappings created`);
      }
      
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
        } else {
          // Handle elements with no fontFamily (default font)
          const defaultNewFont = this.config.fontMappings['DEFAULT_FONT'];
          if (defaultNewFont) {
            fontsFound.add('DEFAULT_FONT');
            const request = {
              updateTextStyle: {
                objectId: elementInfo.elementId,
                fields: 'fontFamily',
                style: {
                  fontFamily: defaultNewFont
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
              fromFont: 'Arial (default)',
              toFont: defaultNewFont,
              isNotesPage: elementInfo.isNotesPage || false
            });
            
            Logger.log(`Default font change: Arial (default) → ${defaultNewFont} in element ${elementInfo.elementId}`);
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
  
  discoverAllFonts(textElements, tableElements) {
    const discoveredFonts = new Set();
    
    Logger.log(`Starting font discovery across ${textElements.length} text elements and ${tableElements.length} table elements`);
    
    // Discover fonts in text elements
    for (const elementInfo of textElements) {
      const shape = elementInfo.element.shape;
      
      // DIAGNOSTIC: Log complete element structure
      Logger.log(`=== Element ${elementInfo.elementId} Analysis ===`);
      Logger.log(`Has shape.text: ${!!shape.text}`);
      
      if (shape.text) {
        Logger.log(`Text elements count: ${shape.text.textElements ? shape.text.textElements.length : 0}`);
        Logger.log(`Text structure: ${JSON.stringify(shape.text, null, 2)}`);
        
        if (shape.text.textElements) {
          for (let i = 0; i < shape.text.textElements.length; i++) {
            const textElement = shape.text.textElements[i];
            Logger.log(`  TextElement[${i}]: hasTextRun=${!!textElement.textRun}, hasStyle=${!!(textElement.textRun && textElement.textRun.style)}`);
            
            if (textElement.textRun && textElement.textRun.style) {
              const style = textElement.textRun.style;
              Logger.log(`  Style properties: ${JSON.stringify(Object.keys(style))}`);
              Logger.log(`  FontFamily: ${style.fontFamily || 'UNDEFINED'}`);
              
              if (style.fontFamily) {
                const font = style.fontFamily;
                discoveredFonts.add(font);
                Logger.log(`  ✅ Discovered font: ${font}`);
              } else {
                Logger.log(`  ℹ️ No fontFamily (default font) - will use DEFAULT_FONT mapping`);
              }
            } else {
              Logger.log(`  ⚠️ Missing textRun or style`);
            }
          }
        } else {
          Logger.log(`  ⚠️ No textElements array`);
        }
      } else {
        Logger.log(`  ⚠️ No shape.text property`);
      }
      Logger.log(`=== End Element ${elementInfo.elementId} ===`);
    }
    
    // Discover fonts in table elements
    for (const elementInfo of tableElements) {
      const table = elementInfo.element.table;
      for (let rowIndex = 0; rowIndex < table.tableRows.length; rowIndex++) {
        const row = table.tableRows[rowIndex];
        for (let colIndex = 0; colIndex < row.tableCells.length; colIndex++) {
          const cell = row.tableCells[colIndex];
          if (cell.text && cell.text.textElements) {
            for (const textElement of cell.text.textElements) {
              if (textElement.textRun && textElement.textRun.style && textElement.textRun.style.fontFamily) {
                const font = textElement.textRun.style.fontFamily;
                discoveredFonts.add(font);
                Logger.log(`Discovered font in table ${elementInfo.elementId} [${rowIndex},${colIndex}]: ${font}`);
              }
            }
          }
        }
      }
    }
    
    const fontsArray = Array.from(discoveredFonts).sort();
    Logger.log(`Font discovery summary: Found ${fontsArray.length} unique fonts: [${fontsArray.join(', ')}]`);
    return fontsArray;
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