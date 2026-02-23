// gas-shim.js
import { apiPost, getSession } from "./api.js";

/**
 * Compatibility shim so original GAS HTMLService code (google.script.run.*)
 * can run unchanged on GitHub Pages.
 */
function makeRunner() {
  let success = null;
  let failure = null;

  const runner = new Proxy({}, {
    get(_t, prop) {
      if (prop === "withSuccessHandler") {
        return (fn) => { success = fn; return runner; };
      }
      if (prop === "withFailureHandler") {
        return (fn) => { failure = fn; return runner; };
      }
      // method call
      return async (...args) => {
        try {
          const sess = getSession();
          const token = sess?.token || null;

          // Map function name -> API action + payload mapping to keep original return types.
          const fn = String(prop);

          let action = null;
          let payload = {};

          if (fn === "getAllow") { action = "approved.list"; payload = {}; }
          else if (fn === "getPendingCount") { action = "approved.pendingCount"; payload = {}; }
          else if (fn === "getCurrentVersion") { action = "approved.getVersion"; payload = {}; }
          else if (fn === "readpassId") { action = "approved.readpassId"; payload = { passId: args[0] }; }
          else if (fn === "updateId0") { action = "approved.updateId0"; payload = { id: args[0], staff: args[1] }; }
          else if (fn === "updateId1") { action = "approved.updateId1"; payload = { id: args[0], staff: args[1] }; }
          else if (fn === "updateId2") { action = "approved.updateId2"; payload = { id: args[0], staff: args[1] }; }
          else if (fn === "generateOrderSlipPdf") { action = "approved.generateSlip"; payload = { id: args[0] }; }
          else {
            // fallback: allow other functions if you add them on GAS
            action = fn;
            payload = { args };
          }

          const r = await apiPost(action, payload, token);

          // Unwrap to original expected shapes
          let out = r.data;
          if (fn === "getAllow") out = r.data.rows;            // array
          if (fn === "getPendingCount") out = r.data.pendingCount; // number
          if (fn === "getCurrentVersion") out = r.data.version;    // number
          if (fn === "readpassId") out = r.data.result;            // array
          if (fn === "generateOrderSlipPdf") out = r.data.pdfBase64; // string base64
          if (fn.startsWith("updateId")) out = r.data;             // object res expected by afterDone

          if (success) success(out);
        } catch (e) {
          if (failure) failure(e);
          else console.error(e);
        } finally {
          success = null; failure = null;
        }
      };
    }
  });
  return runner;
}

export function installGasShim() {
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = makeRunner();
}

// Execute scripts that were inserted from <template> cloning (scripts are inert by default)
export function activateScripts(container) {
  const scripts = container.querySelectorAll("script");
  scripts.forEach((old) => {
    const s = document.createElement("script");
    // copy attributes
    for (const a of old.attributes) s.setAttribute(a.name, a.value);
    s.text = old.textContent;
    old.parentNode.replaceChild(s, old);
  });
}
