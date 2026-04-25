const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { uploadDataset, getDatasets, getDataset, previewDataset, downloadDataset, addComment, getAllTags, deleteDataset } = require('../controllers/datasetController');
const { UPLOAD_DIR } = require('../utils/fileHandler');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.json', '.txt', '.xlsx', '.tsv', '.xml', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only data files (csv, json, txt, xlsx, tsv, xml, pdf, doc, docx) are allowed'));
    }
  }
});

router.get('/tags/all', auth, getAllTags);
router.post('/upload', auth, upload.single('file'), uploadDataset);
router.get('/', auth, getDatasets);
router.get('/:id', auth, getDataset);
router.get('/:id/preview', auth, previewDataset);
router.get('/download/:id', auth, downloadDataset);
router.post('/:id/comments', auth, addComment);
router.delete('/:id', auth, deleteDataset);

module.exports = router;
