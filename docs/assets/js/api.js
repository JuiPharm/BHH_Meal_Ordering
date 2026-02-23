// api.js
export async function apiPost(action, data = {}, token = null) {
  const url = window.APP_CONFIG.API_BASE;
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error("ตั้งค่า window.APP_CONFIG.API_BASE ให้เป็น URL เต็ม เช่น https://xxx.workers.dev");
  }

  // ✅ Simple request: no preflight
  // - Content-Type: text/plain
  // - no Authorization header
  // - put token in body
  const payload = { action, ...data };
  if (token) payload.token = token;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch {
    throw new Error("API ตอบกลับไม่ใช่ JSON: " + text.slice(0, 300));
  }

  if (!res.ok || json.ok === false) {
    throw new Error(json?.error || `HTTP ${res.status}`);
  }
  return json;
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem("bh_meal_session") || "null"); }
  catch { return null; }
}
export function setSession(sess) {
  localStorage.setItem("bh_meal_session", JSON.stringify(sess));
}
export function clearSession() {
  localStorage.removeItem("bh_meal_session");
}
