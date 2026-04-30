/* ═══════════════════════════════════════
   DATASET DETAIL MODULE — StudySync+
   ═══════════════════════════════════════ */

const DatasetDetail = (() => {
  let currentDataset = null;

  const render = async (id) => {
    const content = Utils.$('.page-content');
    if (!content) return;
    content.innerHTML = Utils.showLoading();

    try {
      const [datasetRes, previewRes] = await Promise.all([
        Api.get(`/datasets/${id}`),
        Api.get(`/datasets/${id}/preview`).catch(() => ({ preview: null }))
      ]);

      currentDataset = datasetRes.dataset;
      const preview = previewRes.preview;
      const d = currentDataset;

      let html = `<button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/datasets'" style="margin-bottom:16px">← Back</button>`;
      html += `<div class="dataset-detail-header"><h2>${Utils.escapeHtml(d.title)}</h2>`;
      html += `<div class="dataset-meta"><span>👤 ${d.uploader?.username||'Unknown'}</span><span>📅 ${Utils.formatDate(d.createdAt)}</span><span>📦 ${Utils.formatFileSize(d.fileSize)}</span><span>👁 ${d.views}</span><span>⬇ ${d.downloads}</span></div>`;
      html += `<div style="margin-top:12px">${d.tags.map(t=>`<span class="tag" style="display:inline-block;padding:4px 12px;background:rgba(6,182,212,0.12);color:var(--accent-secondary);font-size:0.8rem;border-radius:20px;margin:2px">${t}</span>`).join('')}</div>`;
      html += `<p style="margin-top:16px;color:var(--text-secondary)">${Utils.escapeHtml(d.description||'')}</p></div>`;
      const currentUser = Api.getUser();
      const isOwner = currentUser && (currentUser._id === d.uploader?._id || currentUser.id === d.uploader?._id);
      html += `<div style="margin-bottom:24px;display:flex;gap:12px;align-items:center">
        <button class="btn btn-primary" id="download-btn">⬇ Download</button>
        ${isOwner ? `<button class="btn btn-danger" id="delete-dataset-btn">🗑 Delete Dataset</button>` : ''}
      </div>`;
      html += preview ? renderPreview(preview) : '';
      html += renderComments(d.comments || []);
      content.innerHTML = html;

      setupDownload(d);
      setupComments(d);
      setupDelete(d);
    } catch (err) {
      content.innerHTML = Utils.showEmpty('❌', 'Error', err.message);
    }
  };

  const renderPreview = (p) => {
    if (!p || !p.headers || p.headers.length === 0) return '';
    let h = `<div class="card" style="padding:0;margin-bottom:24px;overflow:hidden"><div style="padding:16px 20px;border-bottom:1px solid var(--border-color)"><h3>📋 Preview (${p.rows.length} of ${p.totalRows} rows)</h3></div>`;
    h += `<div class="preview-table-container"><table class="preview-table"><thead><tr>${p.headers.map(h=>`<th>${Utils.escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>`;
    h += p.rows.map(row => `<tr>${p.headers.map(k=>`<td>${Utils.escapeHtml(String(row[k]||''))}</td>`).join('')}</tr>`).join('');
    h += `</tbody></table></div></div>`;
    return h;
  };

  const renderComments = (comments) => {
    let h = `<div class="comments-section"><h3>💬 Comments (${comments.length})</h3><div class="comment-list" id="comment-list">`;
    h += comments.map(c => `<div class="comment-item"><div class="comment-avatar">${Utils.getInitials(c.username)}</div><div class="comment-body"><div class="comment-name">${Utils.escapeHtml(c.username)}</div><div class="comment-text">${Utils.escapeHtml(c.text)}</div><div class="comment-time">${Utils.timeAgo(c.timestamp)}</div></div></div>`).join('');
    h += `</div><div class="comment-input-area"><input type="text" id="comment-input" placeholder="Add a comment..." autocomplete="off"><button class="btn btn-primary btn-sm" id="comment-send-btn">Post</button></div></div>`;
    return h;
  };

  const setupDownload = (d) => {
    const btn = Utils.$('#download-btn');
    if (!btn) return;
    btn.onclick = () => {
      fetch(`${Api.getBaseUrl()}/datasets/download/${d._id}`, {
        headers: { 'Authorization': `Bearer ${Api.getToken()}` }
      }).then(async r => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          throw new Error(errData.message || 'Download failed on server');
        }
        return r.blob();
      }).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = d.originalName; a.click();
        URL.revokeObjectURL(url);
        Utils.showToast('Download started!', 'success');
      }).catch(e => Utils.showToast(e.message || 'Download failed', 'error'));
    };
  };

  const setupDelete = (d) => {
    const btn = Utils.$('#delete-dataset-btn');
    if (!btn) return;
    btn.onclick = () => {
      showDeleteModal(d);
    };
  };

  const showDeleteModal = (d) => {
    // Remove any existing modal
    const existing = Utils.$('#delete-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'delete-modal-overlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal delete-modal">
        <div class="delete-modal-icon">🗑</div>
        <h3>Delete Dataset</h3>
        <p>Are you sure you want to delete <strong>${Utils.escapeHtml(d.title)}</strong>? This action cannot be undone.</p>
        <div class="delete-modal-actions">
          <button class="btn btn-secondary" id="delete-cancel-btn">Cancel</button>
          <button class="btn btn-danger" id="delete-confirm-btn">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    Utils.$('#delete-cancel-btn').onclick = () => overlay.remove();
    Utils.$('#delete-confirm-btn').onclick = async () => {
      const confirmBtn = Utils.$('#delete-confirm-btn');
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';
      try {
        await Api.del(`/datasets/${d._id}`);
        overlay.remove();
        Utils.showToast('Dataset deleted successfully', 'success');
        window.location.hash = '#/datasets';
      } catch (err) {
        Utils.showToast(err.message || 'Failed to delete dataset', 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Delete';
      }
    };
  };

  const setupComments = (d) => {
    Chat.joinDataset(d._id);
    Chat.offNewDatasetComment();
    Chat.onNewDatasetComment(appendComment);

    const sendComment = () => {
      const input = Utils.$('#comment-input');
      const text = input.value.trim();
      if (!text) return;
      Chat.sendDatasetComment(d._id, text);
      input.value = '';
    };

    const sendBtn = Utils.$('#comment-send-btn');
    const input = Utils.$('#comment-input');
    if (sendBtn) sendBtn.onclick = sendComment;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') sendComment(); };
  };

  const appendComment = (c) => {
    const list = Utils.$('#comment-list');
    if (!list) return;
    const name = c.user?.username || c.username || 'User';
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `<div class="comment-avatar">${Utils.getInitials(name)}</div><div class="comment-body"><div class="comment-name">${Utils.escapeHtml(name)}</div><div class="comment-text">${Utils.escapeHtml(c.text)}</div><div class="comment-time">Just now</div></div>`;
    list.appendChild(div);
  };

  return { render, addComment: () => {}, trackDownload: () => {} };
})();
