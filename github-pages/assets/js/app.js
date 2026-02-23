// app.js
import { mountLogin } from "./login.js";
import { mountOrder } from "./order.js";
import { mountLogout } from "./logout.js";
import { mountApproved } from "./approved.js";
import { installGasShim } from "./gas-shim.js";
import { getSession } from "./api.js";

const routes = {
  "#/login": mountLogin,
  "#/order": mountOrder,
  "#/logout": mountLogout,
  "#/approved": mountApproved,
};

function render() {
  const hash = window.location.hash || "#/login";
  const mountFn = routes[hash] || routes["#/login"];
  const app = document.getElementById("app");
  app.innerHTML = "";
  mountFn(app);

  // basic guard
  const sess = getSession();
  if ((hash === "#/order" || hash === "#/approved") && !sess?.token) {
    window.location.hash = "#/login";
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("load", () => {
  installGasShim();
  const sess = getSession();
  if (sess?.token) {
    // remember last route
    if (!window.location.hash || window.location.hash === "#/login") {
      window.location.hash = sess.role === "APPROVED" ? "#/approved" : "#/order";
    }
  } else {
    if (!window.location.hash) window.location.hash = "#/login";
  }
  render();
});
