/* ═══════════════════════════════════════
   ROUTER MODULE — StudySync+
   Hash-based client-side routing
   ═══════════════════════════════════════ */

const Router = (() => {
  const routes = {};

  const add = (path, handler) => {
    routes[path] = handler;
  };

  const navigate = () => {
    const hash = window.location.hash || '#/login';
    const path = hash.replace('#', '');

    // Auth guard
    if (!Auth.isAuthenticated() && path !== '/login') {
      window.location.hash = '#/login';
      return;
    }

    if (Auth.isAuthenticated() && path === '/login') {
      window.location.hash = '#/dashboard';
      return;
    }

    // Match routes
    for (const [routePath, handler] of Object.entries(routes)) {
      const paramNames = [];
      const regexStr = routePath.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });
      const match = path.match(new RegExp(`^${regexStr}$`));

      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        handler(params);
        updateActiveNav(routePath);
        return;
      }
    }

    // 404 fallback
    const content = Utils.$('.page-content');
    if (content) {
      content.innerHTML = Utils.showEmpty('🔍', 'Page not found', 'The page you are looking for does not exist.');
    }
  };

  const updateActiveNav = (route) => {
    Utils.$$('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.route && route.startsWith(item.dataset.route)) {
        item.classList.add('active');
      }
    });
  };

  const init = () => {
    window.addEventListener('hashchange', navigate);
    navigate();
  };

  return { add, navigate, init };
})();
