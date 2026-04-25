/* ═══════════════════════════════════════
   DATASETS MODULE — StudySync+
   Dataset listing, search, filter
   ═══════════════════════════════════════ */

const Datasets = (() => {
  let allTags = [];
  let activeTag = '';

  const render = async () => {
    const content = Utils.$('.page-content');
    if (!content) return;
    content.innerHTML = Utils.showLoading();

    try {
      // Fetch tags and datasets in parallel
      const [tagsRes, datasetsRes] = await Promise.all([
        Api.get('/datasets/tags/all'),
        Api.get('/datasets' + (activeTag ? `?tag=${activeTag}` : ''))
      ]);

      allTags = tagsRes.tags || [];
      const datasets = datasetsRes.datasets || [];

      content.innerHTML = `
        <div class="section-header">
          <h2>📊 Datasets</h2>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/datasets/upload'">⬆ Upload Dataset</button>
        </div>

        <!-- Search Bar -->
        <div class="filters-bar">
          <div class="search-bar" style="flex:1;max-width:400px">
            <span class="search-icon">🔍</span>
            <input type="text" id="dataset-search-input" placeholder="Search datasets..." oninput="Datasets.handleSearch(this.value)">
          </div>
          <button class="filter-tag ${!activeTag ? 'active' : ''}" onclick="Datasets.filterByTag('')">All</button>
          ${allTags.slice(0, 10).map(t => `
            <button class="filter-tag ${activeTag === t.name ? 'active' : ''}" onclick="Datasets.filterByTag('${t.name}')">${t.name} (${t.count})</button>
          `).join('')}
        </div>

        <div id="datasets-grid">
          ${renderDatasetGrid(datasets)}
        </div>
      `;
    } catch (err) {
      content.innerHTML = Utils.showEmpty('❌', 'Error loading datasets', err.message);
    }
  };

  const renderDatasetGrid = (datasets) => {
    if (datasets.length === 0) {
      return Utils.showEmpty('📊', 'No datasets found', 'Upload the first dataset to get started!',
        '<button class="btn btn-primary btn-sm" onclick="window.location.hash=\'#/datasets/upload\'">Upload Dataset</button>');
    }

    return `
      <div class="card-grid">
        ${datasets.map(d => `
          <div class="card dataset-card" onclick="window.location.hash='#/datasets/${d._id}'">
            <div class="dataset-tags">
              ${d.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <div class="card-title">${Utils.escapeHtml(d.title)}</div>
            <div class="card-desc">${Utils.escapeHtml(d.description || 'No description')}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
              <div class="dataset-stats">
                <span>👁 ${d.views}</span>
                <span>⬇ ${d.downloads}</span>
                <span>💬 ${d.comments?.length || 0}</span>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted)">${Utils.formatFileSize(d.fileSize)}</span>
            </div>
            <div style="margin-top:10px;font-size:0.75rem;color:var(--text-muted)">
              By ${d.uploader?.username || 'Unknown'} · ${Utils.timeAgo(d.createdAt)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  let searchTimeout;
  const handleSearch = (query) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const params = query ? `?search=${encodeURIComponent(query)}` : '';
        const { datasets } = await Api.get(`/datasets${params}`);
        const grid = Utils.$('#datasets-grid');
        if (grid) grid.innerHTML = renderDatasetGrid(datasets);
      } catch (err) {
        Utils.showToast(err.message, 'error');
      }
    }, 300);
  };

  const filterByTag = async (tag) => {
    activeTag = tag;
    render();
  };

  return { render, handleSearch, filterByTag };
})();
