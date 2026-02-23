// approved.js
import { getSession } from "./api.js";
import { activateScripts } from "./gas-shim.js";

export function mountApproved(root) {
  const tpl = document.getElementById("tpl-approved");
  root.appendChild(tpl.content.cloneNode(true));

  // Ensure original inline scripts run (they rely on google.script.run shim)
  activateScripts(root);

  // Optional: basic guard (original page also has its own passId checks)
  const sess = getSession();
  if (!sess?.token) window.location.hash = "#/login";
}
