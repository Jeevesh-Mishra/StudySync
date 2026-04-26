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
 * Get preview data from a dataset file safely using streams to prevent OOM
 */
const readline = require('readline');
const zlib = require('zlib');

const getDatasetPreview = (filePath, mimeType, compressed) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error('File not found on disk'));
    }

    let readStream = fs.createReadStream(filePath);
    if (compressed) {
      const gunzip = zlib.createGunzip();
      readStream = readStream.pipe(gunzip);
    }

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    const lines = [];
    const MAX_LINES = 50;

    rl.on('line', (line) => {
      if (lineCount <= MAX_LINES) {
        lines.push(line);
        lineCount++;
      } else {
        rl.close();
        readStream.destroy();
      }
    });

    rl.on('close', () => {
      const content = lines.join('\n');
      if (mimeType.includes('csv') || filePath.replace('.gz', '').endsWith('.csv')) {
        resolve({ type: 'csv', ...parseCSV(content, MAX_LINES) });
      } else if (mimeType.includes('json') || filePath.replace('.gz', '').endsWith('.json')) {
        resolve({ type: 'json', ...parseJSON(content, MAX_LINES) });
      } else {
        resolve({ type: 'text', content: content, totalLines: lines.length });
      }
    });

    readStream.on('error', reject);
  });
};

module.exports = { parseCSV, parseJSON, getDatasetPreview };
