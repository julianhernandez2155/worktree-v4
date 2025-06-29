#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Get all TypeScript errors
const errors = execSync('npm run typecheck 2>&1 || true', { encoding: 'utf8' });

// Parse unused parameter errors
const unusedParamErrors = errors
  .split('\n')
  .filter(line => line.includes('error TS6133') && line.includes('is declared but its value is never read'))
  .map(line => {
    const match = line.match(/(.+?)\((\d+),(\d+)\): error TS6133: '(.+?)' is declared but its value is never read\./);
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        param: match[4]
      };
    }
    return null;
  })
  .filter(Boolean);

// Group by file
const fileGroups = {};
unusedParamErrors.forEach(error => {
  if (!fileGroups[error.file]) {
    fileGroups[error.file] = [];
  }
  fileGroups[error.file].push(error);
});

// Process each file
Object.entries(fileGroups).forEach(([filePath, errors]) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Sort errors by line and column in reverse order
    errors.sort((a, b) => {
      if (b.line !== a.line) return b.line - a.line;
      return b.column - a.column;
    });
    
    errors.forEach(error => {
      const lineIndex = error.line - 1;
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Check if it's a function parameter
        if (line.includes(error.param)) {
          // Simple replacement - prefix with underscore if not already
          if (!error.param.startsWith('_')) {
            lines[lineIndex] = line.replace(
              new RegExp(`\\b${error.param}\\b`, 'g'),
              `_${error.param}`
            );
          }
        }
      }
    });
    
    content = lines.join('\n');
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${errors.length} unused parameters in ${filePath}`);
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
});

console.log(`\nProcessed ${Object.keys(fileGroups).length} files`);