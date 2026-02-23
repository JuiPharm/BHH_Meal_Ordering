// API wrapper for the Meal Ordering frontend.
//
// All calls return a promise that resolves with the `data` property from
// the backend response. On error, the promise rejects with an Error.

export async function apiCall(action, params = {}, token = null) {
  const base = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '';
  if (!base) {
    throw new Error('API_BASE is not configured');
  }
  const payload = { action, ...params };
  if (token) payload.token = token;
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (ex) {
    throw new Error('API returned non-JSON response: ' + text);
  }
  if (!json.ok) {
    throw new Error(json.error || 'API error');
  }
  return json.data;
}