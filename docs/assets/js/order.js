import { apiCall } from './api.js';
import { getSession } from './app.js';

function showSavingOverlay(text = 'กำลังบันทึกคำสั่งซื้อ...') {
  const el = document.createElement('div');
  el.className = 'saving-overlay';
  el.innerHTML = `
    <div class="saving-box">
      <div class="saving-spinner"></div>
      <div class="fw-bold">${text}</div>
      <div class="text-muted small mt-1">กรุณารอสักครู่</div>
    </div>
  `;
  document.body.appendChild(el);
  return () => { try { el.remove(); } catch(e) {} };
}

function validHN(hn) {
  // required: 07-YY-XXXXXX
  return /^07-\d{2}-\d{6}$/.test(String(hn || '').trim());
}

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
              <input type="text" class="form-control" id="hn" placeholder="07-YY-XXXXXX" required />
              <div class="form-text">รูปแบบ: 07-24-200910</div>
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

          <div class="mb-4">
            <label class="form-label required">เลือกเมนูอาหาร</label>
            <div class="row g-3" id="menuGrid">
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card menu-card h-100" data-menu="tuna" tabindex="0">
                  <div class="card-body text-center">
                    <img src="https://lh5.googleusercontent.com/d/1uTmKYLAg_IbRC5BHrWLPZoK5uoV9Zl8R" class="item-img mb-2" alt="แซนวิชทูน่า">
                    <h6 class="menu-title">แซนวิชทูน่า</h6>
                    <div class="form-check d-flex justify-content-center mt-2">
                      <input class="form-check-input" type="radio" name="menu" id="menu_tuna" value="tuna" />
                      <label class="form-check-label ms-2" for="menu_tuna">เลือกเมนูนี้</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card menu-card h-100" data-menu="fish" tabindex="0">
                  <div class="card-body text-center">
                    <img src="https://lh5.googleusercontent.com/d/1Nodesn5nR89y6A5w2XuD40hfOhxP7txv" class="item-img mb-2" alt="ข้าวต้มปลา">
                    <h6 class="menu-title">ข้าวต้มปลา</h6>
                    <div class="form-check d-flex justify-content-center mt-2">
                      <input class="form-check-input" type="radio" name="menu" id="menu_fish" value="fish" />
                      <label class="form-check-label ms-2" for="menu_fish">เลือกเมนูนี้</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card menu-card h-100" data-menu="chicken" tabindex="0">
                  <div class="card-body text-center">
                    <img src="https://lh5.googleusercontent.com/d/1t28JyyYQVT5G_w0Oe8QtxI8skbSAVXaw" class="item-img mb-2" alt="ข้าวต้มไก่">
                    <h6 class="menu-title">ข้าวต้มไก่</h6>
                    <div class="form-check d-flex justify-content-center mt-2">
                      <input class="form-check-input" type="radio" name="menu" id="menu_chicken" value="chicken" />
                      <label class="form-check-label ms-2" for="menu_chicken">เลือกเมนูนี้</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card menu-card h-100" data-menu="shrimp" tabindex="0">
                  <div class="card-body text-center">
                    <img src="https://lh5.googleusercontent.com/d/1DHhY5cz81ONOID39tBUFrMcySAgCM_5I" class="item-img mb-2" alt="ข้าวต้มกุ้ง">
                    <h6 class="menu-title">ข้าวต้มกุ้ง</h6>
                    <div class="form-check d-flex justify-content-center mt-2">
                      <input class="form-check-input" type="radio" name="menu" id="menu_shrimp" value="shrimp" />
                      <label class="form-check-label ms-2" for="menu_shrimp">เลือกเมนูนี้</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="card menu-card" data-menu="custom" tabindex="0">
                  <div class="card-body">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                      <div class="form-check me-1">
                        <input class="form-check-input" type="radio" name="menu" id="menu_custom" value="custom" />
                        <label class="form-check-label" for="menu_custom">ต้องการระบุเมนูอื่นๆ</label>
                      </div>
                      <input type="text" class="form-control" id="customName" placeholder="กรุณาระบุชื่อเมนู" style="max-width:340px" disabled />
                    </div>
                    <small class="text-muted">กรุณาเลือกเมนูที่ต้องการ</small>
                  </div>
                </div>
              </div>
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

  root.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('meal_session');
    window.location.hash = '#/login';
  });

  apiCall('order.getDepartments').then(list => {
    const sel = root.querySelector('#department');
    sel.innerHTML = '';
    list.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
    const idx = list.indexOf(session.user.department);
    if (idx >= 0) sel.selectedIndex = idx;
  }).catch(err => {
    alert('โหลดแผนกไม่สำเร็จ: ' + err.message);
  });

  root.querySelector('#requester').value = session.user.name || '';

  // Menu cards UX
  const customInput = root.querySelector('#customName');
  const radios = root.querySelectorAll('input[name="menu"]');
  const menuCards = root.querySelectorAll('.menu-card');

  function updateMenuCardSelection(){
    menuCards.forEach(card => {
      const r = card.querySelector('input[name="menu"]');
      card.classList.toggle('selected', !!(r && r.checked));
    });
  }
  function wireCardClick(){
    menuCards.forEach(card => {
      card.addEventListener('click', (ev) => {
        const tag = String((ev.target && ev.target.tagName) || '').toLowerCase();
        if (['input','label','textarea','select','button','a'].includes(tag)) return;
        const radio = card.querySelector('input[name="menu"]');
        if (radio){
          radio.checked = true;
          radio.dispatchEvent(new Event('change', {bubbles:true}));
        }
      });
    });
  }
  radios.forEach(r => {
    r.addEventListener('change', () => {
      if (r.value === 'custom' && r.checked) {
        customInput.disabled = false;
        customInput.focus();
      } else {
        customInput.disabled = true;
        customInput.value = '';
      }
      updateMenuCardSelection();
    });
  });
  wireCardClick();
  updateMenuCardSelection();

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
    if (!validHN(hn)) {
      alert('รูปแบบ HN ไม่ถูกต้อง (ต้องเป็น 07-YY-XXXXXX เช่น 07-24-200910)');
      return;
    }
    if (menuVal === 'custom' && !customName) {
      alert('กรุณาระบุชื่อเมนู (custom)');
      return;
    }

    const submitBtn = root.querySelector('#orderForm button[type="submit"]');
    submitBtn.disabled = true;
    const hideOverlay = showSavingOverlay('กำลังบันทึกคำสั่งซื้อ...');

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
      hideOverlay();
      alert('บันทึกสำเร็จ');
      e.target.reset();
      customInput.disabled = true;
      updateMenuCardSelection();
    } catch (err) {
      hideOverlay();
      alert('เกิดข้อผิดพลาด: ' + (err && err.message ? err.message : String(err)));
    } finally {
      submitBtn.disabled = false;
    }
  });
}
