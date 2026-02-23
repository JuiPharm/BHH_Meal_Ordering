import { apiCall } from './api.js';

// Render the approved (dashboard) page into root.
export function mountApproved(root) {
  const sessionStr = localStorage.getItem('meal_session');
  if (!sessionStr) {
    window.location.hash = '#/login';
    return;
  }
  const session = JSON.parse(sessionStr);
  const tpl = document.createElement('div');
  tpl.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#/approved"><i class="bi bi-hospital-fill me-2"></i>Approved Dashboard</a>
        <div class="ms-auto">
          <span class="text-white me-3">${session.user.name}</span>
          <button class="btn btn-light btn-sm" id="logoutBtn">ออกจากระบบ</button>
        </div>
      </div>
    </nav>
    <div class="container my-4">
      <h4 class="mb-3">รายการคำสั่งซื้อ</h4>
      <div id="pendingInfo" class="mb-2"></div>
      <table class="order-table" id="orderTable">
        <thead></thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  root.appendChild(tpl);
  root.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('meal_session');
    window.location.hash = '#/login';
  });
  // Load data
  function refresh() {
    Promise.all([
      apiCall('approved.list'),
      apiCall('approved.pendingCount')
    ]).then(([rows, pending]) => {
      const thead = root.querySelector('#orderTable thead');
      const tbody = root.querySelector('#orderTable tbody');
      thead.innerHTML = '';
      tbody.innerHTML = '';
      // Insert headers
      const headers = ['Action','ID','สถานะ','วันที่','HN','ชื่อผู้ป่วย','วันเกิด','ประวัติแพ้ยา/อาหาร','โรคประจำตัว','ผู้สั่ง','แผนก','แซนวิชทูน่า','ข้าวต้มปลา','ข้าวต้มไก่','ข้าวต้มกุ้ง','เมนู Custom','รายละเอียดอื่น','เวลารับ Order','Staff รับ Order','เวลาเตรียม','Staff เตรียม Order','เวลารับ Order ของ Department','Staff รับ Order ของ Department'];
      const trh = document.createElement('tr');
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      // Insert rows
      rows.forEach((r, idx) => {
        const tr = document.createElement('tr');
        // Build cells
        const status = r[1] || '';
        const actionTd = document.createElement('td');
        // Determine button
        if (!status || status.toLowerCase().includes('pending')) {
          const btn = document.createElement('button');
          btn.textContent = 'รับออเดอร์';
          btn.className = 'btn btn-warning btn-sm';
          btn.addEventListener('click', () => updateStep(idx, 0));
          actionTd.appendChild(btn);
        } else if (status.includes('Food House รับ Order')) {
          const btn = document.createElement('button');
          btn.textContent = 'เตรียมเสร็จ';
          btn.className = 'btn btn-primary btn-sm';
          btn.addEventListener('click', () => updateStep(idx, 1));
          actionTd.appendChild(btn);
        } else if (status.includes('Food House เตรียมอาหารเสร็จแล้ว')) {
          const btn = document.createElement('button');
          btn.textContent = 'หน่วยงานรับแล้ว';
          btn.className = 'btn btn-success btn-sm';
          btn.addEventListener('click', () => updateStep(idx, 2));
          actionTd.appendChild(btn);
        } else {
          actionTd.textContent = '-';
        }
        tr.appendChild(actionTd);
        // ID column (first element of row)
        const tdId = document.createElement('td');
        tdId.textContent = r[0];
        tr.appendChild(tdId);
        // Append remaining cells
        for (let i = 1; i < r.length; i++) {
          const td = document.createElement('td');
          td.textContent = r[i];
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });
      // Pending info
      root.querySelector('#pendingInfo').textContent = pending > 0 ? `🔔 รอดำเนินการ: ${pending} รายการ` : '';
    }).catch(err => {
      alert('โหลดข้อมูลไม่สำเร็จ: ' + err.message);
    });
  }
  // Update step
  function updateStep(rowIndex, step) {
    const staffName = prompt('กรุณากรอกชื่อผู้รับผิดชอบ');
    if (!staffName) return;
    apiCall('approved.updateStep', { id: rowIndex, step, staffName }).then(() => {
      refresh();
    }).catch(err => {
      alert('อัปเดตไม่สำเร็จ: ' + err.message);
    });
  }
  // Initial load
  refresh();
}