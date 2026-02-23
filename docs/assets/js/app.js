import { mountLogin } from './login.js';
import { mountOrder } from './order.js';
import { mountApproved } from './approved.js';

// Simple SPA router based on the hash portion of the URL.
function router() {
  const app = document.getElementById('app');
  // Clear current content
  while (app.firstChild) app.removeChild(app.firstChild);
  const hash = window.location.hash || '#/login';
  const session = getSession();
  if (hash.startsWith('#/login')) {
    mountLogin(app);
    return;
  }
  // If no session, redirect to login
  if (!session) {
    window.location.hash = '#/login';
    return;
  }
  if (hash.startsWith('#/order')) {
    mountOrder(app);
    return;
  }
  if (hash.startsWith('#/approved')) {
    mountApproved(app);
    return;
  }
  // Default route
  window.location.hash = '#/login';
}

// Session helpers: store token and user in localStorage
export function setSession(sess) {
  localStorage.setItem('meal_session', JSON.stringify(sess));
}
export function getSession() {
  try {
    const raw = localStorage.getItem('meal_session');
    return raw ? JSON.parse(raw) : null;
  } catch (ex) {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem('meal_session');
}

// Initialize router
window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', router);