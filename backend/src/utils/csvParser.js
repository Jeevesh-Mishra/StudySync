const fs = require('fs');
const { readCompressedFile } = require('./fileHandler');

/**
 * Parse CSV text into array of objects
 */
const parseCSV = (text, maxRows = 50) => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [], totalRows: 0 };

  const headers = parseCSVLine(lines[0]);
  const rows = [];
  const limit = Math.min(lines.length, maxRows + 1);

  for (let i = 1; i < limit; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows, totalRows: lines.length - 1 };
};

/**
 * Parse a single CSV line handling quoted fields
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

/**
 * Parse JSON data for preview
 */
const parseJSON = (text, maxItems = 50) => {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      return { headers, rows: data.slice(0, maxItems), totalRows: data.length };
    }
    return { headers: Object.keys(data), rows: [data], totalRows: 1 };
  } catch {
    return { headers: [], rows: [], totalRows: 0, error: 'Invalid JSON' };
  }
};

/**
 * Get preview data from a dataset file
 */
const getDatasetPreview = async (filePath, mimeType, compressed) => {
  let content;
  if (compressed) {
    const buffer = await readCompressedFile(filePath);
    content = buffer.toString('utf-8');
  } else {
    content = fs.readFileSync(filePath, 'utf-8');
  }

  if (mimeType.includes('csv') || filePath.replace('.gz', '').endsWith('.csv')) {
    return { type: 'csv', ...parseCSV(content) };
  }
  if (mimeType.includes('json') || filePath.replace('.gz', '').endsWith('.json')) {
    return { type: 'json', ...parseJSON(content) };
  }

  // For other text files, return raw text preview
  const lines = content.split('\n').slice(0, 50);
  return { type: 'text', content: lines.join('\n'), totalLines: content.split('\n').length };
};

module.exports = { parseCSV, parseJSON, getDatasetPreview };
