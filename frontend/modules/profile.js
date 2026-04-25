/* ═══════════════════════════════════════
   PROFILE MODULE — StudySync+
   ═══════════════════════════════════════ */

const Profile = (() => {
  const render = async () => {
    const content = Utils.$('.page-content');
    if (!content) return;
    content.innerHTML = Utils.showLoading();

    try {
      const { user } = await Api.get('/auth/me');
      Api.setUser(user);
      const c = user.contributions || {};

      content.innerHTML = `
        <div class="profile-header">
          <div class="profile-avatar">${Utils.getInitials(user.username)}</div>
          <div>
            <div class="profile-name">${Utils.escapeHtml(user.username)}</div>
            <div class="profile-email">${Utils.escapeHtml(user.email)}</div>
            <span class="profile-role">${user.role}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="card stat-card">
            <div class="stat-value">${user.contributionScore || 0}</div>
            <div class="stat-label">Total Score</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${c.notes || 0}</div>
            <div class="stat-label">Notes Created</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${c.messages || 0}</div>
            <div class="stat-label">Messages Sent</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${c.tasks || 0}</div>
            <div class="stat-label">Tasks Created</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${c.datasets || 0}</div>
            <div class="stat-label">Datasets Uploaded</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value">${c.sessions || 0}</div>
            <div class="stat-label">Sessions Scheduled</div>
          </div>
        </div>

        <div class="card" style="padding:24px">
          <h3 style="margin-bottom:16px">Contribution Breakdown</h3>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${renderBar('Notes', c.notes||0, 10, '#6366f1')}
            ${renderBar('Messages', c.messages||0, 2, '#06b6d4')}
            ${renderBar('Tasks', c.tasks||0, 8, '#f59e0b')}
            ${renderBar('Datasets', c.datasets||0, 15, '#10b981')}
            ${renderBar('Sessions', c.sessions||0, 5, '#ec4899')}
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = Utils.showEmpty('❌', 'Error', err.message);
    }
  };

  const renderBar = (label, count, multiplier, color) => {
    const pts = count * multiplier;
    const maxWidth = Math.min(pts * 2, 100);
    return `<div style="display:flex;align-items:center;gap:12px">
      <span style="width:80px;font-size:0.85rem;color:var(--text-secondary)">${label}</span>
      <div style="flex:1;height:8px;background:var(--bg-glass);border-radius:4px;overflow:hidden">
        <div style="width:${maxWidth}%;height:100%;background:${color};border-radius:4px;transition:width 0.6s ease"></div>
      </div>
      <span style="width:60px;font-size:0.8rem;color:var(--text-muted);text-align:right">${pts} pts</span>
    </div>`;
  };

  return { render };
})();
