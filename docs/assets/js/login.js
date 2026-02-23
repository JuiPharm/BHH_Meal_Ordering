import { apiCall } from './api.js';
import { setSession } from './app.js';

// Render the login page into the given root element.
export function mountLogin(root) {
  const tpl = document.createElement('div');
  tpl.innerHTML = `
    <div class="login-card">
      <div class="p-4 text-center bg-primary text-white">
        <img src="https://lh5.googleusercontent.com/d/1r7PM1ogHIbxskvcauVIYaQOfSHXWGncO" style="max-height:70px;" class="mb-2" />
        <h4 class="mb-1">ระบบสั่งอาหารผู้ป่วย</h4>
        <p class="mb-0 opacity-75">Bangkok Hospital</p>
      </div>
      <div class="p-4">
        <form id="loginForm">
          <div class="mb-3">
            <label class="form-label required">Username</label>
            <input type="text" class="form-control" id="username" required autofocus />
          </div>
          <div class="mb-3">
            <label class="form-label required">Password</label>
            <input type="password" class="form-control" id="password" required />
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="rememberMe" />
            <label class="form-check-label" for="rememberMe">จำฉันไว้</label>
          </div>
          <button type="submit" class="btn btn-login w-100">
            <span class="loading" id="spin"></span>
            <span id="btnText">เข้าสู่ระบบ</span>
          </button>
        </form>
      </div>
    </div>
  `;
  root.appendChild(tpl);
  const form = root.querySelector('#loginForm');
  const spin = root.querySelector('#spin');
  const btnText = root.querySelector('#btnText');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = root.querySelector('#username').value.trim();
    const password = root.querySelector('#password').value.trim();
    const remember = root.querySelector('#rememberMe').checked;
    if (!username || !password) {
      alert('กรุณากรอก Username และ Password');
      return;
    }
    spin.style.display = 'inline-block';
    btnText.textContent = 'กำลังเข้าสู่ระบบ...';
    try {
      const data = await apiCall('auth.login', { username, password });
      // Save session
      const session = { token: data.token, user: data.user };
      setSession(session);
      // Redirect based on role
      const role = (data.user.role || '').toUpperCase();
      if (role.includes('APPROVED')) {
        window.location.hash = '#/approved';
      } else {
        window.location.hash = '#/order';
      }
    } catch (err) {
      alert(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      spin.style.display = 'none';
      btnText.textContent = 'เข้าสู่ระบบ';
    }
  });
}