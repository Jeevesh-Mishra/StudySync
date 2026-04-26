/* ═══════════════════════════════════════
   CHAT MODULE — StudySync+
   Socket.IO real-time chat (reusable)
   ═══════════════════════════════════════ */

const Chat = (() => {
  let socket = null;

  const init = () => {
    const token = Api.getToken();
    if (!token) return;

    if (socket && socket.connected) return;

    const backendUrl = Api.getBaseUrl().replace('/api/v1', '');
    socket = io(backendUrl, { auth: { token } });
    window.socket = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      socket.emit('join-notifications');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('notification', (data) => {
      Notifications.addNotification(data);
    });
  };

  const joinGroup = (groupId) => {
    if (socket) socket.emit('join-group', groupId);
  };

  const leaveGroup = (groupId) => {
    if (socket) socket.emit('leave-group', groupId);
  };

  const sendGroupMessage = (groupId, content) => {
    if (socket) socket.emit('group-message', { groupId, content });
  };

  const onNewMessage = (callback) => {
    if (socket) socket.on('new-message', callback);
  };

  const offNewMessage = () => {
    if (socket) socket.off('new-message');
  };

  const joinDataset = (datasetId) => {
    if (socket) socket.emit('join-dataset', datasetId);
  };

  const leaveDataset = (datasetId) => {
    if (socket) socket.emit('leave-dataset', datasetId);
  };

  const sendDatasetComment = (datasetId, text) => {
    if (socket) socket.emit('dataset-comment', { datasetId, text });
  };

  const onNewDatasetComment = (callback) => {
    if (socket) socket.on('new-dataset-comment', callback);
  };

  const offNewDatasetComment = () => {
    if (socket) socket.off('new-dataset-comment');
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const renderChatUI = (messages = [], inputId = 'chat-input', sendFn = null) => {
    const user = Api.getUser();
    return `
      <div class="chat-container">
        <div class="chat-messages" id="chat-messages">
          ${messages.length === 0 ? '<div class="empty-state" style="padding:20px"><p style="color:var(--text-muted)">No messages yet. Start the conversation! 💬</p></div>' : ''}
          ${messages.map(m => `
            <div class="chat-message">
              <div class="msg-avatar">${Utils.getInitials(m.senderName || m.username || 'U')}</div>
              <div class="msg-body">
                <div class="msg-header">
                  <span class="msg-name">${Utils.escapeHtml(m.senderName || m.username || 'User')}</span>
                  <span class="msg-time">${Utils.timeAgo(m.timestamp)}</span>
                </div>
                <div class="msg-text">${Utils.escapeHtml(m.content || m.text)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="chat-input-area">
          <input type="text" id="${inputId}" placeholder="Type a message..." autocomplete="off">
          <button class="btn btn-primary btn-sm" id="${inputId}-send">Send</button>
        </div>
      </div>
    `;
  };

  const scrollToBottom = () => {
    const container = Utils.$('#chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
  };

  const appendMessage = (msg) => {
    const container = Utils.$('#chat-messages');
    if (!container) return;

    // Remove empty state
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    div.className = 'chat-message';
    const name = msg.sender?.username || msg.senderName || msg.username || 'User';
    div.innerHTML = `
      <div class="msg-avatar">${Utils.getInitials(name)}</div>
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-name">${Utils.escapeHtml(name)}</span>
          <span class="msg-time">Just now</span>
        </div>
        <div class="msg-text">${Utils.escapeHtml(msg.content || msg.text)}</div>
      </div>
    `;
    container.appendChild(div);
    scrollToBottom();
  };

  return {
    init, joinGroup, leaveGroup, sendGroupMessage, onNewMessage, offNewMessage,
    joinDataset, leaveDataset, sendDatasetComment, onNewDatasetComment, offNewDatasetComment,
    disconnect, renderChatUI, scrollToBottom, appendMessage
  };
})();
