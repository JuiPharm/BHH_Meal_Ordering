// order.js
import { apiPost, getSession, clearSession } from "./api.js";

export function mountOrder(root) {
  const tpl = document.getElementById("tpl-order");
  root.appendChild(tpl.content.cloneNode(true));

  const sess = getSession();
  const token = sess?.token;
  const user = sess?.user || {};

  // map some common fields used in the original template
  const elRequester = root.querySelector("#requester") || root.querySelector("input[name=requester]");
  const elDept = root.querySelector("#department");
  if (elRequester && user.name) elRequester.value = user.name;

  // load departments
  (async () => {
    try {
      const r = await apiPost("order.getDepartments", {}, token);
      if (elDept) {
        elDept.innerHTML = "";
        for (const dep of r.data.departments) {
          const opt = document.createElement("option");
          opt.value = dep;
          opt.textContent = dep;
          elDept.appendChild(opt);
        }
        if (user.department) elDept.value = user.department;
      }
    } catch (e) {
      console.error(e);
    }
  })();

  // logout link/button if present
  const logoutBtn = root.querySelector("#btnLogout");
  if (logoutBtn) logoutBtn.addEventListener("click", () => { clearSession(); window.location.hash = "#/login"; });

  // submit order
  const submitBtn = root.querySelector("#btnSubmit") || root.querySelector("button[type=submit]");
  const form = root.querySelector("form");
  if (form) form.addEventListener("submit", (e) => e.preventDefault());

  async function gatherPayload() {
    // Try to align with original IDs
    const hn = (root.querySelector("#hn")?.value || "").trim();
    const fullname = (root.querySelector("#fullname")?.value || "").trim();
    const dob = (root.querySelector("#dob")?.value || "").trim();
    const department = (elDept?.value || "").trim();
    const requester = (elRequester?.value || "").trim();
    const note = (root.querySelector("#note")?.value || "").trim();
    const customName = (root.querySelector("#customName")?.value || "").trim();

    // menus: take any checked radio/checkbox with name=menu or data-menu
    let menu = "";
    const checked = root.querySelector("input[name=menu]:checked") || root.querySelector("input[data-menu]:checked");
    if (checked) menu = checked.value || checked.getAttribute("data-menu") || "";

    // Fallback: if template uses clickable cards with hidden input
    if (!menu) {
      const el = root.querySelector("input#selectedMenu");
      if (el) menu = el.value;
    }

    return { hn, fullname, dob, department, requester, note, customName, menu };
  }

  async function doSubmit() {
    try {
      submitBtn && (submitBtn.disabled = true);
      const payload = await gatherPayload();
      const r = await apiPost("order.create", { payload }, token);
      Swal.fire({ icon: "success", title: "บันทึกออเดอร์สำเร็จ", text: `Order ID: ${r.data.id}` });

      // reset some fields
      ["#hn","#fullname","#dob","#note","#customName"].forEach(sel => { const el=root.querySelector(sel); if (el) el.value=""; });
      const chk = root.querySelector("input[name=menu]:checked"); if (chk) chk.checked=false;
    } catch (e) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: e.message });
    } finally {
      submitBtn && (submitBtn.disabled = false);
    }
  }

  if (submitBtn) submitBtn.addEventListener("click", doSubmit);
}
