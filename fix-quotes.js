const fs = require('fs');
const path = 'frontend/src/data/pedagogical-content-v2.ts';
let content = fs.readFileSync(path, 'utf-8');
let result = '';
let i = 0;
let line = 1;

while (i < content.length) {
  if (content[i] === '\n') line++;

  // Single-line comment
  if (content[i] === '/' && content[i + 1] === '/') {
    let end = content.indexOf('\n', i); if (end === -1) end = content.length;
    result += content.slice(i, end); i = end; continue;
  }

  // Multi-line comment
  if (content[i] === '/' && content[i + 1] === '*') {
    let end = content.indexOf('*/', i + 2); if (end === -1) end = content.length - 2;
    result += content.slice(i, end + 2); i = end + 2; continue;
  }

  // Template literal - skip
  if (content[i] === '`') {
    let j = i + 1;
    while (j < content.length) {
      if (content[j] === '\\') { j += 2; continue; }
      if (content[j] === '`') break;
      if (content[j] === '$' && content[j + 1] === '{') {
        j += 2; let depth = 1;
        while (j < content.length && depth > 0) {
          if (content[j] === '{') depth++;
          else if (content[j] === '}') depth--;
          j++;
        }
        continue;
      }
      j++;
    }
    result += content.slice(i, j + 1); i = j + 1; continue;
  }

  // Double-quoted string - skip (they're already correct)
  if (content[i] === '"') {
    let j = i + 1;
    while (j < content.length) {
      if (content[j] === '\\' && content[j + 1] === '"') { j += 2; continue; }
      if (content[j] === '\\' && content[j + 1] === '\\') { j += 2; continue; }
      if (content[j] === '"') break;
      j++;
    }
    result += content.slice(i, j + 1); i = j + 1; continue;
  }

  // Single-quoted string - convert to double-quoted
  if (content[i] === "'") {
    let j = i + 1;
    let strContent = '';
    let hasDoubleQuote = false;

    while (j < content.length) {
      // \' inside single-quoted -> escaped apostrophe -> just apostrophe in output
      if (content[j] === '\\' && content[j + 1] === "'") {
        strContent += "'";
        j += 2; continue;
      }
      // \\ followed by ' -> double-escaped = mistake, treat as single apostrophe
      if (content[j] === '\\' && content[j + 1] === '\\' && content[j + 2] === "'") {
        strContent += "'";
        j += 3; continue;
      }
      // \\ (other cases - keep one backslash)
      if (content[j] === '\\' && content[j + 1] === '\\') {
        strContent += '\\';
        j += 2; continue;
      }
      // \n
      if (content[j] === '\\' && content[j + 1] === 'n') {
        strContent += '\n';
        j += 2; continue;
      }
      // Other escape sequences
      if (content[j] === '\\') {
        strContent += content[j + 1];
        j += 2; continue;
      }
      // End of string
      if (content[j] === "'") break;
      // Track double quotes in content
      if (content[j] === '"') hasDoubleQuote = true;
      strContent += content[j];
      j++;
    }

    if (hasDoubleQuote) {
      result += '`' + strContent + '`';
    } else {
      result += '"' + strContent + '"';
    }
    i = j + 1;
    continue;
  }

  result += content[i];
  i++;
}

fs.writeFileSync(path, result, 'utf-8');
console.log('File rewritten successfully.');
