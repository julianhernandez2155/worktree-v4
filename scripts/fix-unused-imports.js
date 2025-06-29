#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript errors
const errors = execSync('npm run typecheck 2>&1 || true', { encoding: 'utf8' });

// Parse unused import errors
const unusedImportErrors = errors
  .split('\n')
  .filter(line => line.includes('error TS6133'))
  .map(line => {
    const match = line.match(/(.+?)\((\d+),\d+\): error TS6133: '(.+?)' is declared but its value is never read\./);
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2]),
        import: match[3]
      };
    }
    return null;
  })
  .filter(Boolean);

// Group by file
const fileGroups = {};
unusedImportErrors.forEach(error => {
  if (!fileGroups[error.file]) {
    fileGroups[error.file] = [];
  }
  fileGroups[error.file].push(error);
});

// Process each file
Object.entries(fileGroups).forEach(([filePath, errors]) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Sort errors by line number in reverse order
    errors.sort((a, b) => b.line - a.line);
    
    errors.forEach(error => {
      const lines = content.split('\n');
      const lineIndex = error.line - 1;
      
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Handle different import patterns
        if (line.includes('{') && line.includes('}')) {
          // Named imports
          const beforeBrace = line.substring(0, line.indexOf('{'));
          const afterBrace = line.substring(line.indexOf('}') + 1);
          const imports = line.substring(line.indexOf('{') + 1, line.indexOf('}')).split(',').map(i => i.trim());
          
          const filteredImports = imports.filter(imp => {
            const importName = imp.includes(' as ') ? imp.split(' as ')[1].trim() : imp.trim();
            return importName !== error.import;
          });
          
          if (filteredImports.length === 0) {
            // Remove entire line
            lines.splice(lineIndex, 1);
          } else {
            // Update line
            lines[lineIndex] = `${beforeBrace}{ ${filteredImports.join(', ')} }${afterBrace}`;
          }
        } else if (line.match(new RegExp(`^\\s*${error.import}\\s*[:,]?\\s*$`))) {
          // Standalone variable declaration
          lines.splice(lineIndex, 1);
        }
        
        content = lines.join('\n');
      }
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${errors.length} unused imports in ${filePath}`);
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
});

console.log(`\nProcessed ${Object.keys(fileGroups).length} files`);