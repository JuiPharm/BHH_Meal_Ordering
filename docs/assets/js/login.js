// login.js
import { apiPost, setSession } from "./api.js";

export function mountLogin(root) {
  const tpl = document.getElementById("tpl-login");
  root.appendChild(tpl.content.cloneNode(true));

  const form = root.querySelector("#loginForm");
  const btn = root.querySelector("#btnLogin");
  const userEl = root.querySelector("#username");
  const passEl = root.querySelector("#password");
  const rememberEl = root.querySelector("#rememberMe");
  const spin = root.querySelector("#spin");
  const btnText = root.querySelector("#btnText");

  // restore remembered username
  try{
    const remembered = localStorage.getItem("bh_meal_remembered_username");
    if (remembered && userEl) userEl.value = remembered;
  }catch(_){}

  async function doLogin() {
    const username = (userEl?.value || "").trim();
    const password = (passEl?.value || "").trim();
    const remember = !!rememberEl?.checked;

    if (!username || !password) {
      Swal.fire({ icon: "warning", title: "กรุณากรอก Username และ Password" });
      return;
    }

    try {
      btn.disabled = true;
      if (spin) spin.style.display = "inline-block";
      if (btnText) btnText.textContent = "กำลังเข้าสู่ระบบ...";

      const r = await apiPost("auth.login", { username, password });

      try{
        if (remember) localStorage.setItem("bh_meal_remembered_username", username);
        else localStorage.removeItem("bh_meal_remembered_username");
      }catch(_){}

      setSession({ token: r.data.token, user: r.data.user, role: r.data.user.role });

      Swal.fire({ icon: "success", title: "เข้าสู่ระบบสำเร็จ", timer: 900, showConfirmButton: false })
        .then(() => {
          window.location.hash = (r.data.user.role === "APPROVED") ? "#/approved" : "#/order";
        });
    } catch (e) {
      Swal.fire({ icon: "error", title: "เข้าสู่ระบบไม่สำเร็จ", text: e.message });
    } finally {
      btn.disabled = false;
      if (spin) spin.style.display = "none";
      if (btnText) btnText.textContent = "เข้าสู่ระบบ";
    }
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    doLogin();
  });
}
