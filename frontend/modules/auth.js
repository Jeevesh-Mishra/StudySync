/* ═══════════════════════════════════════
   AUTH MODULE — StudySync+
   ═══════════════════════════════════════ */

const Auth = (() => {
  const renderLogin = () => {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="logo">
            <h1>📚 StudySync+</h1>
            <p>Collaborative Learning & Dataset Sharing</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab active" id="login-tab" onclick="Auth.switchTab('login')">Sign In</button>
            <button class="auth-tab" id="register-tab" onclick="Auth.switchTab('register')">Sign Up</button>
          </div>

          <!-- Login Form -->
          <form id="login-form" onsubmit="Auth.handleLogin(event)">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="login-btn">Sign In</button>
          </form>

          <!-- Register Form -->
          <form id="register-form" style="display:none" onsubmit="Auth.handleRegister(event)">
            <div class="form-group">
              <label for="reg-username">Username</label>
              <input type="text" id="reg-username" placeholder="johndoe" required minlength="3">
            </div>
            <div class="form-group">
              <label for="reg-email">Email</label>
              <input type="email" id="reg-email" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
              <label for="reg-password">Password</label>
              <input type="password" id="reg-password" placeholder="Min 6 characters" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="register-btn">Create Account</button>
          </form>
        </div>
      </div>
    `;
  };

  const switchTab = (tab) => {
    const loginTab = Utils.$('#login-tab');
    const registerTab = Utils.$('#register-tab');
    const loginForm = Utils.$('#login-form');
    const registerForm = Utils.$('#register-form');

    if (tab === 'login') {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    } else {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = Utils.$('#login-email').value;
    const password = Utils.$('#login-password').value;
    const btn = Utils.$('#login-btn');

    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      const data = await Api.post('/auth/login', { email, password });
      Api.setToken(data.token);
      Api.setUser(data.user);
      Utils.showToast(`Welcome back, ${data.user.username}!`, 'success');
      window.location.hash = '#/dashboard';
    } catch (err) {
      Utils.showToast(err.message, 'error');
    } finally {
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = Utils.$('#reg-username').value;
    const email = Utils.$('#reg-email').value;
    const password = Utils.$('#reg-password').value;
    const btn = Utils.$('#register-btn');

    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
      const data = await Api.post('/auth/register', { username, email, password });
      Api.setToken(data.token);
      Api.setUser(data.user);
      Utils.showToast('Account created! Welcome to StudySync+', 'success');
      window.location.hash = '#/dashboard';
    } catch (err) {
      Utils.showToast(err.message, 'error');
    } finally {
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  };

  const logout = () => {
    Api.removeToken();
    Api.removeUser();
    if (window.socket) window.socket.disconnect();
    window.location.hash = '#/login';
    Utils.showToast('Logged out successfully', 'info');
  };

  const isAuthenticated = () => !!Api.getToken();

  return { renderLogin, switchTab, handleLogin, handleRegister, logout, isAuthenticated };
})();
