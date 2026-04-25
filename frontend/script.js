/* ═══════════════════════════════════════
   MAIN SCRIPT — StudySync+
   Application entry point
   ═══════════════════════════════════════ */

(function () {
  const renderAppShell = () => {
    const user = Api.getUser();
    const app = Utils.$('#app');

    app.innerHTML = `
      <div class="app-layout">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <h1>📚 StudySync+</h1>
            <div class="tagline">Learn Together, Grow Together</div>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section-title">Main</div>
            <div class="nav-item active" data-route="/dashboard" onclick="window.location.hash='#/dashboard'">
              <span class="icon">📊</span> Dashboard
            </div>
            <div class="nav-item" data-route="/datasets" onclick="window.location.hash='#/datasets'">
              <span class="icon">📁</span> Datasets
            </div>

            <div class="nav-section-title">Account</div>
            <div class="nav-item" data-route="/profile" onclick="window.location.hash='#/profile'">
              <span class="icon">👤</span> Profile
            </div>
            <div class="nav-item" onclick="Auth.logout()">
              <span class="icon">🚪</span> Logout
            </div>
          </nav>

          <div class="sidebar-user">
            <div class="avatar">${Utils.getInitials(user?.username || 'U')}</div>
            <div class="user-info">
              <div class="name">${user?.username || 'User'}</div>
              <div class="score" id="user-score">⭐ ${user?.contributionScore || 0} points</div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="main-content">
          <header class="main-header">
            <button class="mobile-menu-btn" onclick="Utils.$('#sidebar').classList.toggle('open')">☰</button>
            <div class="page-title" id="page-title">Dashboard</div>
            <div class="header-actions">
              <button class="btn btn-icon theme-toggle-btn" id="theme-toggle-btn" title="Toggle Theme" onclick="Utils.toggleTheme()">
                ${document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌓'}
              </button>
            </div>
          </header>

          <div class="page-content" id="page-content"></div>
        </main>
      </div>
    `;
  };

  const setPageTitle = (title) => {
    const el = Utils.$('#page-title');
    if (el) el.textContent = title;
    document.title = `${title} — StudySync+`;
  };

  // ─── Register Routes ───
  Router.add('/login', () => {
    Utils.$('#app').innerHTML = Auth.renderLogin();
  });

  Router.add('/dashboard', () => {
    renderAppShell();
    setPageTitle('Study Groups');
    Groups.render();
    Chat.init();
  });

  Router.add('/datasets', () => {
    renderAppShell();
    setPageTitle('Datasets');
    Datasets.render();
    Chat.init();
  });

  Router.add('/datasets/upload', () => {
    renderAppShell();
    setPageTitle('Upload Dataset');
    DatasetUpload.render();
    Chat.init();
  });

  Router.add('/datasets/:id', (params) => {
    renderAppShell();
    setPageTitle('Dataset Details');
    DatasetDetail.render(params.id);
    Chat.init();
  });

  Router.add('/workspace/:id', (params) => {
    renderAppShell();
    setPageTitle('Group Workspace');
    Workspace.render(params.id);
    Chat.init();
  });

  Router.add('/profile', () => {
    renderAppShell();
    setPageTitle('Profile');
    Profile.render();
    Chat.init();
  });

  // ─── Always start at login on fresh page load ───
  Api.removeToken();
  Api.removeUser();
  if (window.socket) window.socket.disconnect();
  window.location.hash = '#/login';

  // ─── Initialize Router ───
  Router.init();
})();
