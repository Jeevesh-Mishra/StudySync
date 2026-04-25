/* ═══════════════════════════════════════
   NOTIFICATIONS MODULE — StudySync+
   ═══════════════════════════════════════ */

const Notifications = (() => {
  let notifications = [];

  const addNotification = (data) => {
    notifications.unshift({ ...data, read: false, timestamp: new Date() });
    updateBadge();
    Utils.showToast(data.message || 'New notification', 'info');
  };

  const updateBadge = () => {
    const unread = notifications.filter(n => !n.read).length;
    const dot = Utils.$('.notification-btn .dot');
    if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
  };

  const markAllRead = () => {
    notifications.forEach(n => n.read = true);
    updateBadge();
  };

  return { addNotification, updateBadge, markAllRead, notifications };
})();
