const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Compress a file using gzip streams
 */
const compressFile = async (inputPath) => {
  const outputPath = inputPath + '.gz';
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);
  const gzip = zlib.createGzip({ level: 6 });

  await pipeline(readStream, gzip, writeStream);

  // Remove original uncompressed file
  fs.unlinkSync(inputPath);

  return outputPath;
};

/**
 * Decompress a gzip file for reading/download
 */
const decompressFile = async (compressedPath, outputPath) => {
  const readStream = fs.createReadStream(compressedPath);
  const writeStream = fs.createWriteStream(outputPath);
  const gunzip = zlib.createGunzip();

  await pipeline(readStream, gunzip, writeStream);
  return outputPath;
};

/**
 * Read a compressed file into a buffer
 */
const readCompressedFile = (compressedPath) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const readStream = fs.createReadStream(compressedPath);
    const gunzip = zlib.createGunzip();

    readStream.pipe(gunzip)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject);
  });
};

/**
 * Get file size in human readable format
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = { UPLOAD_DIR, compressFile, decompressFile, readCompressedFile, formatFileSize };
