// logout.js
import { clearSession } from "./api.js";

export function mountLogout(root) {
  const tpl = document.getElementById("tpl-logout");
  root.appendChild(tpl.content.cloneNode(true));
  clearSession();

  // If template has countdown element, we keep it. Otherwise simple redirect
  setTimeout(() => { window.location.hash = "#/login"; }, 1200);
}
