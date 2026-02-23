import { apiCall } from './api.js';
import { getSession } from './app.js';

// Render the order form page into the given root element.
export function mountOrder(root) {
  const session = getSession();
  if (!session) {
    window.location.hash = '#/login';
    return;
  }
  const tpl = document.createElement('div');
  tpl.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#/order"><i class="bi bi-hospital-fill me-2"></i>Meal Ordering</a>
        <div class="ms-auto">
          <span class="text-white me-3">${session.user.name}</span>
          <button class="btn btn-light btn-sm" id="logoutBtn">ออกจากระบบ</button>
        </div>
      </div>
    </nav>
    <div class="container my-4">
      <div class="form-card">
        <h4 class="mb-4">ฟอร์มสั่งอาหารผู้ป่วย</h4>
        <form id="orderForm" class="mb-3">
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label required">HN</label>
            <input type="text" class="form-control" id="hn" placeholder="07-xx-xxxxxx" required />
          </div>
          <div class="col-md-6">
            <label class="form-label required">ชื่อ-นามสกุล</label>
            <input type="text" class="form-control" id="fullname" required />
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label required">วันเกิด (dd/mm/yyyy)</label>
            <input type="text" class="form-control" id="dob" placeholder="01/01/1970" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">โรคประจำตัว</label>
            <input type="text" class="form-control" id="comorb" />
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">ประวัติแพ้ยา/อาหาร</label>
          <textarea class="form-control" id="allergy" rows="2"></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label required">เลือกเมนูอาหาร</label>
          <div class="d-flex flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="menu" id="menu_tuna" value="tuna" />
              <label class="form-check-label" for="menu_tuna">แซนวิชทูน่า</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="menu" id="menu_fish" value="fish" />
              <label class="form-check-label" for="menu_fish">ข้าวต้มปลา</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="menu" id="menu_chicken" value="chicken" />
              <label class="form-check-label" for="menu_chicken">ข้าวต้มไก่</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="menu" id="menu_shrimp" value="shrimp" />
              <label class="form-check-label" for="menu_shrimp">ข้าวต้มกุ้ง</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="menu" id="menu_custom" value="custom" />
              <label class="form-check-label" for="menu_custom">เมนูอื่นๆ</label>
            </div>
            <input type="text" class="form-control" id="customName" placeholder="ระบุชื่อเมนู" style="max-width:200px;" disabled />
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">หมายเหตุเพิ่มเติม</label>
          <textarea class="form-control" id="note" rows="2"></textarea>
        </div>
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label required">ผู้สั่ง</label>
            <input type="text" class="form-control" id="requester" required />
          </div>
          <div class="col-md-6">
            <label class="form-label required">แผนก</label>
            <select class="form-select" id="department" required>
              <option value="">กำลังโหลด...</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">บันทึกคำสั่งซื้อ</button>
        </form>
      </div>
    </div>
  `;
  root.appendChild(tpl);
  // Logout button
  root.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('meal_session');
    window.location.hash = '#/login';
  });
  // Load departments
  apiCall('order.getDepartments').then(list => {
    const sel = root.querySelector('#department');
    sel.innerHTML = '';
    list.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
    // Prefill user department
    const idx = list.indexOf(session.user.department);
    if (idx >= 0) sel.selectedIndex = idx;
  }).catch(err => {
    alert('โหลดแผนกไม่สำเร็จ: ' + err.message);
  });
  // Prefill requester
  root.querySelector('#requester').value = session.user.name || '';
  // Enable custom menu input
  const customInput = root.querySelector('#customName');
  const radios = root.querySelectorAll('input[name="menu"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      if (r.value === 'custom' && r.checked) {
        customInput.disabled = false;
        customInput.focus();
      } else {
        customInput.disabled = true;
        customInput.value = '';
      }
    });
  });
  // Form submit
  root.querySelector('#orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const hn = root.querySelector('#hn').value.trim();
    const fullname = root.querySelector('#fullname').value.trim();
    const dob = root.querySelector('#dob').value.trim();
    const comorb = root.querySelector('#comorb').value.trim();
    const allergy = root.querySelector('#allergy').value.trim();
    const menu = root.querySelector('input[name="menu"]:checked');
    const menuVal = menu ? menu.value : '';
    const customName = root.querySelector('#customName').value.trim();
    const note = root.querySelector('#note').value.trim();
    const requester = root.querySelector('#requester').value.trim();
    const department = root.querySelector('#department').value.trim();
    if (!hn || !fullname || !dob || !menuVal || !requester || !department) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (menuVal === 'custom' && !customName) {
      alert('กรุณาระบุชื่อเมนู (custom)');
      return;
    }
    try {
      await apiCall('order.create', {
        hn,
        fullname,
        dob,
        allergy,
        comorb,
        requester,
        department,
        menu: menuVal,
        customName,
        note
      });
      alert('บันทึกสำเร็จ');
      e.target.reset();
      customInput.disabled = true;
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  });
}