// api.js
export async function apiPost(action, data = {}, token = null) {
  const url = window.APP_CONFIG.API_BASE;
  if (!url || url.includes("PASTE_YOUR_GAS_WEBAPP_EXEC_URL_HERE")) {
    throw new Error("กรุณาตั้งค่า window.APP_CONFIG.API_BASE ใน index.html ให้เป็น URL ของ Apps Script Web App (/exec)");
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...data }),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) {
    throw new Error("API ตอบกลับไม่ใช่ JSON: " + text.slice(0, 300));
  }
  if (!res.ok || json.ok === false) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem("bh_meal_session") || "null"); } catch { return null; }
}
export function setSession(sess) {
  localStorage.setItem("bh_meal_session", JSON.stringify(sess));
}
export function clearSession() {
  localStorage.removeItem("bh_meal_session");
}
