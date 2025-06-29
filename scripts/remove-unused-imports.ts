#!/usr/bin/env ts-node

import * as fs from 'fs';

interface UnusedImport {
  file: string;
  line: number;
  import: string;
}

// Parse the TypeScript errors to find unused imports
const parseUnusedImports = (output: string): UnusedImport[] => {
  const lines = output.split('\n');
  const unusedImports: UnusedImport[] = [];
  
  for (const line of lines) {
    // Match pattern: file.tsx(line,col): error TS6133: 'import' is declared but its value is never read.
    const match = line.match(/^(.+?)\((\d+),\d+\): error TS6133: '(.+?)' is declared but its value is never read\.$/);
    if (match && match[1] && match[2] && match[3]) {
      unusedImports.push({
        file: match[1],
        line: parseInt(match[2]),
        import: match[3]
      });
    }
  }
  
  return unusedImports;
};

// Remove specific import from an import statement
const removeImportFromLine = (line: string, importToRemove: string): string | null => {
  // Handle named imports
  if (line.includes('{') && line.includes('}')) {
    const beforeBrace = line.substring(0, line.indexOf('{'));
    const afterBrace = line.substring(line.indexOf('}') + 1);
    const imports = line.substring(line.indexOf('{') + 1, line.indexOf('}')).split(',').map(i => i.trim());
    
    // Remove the specific import
    const filteredImports = imports.filter(imp => {
      // Handle aliased imports (e.g., "motion as m")
      const importName = imp.includes(' as ') ? imp.split(' as ')[1]?.trim() ?? imp.trim() : imp.trim();
      return importName !== importToRemove;
    });
    
    if (filteredImports.length === 0) {
      // If no imports left, remove the entire line
      return null;
    }
    
    // Reconstruct the import line
    return `${beforeBrace}{ ${filteredImports.join(', ')} }${afterBrace}`;
  }
  
  // Handle default imports
  if (line.match(new RegExp(`import\\s+${importToRemove}\\s+from`))) {
    return null;
  }
  
  // Handle namespace imports
  if (line.match(new RegExp(`import\\s+\\*\\s+as\\s+${importToRemove}\\s+from`))) {
    return null;
  }
  
  return line;
};

// Group imports by file
const groupByFile = (imports: UnusedImport[]): Map<string, UnusedImport[]> => {
  const grouped = new Map<string, UnusedImport[]>();
  
  for (const imp of imports) {
    if (!grouped.has(imp.file)) {
      grouped.set(imp.file, []);
    }
    grouped.get(imp.file)!.push(imp);
  }
  
  // Sort by line number in descending order (to process from bottom to top)
  for (const [file, imps] of grouped.entries()) {
    grouped.set(file, imps.sort((a, b) => b.line - a.line));
  }
  
  return grouped;
};

// Process a single file
const processFile = (filePath: string, unusedImports: UnusedImport[]) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Process imports from bottom to top to maintain line numbers
    for (const unusedImport of unusedImports) {
      const lineIndex = unusedImport.line - 1;
      if (lineIndex < lines.length) {
        const processedLine = removeImportFromLine(lines[lineIndex], unusedImport.import);
        
        if (processedLine === null) {
          // Remove the entire line
          lines.splice(lineIndex, 1);
        } else {
          // Update the line
          lines[lineIndex] = processedLine;
        }
      }
    }
    
    // Write back to file
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✓ Processed ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  // Read TypeScript errors from stdin or file
  const typescriptErrors = fs.readFileSync(0, 'utf-8'); // Read from stdin
  
  const unusedImports = parseUnusedImports(typescriptErrors);
  console.log(`Found ${unusedImports.length} unused imports`);
  
  const groupedImports = groupByFile(unusedImports);
  console.log(`Across ${groupedImports.size} files`);
  
  // Process each file
  for (const [file, imports] of groupedImports.entries()) {
    processFile(file, imports);
  }
  
  console.log('Done!');
};

main();