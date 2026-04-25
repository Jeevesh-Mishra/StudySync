/* ═══════════════════════════════════════
   WORKSPACE MODULE — StudySync+
   Group workspace with tabs
   ═══════════════════════════════════════ */

const Workspace = (() => {
  let currentGroup = null;
  let currentTab = 'notes';

  const render = async (groupId) => {
    const content = Utils.$('.page-content');
    if (!content) return;
    content.innerHTML = Utils.showLoading();

    try {
      const { group } = await Api.get(`/groups/${groupId}`);
      currentGroup = group;

      const currentUser = Api.getUser();
      const isOwner = currentUser && (group.owner?._id === currentUser._id || group.owner?._id === currentUser.id);

      content.innerHTML = `
        <div class="workspace-header" style="display:flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/dashboard'" style="margin-bottom:8px">← Back</button>
            <div class="group-title" style="display:flex;align-items:center;gap:12px">
              ${Utils.escapeHtml(group.subject)}
              ${isOwner ? `<button class="btn btn-icon btn-sm" title="Edit Group Details" onclick="Workspace.showEditGroupModal()">✏️</button>` : ''}
            </div>
            <div style="color:var(--text-secondary);font-size:0.85rem">${Utils.escapeHtml(group.name)} · ${group.members.length} members · Code: <code style="color:var(--accent-primary-light)">${group.inviteCode}</code></div>
            ${group.description ? `<div style="font-size:0.9rem;margin-top:8px;color:var(--text-muted)">${Utils.escapeHtml(group.description)}</div>` : ''}
          </div>
          ${!isOwner ? `<button class="btn btn-danger btn-sm" onclick="Workspace.showLeaveGroupModal()">Leave Group</button>` : ''}
        </div>

        <div class="workspace-tabs">
          <button class="workspace-tab ${currentTab === 'notes' ? 'active' : ''}" onclick="Workspace.switchTab('notes')">📝 Notes</button>
          <button class="workspace-tab ${currentTab === 'discussions' ? 'active' : ''}" onclick="Workspace.switchTab('discussions')">💬 Discussions</button>
          <button class="workspace-tab ${currentTab === 'tasks' ? 'active' : ''}" onclick="Workspace.switchTab('tasks')">✅ Tasks</button>
          <button class="workspace-tab ${currentTab === 'resources' ? 'active' : ''}" onclick="Workspace.switchTab('resources')">📎 Resources</button>
          <button class="workspace-tab ${currentTab === 'sessions' ? 'active' : ''}" onclick="Workspace.switchTab('sessions')">📅 Sessions</button>
          <button class="workspace-tab ${currentTab === 'members' ? 'active' : ''}" onclick="Workspace.switchTab('members')">👥 Members</button>
        </div>

        <div id="workspace-tab-content"></div>
      `;

      switchTab(currentTab);
    } catch (err) {
      content.innerHTML = Utils.showEmpty('❌', 'Error loading workspace', err.message);
    }
  };

  const switchTab = async (tab) => {
    currentTab = tab;
    const container = Utils.$('#workspace-tab-content');
    if (!container) return;

    // Update active tab
    Utils.$$('.workspace-tab').forEach(t => t.classList.remove('active'));
    Utils.$$('.workspace-tab').forEach(t => {
      if (t.textContent.toLowerCase().includes(tab)) t.classList.add('active');
    });

    container.innerHTML = Utils.showLoading();

    switch (tab) {
      case 'notes': await renderNotes(container); break;
      case 'discussions': await renderDiscussions(container); break;
      case 'tasks': await renderTasks(container); break;
      case 'resources': await renderResources(container); break;
      case 'sessions': await renderSessions(container); break;
      case 'members': renderMembers(container); break;
    }
  };

  // ─── NOTES ───
  const renderNotes = async (container) => {
    try {
      const { notes } = await Api.get(`/notes/group/${currentGroup._id}`);
      container.innerHTML = `
        <div class="section-header">
          <h2>Notes (${notes.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="Workspace.showNoteModal()">+ Add Note</button>
        </div>
        ${notes.length === 0 ? Utils.showEmpty('📝', 'No notes yet', 'Add the first note for your group!') :
          `<div class="notes-list">
            ${notes.map(n => `
              <div class="card note-item">
                <div>
                  <div class="note-title">${Utils.escapeHtml(n.title)}</div>
                  <div class="note-content">${Utils.escapeHtml(n.content)}</div>
                  <div class="note-meta">By ${n.author?.username || 'Unknown'} · ${Utils.timeAgo(n.createdAt)}</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="Workspace.deleteNote('${n._id}')">🗑</button>
              </div>
            `).join('')}
          </div>`
        }
      `;
    } catch (err) { container.innerHTML = Utils.showEmpty('❌', 'Error', err.message); }
  };

  const showNoteModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Add Note</h2>
        <form onsubmit="Workspace.handleCreateNote(event)">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="note-title" required placeholder="Note title">
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea id="note-content" rows="6" placeholder="Write your note here..." required></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Note</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/notes', {
        title: Utils.$('#note-title').value,
        content: Utils.$('#note-content').value,
        group: currentGroup._id
      });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Note added!', 'success');
      switchTab('notes');
      refreshUserData();
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await Api.del(`/notes/${id}`);
      Utils.showToast('Note deleted', 'info');
      switchTab('notes');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  // ─── DISCUSSIONS ───
  const renderDiscussions = async (container) => {
    try {
      const { discussion } = await Api.get(`/discussions/group/${currentGroup._id}`);
      const msgs = discussion?.messages || [];

      container.innerHTML = Chat.renderChatUI(msgs, 'group-chat-input');

      // Setup Socket.IO
      Chat.joinGroup(currentGroup._id);
      Chat.offNewMessage();
      Chat.onNewMessage((msg) => {
        Chat.appendMessage(msg);
      });

      Chat.scrollToBottom();

      // Send button
      const sendBtn = Utils.$('#group-chat-input-send');
      const input = Utils.$('#group-chat-input');

      const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;
        Chat.sendGroupMessage(currentGroup._id, text);
        input.value = '';
      };

      sendBtn.onclick = sendMessage;
      input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    } catch (err) { container.innerHTML = Utils.showEmpty('❌', 'Error', err.message); }
  };

  // ─── TASKS ───
  const renderTasks = async (container) => {
    try {
      const { tasks } = await Api.get(`/tasks/group/${currentGroup._id}`);
      container.innerHTML = `
        <div class="section-header">
          <h2>Tasks (${tasks.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="Workspace.showTaskModal()">+ Add Task</button>
        </div>
        ${tasks.length === 0 ? Utils.showEmpty('✅', 'No tasks yet', 'Create a task to coordinate with your group!') :
          `<div class="task-list">
            ${tasks.map(t => `
              <div class="card task-item">
                <div class="task-checkbox ${t.status}" onclick="Workspace.toggleTask('${t._id}','${t.status}')">
                  ${t.status === 'completed' ? '✓' : ''}
                </div>
                <div class="task-info">
                  <div class="task-title ${t.status === 'completed' ? 'completed' : ''}">${Utils.escapeHtml(t.title)}</div>
                  <div class="task-due">${t.assignee ? `Assigned to ${t.assignee.username}` : 'Unassigned'} ${t.dueDate ? '· Due ' + Utils.formatDate(t.dueDate) : ''}</div>
                </div>
                <span class="task-status-badge ${t.status}">${t.status}</span>
                <button class="btn btn-danger btn-sm" onclick="Workspace.deleteTask('${t._id}')" style="margin-left:8px">🗑</button>
              </div>
            `).join('')}
          </div>`
        }
      `;
    } catch (err) { container.innerHTML = Utils.showEmpty('❌', 'Error', err.message); }
  };

  const showTaskModal = () => {
    const members = currentGroup.members || [];
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Add Task</h2>
        <form onsubmit="Workspace.handleCreateTask(event)">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="task-title" required placeholder="Task title">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="task-description" rows="3" placeholder="Details..."></textarea>
          </div>
          <div class="form-group">
            <label>Assign to</label>
            <select id="task-assignee">
              <option value="">Unassigned</option>
              ${members.map(m => `<option value="${m._id}">${m.username}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Due Date</label>
            <input type="date" id="task-due-date">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/tasks', {
        title: Utils.$('#task-title').value,
        description: Utils.$('#task-description').value,
        group: currentGroup._id,
        assignee: Utils.$('#task-assignee').value || undefined,
        dueDate: Utils.$('#task-due-date').value || undefined
      });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Task created!', 'success');
      switchTab('tasks');
      refreshUserData();
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const toggleTask = async (id, currentStatus) => {
    const statusMap = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' };
    try {
      await Api.put(`/tasks/${id}`, { status: statusMap[currentStatus] });
      switchTab('tasks');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await Api.del(`/tasks/${id}`);
      Utils.showToast('Task deleted', 'info');
      switchTab('tasks');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  // ─── RESOURCES ───
  const renderResources = async (container) => {
    try {
      const { resources } = await Api.get(`/resources/group/${currentGroup._id}`);
      const icons = { link: '🔗', pdf: '📄', video: '🎬', document: '📑', other: '📎' };
      container.innerHTML = `
        <div class="section-header">
          <h2>Resources (${resources.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="Workspace.showResourceModal()">+ Add Resource</button>
        </div>
        ${resources.length === 0 ? Utils.showEmpty('📎', 'No resources yet', 'Share useful links, documents, and more!') :
          `<div class="resource-list">
            ${resources.map(r => `
              <div class="card resource-item">
                <div class="resource-icon">${icons[r.type] || '📎'}</div>
                <div style="flex:1">
                  <div class="resource-title">${r.url ? `<a href="${Utils.escapeHtml(r.url)}" target="_blank">${Utils.escapeHtml(r.title)}</a>` : Utils.escapeHtml(r.title)}</div>
                  <div class="resource-type">${r.type} · Added by ${r.addedBy?.username || 'Unknown'} · ${Utils.timeAgo(r.createdAt)}</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="Workspace.deleteResource('${r._id}')">🗑</button>
              </div>
            `).join('')}
          </div>`
        }
      `;
    } catch (err) { container.innerHTML = Utils.showEmpty('❌', 'Error', err.message); }
  };

  const showResourceModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Add Resource</h2>
        <form onsubmit="Workspace.handleCreateResource(event)">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="resource-title" required placeholder="Resource name">
          </div>
          <div class="form-group">
            <label>URL</label>
            <input type="url" id="resource-url" placeholder="https://...">
          </div>
          <div class="form-group">
            <label>Type</label>
            <select id="resource-type">
              <option value="link">Link</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Resource</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/resources', {
        title: Utils.$('#resource-title').value,
        url: Utils.$('#resource-url').value,
        type: Utils.$('#resource-type').value,
        group: currentGroup._id
      });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Resource added!', 'success');
      switchTab('resources');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const deleteResource = async (id) => {
    if (!confirm('Remove this resource?')) return;
    try {
      await Api.del(`/resources/${id}`);
      switchTab('resources');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  // ─── SESSIONS ───
  const renderSessions = async (container) => {
    try {
      const { sessions } = await Api.get(`/sessions/group/${currentGroup._id}`);
      container.innerHTML = `
        <div class="section-header">
          <h2>Study Sessions (${sessions.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="Workspace.showSessionModal()">+ Schedule Session</button>
        </div>
        ${sessions.length === 0 ? Utils.showEmpty('📅', 'No sessions scheduled', 'Schedule a study session for your group!') :
          `<div class="session-list">
            ${sessions.map(s => {
              const d = new Date(s.scheduledAt);
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return `
                <div class="card session-item">
                  <div class="session-datetime">
                    <span class="session-day">${d.getDate()}</span>
                    <span class="session-month">${months[d.getMonth()]}</span>
                  </div>
                  <div class="session-info">
                    <div class="session-title">${Utils.escapeHtml(s.title)}</div>
                    <div class="session-time">${Utils.formatTime(s.scheduledAt)} · ${s.duration} min</div>
                    <div class="session-participants">${s.participants.length} participant${s.participants.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div style="display:flex;gap:8px">
                    <button class="btn btn-secondary btn-sm" onclick="Workspace.joinSession('${s._id}')">Join</button>
                    <button class="btn btn-danger btn-sm" onclick="Workspace.deleteSession('${s._id}')">🗑</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`
        }
      `;
    } catch (err) { container.innerHTML = Utils.showEmpty('❌', 'Error', err.message); }
  };

  const showSessionModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Schedule Study Session</h2>
        <form onsubmit="Workspace.handleCreateSession(event)">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="session-title" required placeholder="Session topic">
          </div>
          <div class="form-group">
            <label>Date & Time</label>
            <input type="datetime-local" id="session-datetime" required>
          </div>
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" id="session-duration" value="60" min="15" max="300">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="session-description" rows="3" placeholder="What will be discussed?"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Schedule</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await Api.post('/sessions', {
        title: Utils.$('#session-title').value,
        scheduledAt: Utils.$('#session-datetime').value,
        duration: parseInt(Utils.$('#session-duration').value),
        description: Utils.$('#session-description').value,
        group: currentGroup._id
      });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Session scheduled!', 'success');
      switchTab('sessions');
      refreshUserData();
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const joinSession = async (id) => {
    try {
      await Api.put(`/sessions/${id}/join`);
      Utils.showToast('Joined session!', 'success');
      switchTab('sessions');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const deleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    try {
      await Api.del(`/sessions/${id}`);
      switchTab('sessions');
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  // ─── MEMBERS ───
  const renderMembers = (container) => {
    const currentUser = Api.getUser();
    const isOwner = currentUser && (currentGroup.owner?._id === currentUser._id || currentGroup.owner?._id === currentUser.id);

    container.innerHTML = `
      <div class="section-header">
        <h2>Members (${currentGroup.members.length})</h2>
      </div>
      <div class="card-grid">
        ${currentGroup.members.map(m => `
          <div class="card" style="display:flex;align-items:center;gap:16px; justify-content: space-between;">
            <div style="display:flex;align-items:center;gap:16px">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:1.1rem">${Utils.getInitials(m.username)}</div>
              <div>
                <div style="font-weight:600">${Utils.escapeHtml(m.username)}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">${m._id === currentGroup.owner._id ? '👑 Owner' : 'Member'} · Score: ${m.contributionScore || 0}</div>
              </div>
            </div>
            ${isOwner && m._id !== currentGroup.owner._id ? `<button class="btn btn-danger btn-sm" onclick="Workspace.showRemoveMemberModal('${m._id}')">Remove</button>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  };

  // Refresh user contribution data in sidebar
  const refreshUserData = async () => {
    try {
      const { user } = await Api.get('/auth/me');
      Api.setUser(user);
      const scoreEl = Utils.$('#user-score');
      if (scoreEl) scoreEl.textContent = `⭐ ${user.contributionScore || 0} points`;
    } catch (e) {}
  };

  const showEditGroupModal = () => {
    if (!currentGroup) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <h2>Edit Group Details</h2>
        <form onsubmit="Workspace.handleEditGroup(event)">
          <div class="form-group">
            <label>Group Name</label>
            <input type="text" id="edit-group-name" required value="${Utils.escapeHtml(currentGroup.name)}">
          </div>
          <div class="form-group">
            <label>Subject</label>
            <input type="text" id="edit-group-subject" required value="${Utils.escapeHtml(currentGroup.subject)}">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="edit-group-desc" rows="3">${Utils.escapeHtml(currentGroup.description || '')}</textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      await Api.put(`/groups/${currentGroup._id}`, {
        name: Utils.$('#edit-group-name').value,
        subject: Utils.$('#edit-group-subject').value,
        description: Utils.$('#edit-group-desc').value
      });
      Utils.$('#modal-overlay').remove();
      Utils.showToast('Group updated successfully!', 'success');
      render(currentGroup._id); // Re-render the workspace header
    } catch (err) { Utils.showToast(err.message, 'error'); }
  };

  const showLeaveGroupModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal delete-modal">
        <div class="delete-modal-icon" style="font-size:3rem;margin-bottom:16px;text-align:center">🚪</div>
        <h2 style="text-align:center">Leave Group</h2>
        <p style="text-align:center;margin-bottom:24px;color:var(--text-secondary)">Are you sure you want to leave this group? You will lose access to all shared resources and discussions.</p>
        <div class="modal-actions" style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
          <button class="btn btn-danger" id="confirm-leave-btn">Leave Group</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    Utils.$('#confirm-leave-btn').onclick = async () => {
      const btn = Utils.$('#confirm-leave-btn');
      btn.textContent = 'Leaving...';
      btn.disabled = true;
      try {
        await Api.post(`/groups/${currentGroup._id}/leave`);
        overlay.remove();
        Utils.showToast('You have left the group.', 'success');
        window.location.hash = '#/dashboard';
      } catch (err) {
        Utils.showToast(err.message, 'error');
        btn.textContent = 'Leave Group';
        btn.disabled = false;
      }
    };
  };

  const showRemoveMemberModal = (memberId) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal delete-modal">
        <div class="delete-modal-icon" style="font-size:3rem;margin-bottom:16px;text-align:center">⚠️</div>
        <h2 style="text-align:center">Remove Member</h2>
        <p style="text-align:center;margin-bottom:24px;color:var(--text-secondary)">Are you sure you want to remove this member? They will lose access to the group's notes, discussions, and resources.</p>
        <div class="modal-actions" style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-secondary" onclick="Utils.$('#modal-overlay').remove()">Cancel</button>
          <button class="btn btn-danger" id="confirm-remove-btn">Remove</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    Utils.$('#confirm-remove-btn').onclick = async () => {
      const btn = Utils.$('#confirm-remove-btn');
      btn.textContent = 'Removing...';
      btn.disabled = true;
      try {
        await Api.del(`/groups/${currentGroup._id}/members/${memberId}`);
        overlay.remove();
        Utils.showToast('Member removed.', 'success');
        render(currentGroup._id); // Re-fetch the group and re-render
      } catch (err) {
        Utils.showToast(err.message, 'error');
        btn.textContent = 'Remove';
        btn.disabled = false;
      }
    };
  };

  return {
    render, switchTab, showNoteModal, handleCreateNote, deleteNote,
    showTaskModal, handleCreateTask, toggleTask, deleteTask,
    showResourceModal, handleCreateResource, deleteResource,
    showSessionModal, handleCreateSession, joinSession, deleteSession,
    showEditGroupModal, handleEditGroup, showLeaveGroupModal, showRemoveMemberModal
  };
})();
