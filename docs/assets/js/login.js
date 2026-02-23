// login.js
import { apiPost, setSession } from "./api.js";

export function mountLogin(root) {
  const tpl = document.getElementById("tpl-login");
  root.appendChild(tpl.content.cloneNode(true));

  // Find form elements (from original template)
  const btn = root.querySelector("#btnLogin") || root.querySelector("button[type=submit]") || root.querySelector("button");
  const userEl = root.querySelector("#username") || root.querySelector("input[type=text]");
  const passEl = root.querySelector("#password") || root.querySelector("input[type=password]");

  // If original template has a form, prevent default
  const form = root.querySelector("form");
  if (form) form.addEventListener("submit", (e) => e.preventDefault());

  async function doLogin() {
    const username = (userEl?.value || "").trim();
    const password = (passEl?.value || "").trim();
    if (!username || !password) {
      Swal.fire({ icon: "warning", title: "กรุณากรอก Username และ Password" });
      return;
    }

    try {
      btn && (btn.disabled = true);
      const r = await apiPost("auth.login", { username, password });
      // r.data: {token, user:{name,department,role}}
      setSession({ token: r.data.token, user: r.data.user, role: r.data.user.role });
      Swal.fire({ icon: "success", title: "เข้าสู่ระบบสำเร็จ", timer: 900, showConfirmButton: false })
        .then(() => {
          window.location.hash = (r.data.user.role === "APPROVED") ? "#/approved" : "#/order";
        });
    } catch (e) {
      Swal.fire({ icon: "error", title: "เข้าสู่ระบบไม่สำเร็จ", text: e.message });
    } finally {
      btn && (btn.disabled = false);
    }
  }

  if (btn) btn.addEventListener("click", doLogin);
}
