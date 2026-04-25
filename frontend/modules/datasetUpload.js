/* ═══════════════════════════════════════
   DATASET UPLOAD MODULE — StudySync+
   ═══════════════════════════════════════ */

const DatasetUpload = (() => {
  let selectedFile = null;

  const render = () => {
    const content = Utils.$('.page-content');
    if (!content) return;

    content.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/datasets'" style="margin-bottom:16px">← Back to Datasets</button>

      <div class="dataset-upload-container">
        <div class="card" style="padding:32px">
          <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:24px">⬆ Upload Dataset</h2>

          <form id="upload-form" onsubmit="DatasetUpload.handleUpload(event)">
            <!-- Dropzone -->
            <div class="upload-dropzone" id="upload-dropzone"
                 ondragover="DatasetUpload.dragOver(event)"
                 ondragleave="DatasetUpload.dragLeave(event)"
                 ondrop="DatasetUpload.handleDrop(event)"
                 onclick="Utils.$('#file-input').click()">
              <div class="upload-icon">📁</div>
              <div class="upload-text" id="upload-text">Drag & drop your file here or click to browse</div>
              <div class="upload-hint">Supports: CSV, JSON, TXT, TSV, XML, PDF, DOC, DOCX (max 50MB)</div>
              <input type="file" id="file-input" accept=".csv,.json,.txt,.tsv,.xml,.xlsx,.pdf,.doc,.docx" style="display:none" onchange="DatasetUpload.handleFileSelect(event)">
            </div>

            <div class="form-group">
              <label>Title *</label>
              <input type="text" id="upload-title" required placeholder="Dataset title">
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea id="upload-description" rows="4" placeholder="Describe your dataset..."></textarea>
            </div>

            <div class="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" id="upload-tags" placeholder="e.g. machine-learning, csv, classification">
            </div>

            <button type="submit" class="btn btn-primary btn-full" id="upload-btn">Upload Dataset</button>
          </form>
        </div>
      </div>
    `;
  };

  const dragOver = (e) => {
    e.preventDefault();
    Utils.$('#upload-dropzone').classList.add('dragover');
  };

  const dragLeave = (e) => {
    e.preventDefault();
    Utils.$('#upload-dropzone').classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    Utils.$('#upload-dropzone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) selectFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) selectFile(file);
  };

  const selectFile = (file) => {
    selectedFile = file;
    const textEl = Utils.$('#upload-text');
    textEl.innerHTML = `<span class="file-selected">✓ ${file.name} (${Utils.formatFileSize(file.size)})</span>`;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      Utils.showToast('Please select a file', 'warning');
      return;
    }

    const btn = Utils.$('#upload-btn');
    btn.textContent = 'Uploading...';
    btn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', Utils.$('#upload-title').value);
      formData.append('description', Utils.$('#upload-description').value);
      formData.append('tags', Utils.$('#upload-tags').value);

      const data = await Api.upload('/datasets/upload', formData);

      Utils.showToast('Dataset uploaded successfully!', 'success');
      selectedFile = null;
      window.location.hash = `#/datasets/${data.dataset._id}`;
    } catch (err) {
      Utils.showToast(err.message, 'error');
    } finally {
      btn.textContent = 'Upload Dataset';
      btn.disabled = false;
    }
  };

  return { render, dragOver, dragLeave, handleDrop, handleFileSelect, handleUpload };
})();
