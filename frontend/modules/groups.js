/* ═══════════════════════════════════════
   GROUPS MODULE — StudySync+
   ═══════════════════════════════════════ */

const Groups = (() => {
  const render = async () => {
    const content = Utils.$('.page-content');
    if (!content) return;

    content.innerHTML = Utils.showLoading();

    try {
      const { groups } = await Api.get('/groups');

      content.innerHTML = `
        <div class="section-header">
          <h2>📖 My Study Groups</h2>
          <div style="display:flex;gap:10px">
            <button class="btn btn-secondary btn-sm" onclick="Groups.showJoinModal()">🔗 Join Group</button>
            <button class="btn btn-primary btn-sm" onclick="Groups.showCreateModal()">+ New Group</button>
          </div>
        </div>

        ${groups.length === 0 ? Utils.showEmpty('📚', 'No groups yet', 'Create or join a study group to get started!',
          '<button class="btn btn-primary btn-sm" onclick="Groups.showCreateModal()">Create First Group</button>') :
          `<div class="card-grid">
            ${groups.map(g => `
              <div class="card group-card" onclick="window.location.hash='#/workspace/${g._id}'">
                <span class="card-subject">${Utils.escapeHtml(g.name)}</span>
                <div class="card-title">${Utils.escapeHtml(g.subject)}</div>
                <div class="card-desc">${Utils.escapeHtml(g.description || 'No description')}</div>
                <div class="card-meta">
                  <div class="members-avatars">
                    ${g.members.slice(0, 4).map(m => `<div class="mini-avatar">${Utils.getInitials(m.username)}</div>`).join('')}
                    ${g.members.length > 4 ? `<div class="mini-avatar">+${g.members.length - 4}</div>` : ''}
                  </div>
                  <span class="invite-code" title="Invite Code">${g.inviteCode}</span>
                </div>
              </div>
            `).join('')}
          </div>`
        }
      `;
    } catch (err) {
      content.innerHTML = Utils.showEmpty('❌', 'Error loading groups', err.message);
    }
  };

  const showCreateModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Create Study Group</h2>
        <form id="create-group-form" onsubmit="Groups.handleCreate(event)">
          <div class="form-group">
            <label>Group Name</label>
            <input type="text" id="group-name" placeholder="e.g. Machine Learning Study" required>
          </div>
          <div class="form-group">
            <label>Subject</label>
            <input type="text" id="group-subject" placeholder="e.g. Computer Science" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="group-description" rows="3" placeholder="What will this group study?"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="create-group-btn">Create Group</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const btn = Utils.$('#create-group-btn');
    btn.textContent = 'Creating...';
    btn.disabled = true;

    try {
      const data = await Api.post('/groups', {
        name: Utils.$('#group-name').value,
        subject: Utils.$('#group-subject').value,
        description: Utils.$('#group-description').value
      });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Group created! Invite code: ' + data.group.inviteCode, 'success');
      render();
    } catch (err) {
      Utils.showToast(err.message, 'error');
      btn.textContent = 'Create Group';
      btn.disabled = false;
    }
  };

  const showJoinModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Join Study Group</h2>
        <form onsubmit="Groups.handleJoin(event)">
          <div class="form-group">
            <label>Invite Code</label>
            <input type="text" id="invite-code" placeholder="Enter 6-character code" required style="text-transform:uppercase">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="join-group-btn">Join Group</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const btn = Utils.$('#join-group-btn');
    btn.textContent = 'Joining...';
    btn.disabled = true;

    try {
      await Api.post('/groups/join', { inviteCode: Utils.$('#invite-code').value });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Successfully joined the group!', 'success');
      render();
    } catch (err) {
      Utils.showToast(err.message, 'error');
      btn.textContent = 'Join Group';
      btn.disabled = false;
    }
  };

  return { render, showCreateModal, handleCreate, showJoinModal, handleJoin };
})();
