const API_BASE = 'http://localhost:3000/api';

// 페이지 전환
function showPage(pageId) {
  // 모든 페이지 숨기기
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // 모든 네비게이션 링크 비활성화
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // 선택한 페이지 표시
  document.getElementById(pageId).classList.add('active');

  // 선택한 네비게이션 링크 활성화
  document.querySelector(`a[href="#${pageId}"]`).classList.add('active');

  // 페이지별 데이터 로드
  switch(pageId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'materials':
      loadMaterials();
      break;
    case 'suppliers':
      loadSuppliers();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'receiving':
      loadReceiving();
      break;
    case 'inventory':
      loadInventory();
      break;
  }
}

// ============ 대시보드 ============

async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`);
    const data = await response.json();

    document.getElementById('stat-total-materials').textContent = data.totalMaterials;
    document.getElementById('stat-low-stock').textContent = data.lowStockMaterials;
    document.getElementById('stat-pending-orders').textContent = data.pendingOrders;
    document.getElementById('stat-suppliers').textContent = data.totalSuppliers;

    const tbody = document.getElementById('recent-receiving-list');
    if (data.recentReceiving.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">최근 입고 내역이 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = data.recentReceiving.map(r => `
        <tr>
          <td>${r.receiving_no}</td>
          <td>${r.order_no}</td>
          <td>${r.supplier_name}</td>
          <td>${r.receiving_date}</td>
          <td><span class="status-badge status-${r.status}">${getStatusText(r.status)}</span></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('대시보드 로드 오류:', error);
  }
}

// ============ 브자재 관리 ============

async function loadMaterials() {
  try {
    const response = await fetch(`${API_BASE}/materials`);
    const materials = await response.json();

    const tbody = document.getElementById('materials-list');
    if (materials.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">등록된 브자재가 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = materials.map(m => `
        <tr>
          <td>${m.code}</td>
          <td>${m.name}</td>
          <td>${m.specification || '-'}</td>
          <td>${m.unit}</td>
          <td>${formatNumber(m.standard_price)}</td>
          <td>${m.safety_stock}</td>
          <td>${m.current_stock}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-small btn-primary" onclick="editMaterial(${m.id})">수정</button>
              <button class="btn btn-small btn-danger" onclick="deleteMaterial(${m.id})">삭제</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('브자재 로드 오류:', error);
  }
}

function showMaterialForm() {
  document.getElementById('material-form').style.display = 'block';
  document.getElementById('material-form-title').textContent = '브자재 추가';
  document.getElementById('materialForm').reset();
  document.getElementById('material-id').value = '';
}

function hideMaterialForm() {
  document.getElementById('material-form').style.display = 'none';
  document.getElementById('materialForm').reset();
}

async function editMaterial(id) {
  try {
    const response = await fetch(`${API_BASE}/materials/${id}`);
    const material = await response.json();

    document.getElementById('material-form').style.display = 'block';
    document.getElementById('material-form-title').textContent = '브자재 수정';
    document.getElementById('material-id').value = material.id;
    document.getElementById('material-code').value = material.code;
    document.getElementById('material-name').value = material.name;
    document.getElementById('material-spec').value = material.specification || '';
    document.getElementById('material-unit').value = material.unit;
    document.getElementById('material-price').value = material.standard_price || '';
    document.getElementById('material-safety-stock').value = material.safety_stock || '';
  } catch (error) {
    console.error('브자재 로드 오류:', error);
  }
}

async function deleteMaterial(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    alert(result.message);
    loadMaterials();
  } catch (error) {
    console.error('브자재 삭제 오류:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

document.getElementById('materialForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('material-id').value;
  const data = {
    code: document.getElementById('material-code').value,
    name: document.getElementById('material-name').value,
    specification: document.getElementById('material-spec').value,
    unit: document.getElementById('material-unit').value,
    standard_price: document.getElementById('material-price').value || null,
    safety_stock: document.getElementById('material-safety-stock').value || 0
  };

  try {
    const url = id ? `${API_BASE}/materials/${id}` : `${API_BASE}/materials`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);
    hideMaterialForm();
    loadMaterials();
  } catch (error) {
    console.error('브자재 저장 오류:', error);
    alert('저장 중 오류가 발생했습니다.');
  }
});

// ============ 공급업체 관리 ============

async function loadSuppliers() {
  try {
    const response = await fetch(`${API_BASE}/suppliers`);
    const suppliers = await response.json();

    const tbody = document.getElementById('suppliers-list');
    if (suppliers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">등록된 공급업체가 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = suppliers.map(s => `
        <tr>
          <td>${s.code}</td>
          <td>${s.name}</td>
          <td>${s.contact_person || '-'}</td>
          <td>${s.phone || '-'}</td>
          <td>${s.email || '-'}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-small btn-primary" onclick="editSupplier(${s.id})">수정</button>
              <button class="btn btn-small btn-danger" onclick="deleteSupplier(${s.id})">삭제</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('공급업체 로드 오류:', error);
  }
}

function showSupplierForm() {
  document.getElementById('supplier-form').style.display = 'block';
  document.getElementById('supplier-form-title').textContent = '공급업체 추가';
  document.getElementById('supplierForm').reset();
  document.getElementById('supplier-id').value = '';
}

function hideSupplierForm() {
  document.getElementById('supplier-form').style.display = 'none';
  document.getElementById('supplierForm').reset();
}

async function editSupplier(id) {
  try {
    const response = await fetch(`${API_BASE}/suppliers/${id}`);
    const supplier = await response.json();

    document.getElementById('supplier-form').style.display = 'block';
    document.getElementById('supplier-form-title').textContent = '공급업체 수정';
    document.getElementById('supplier-id').value = supplier.id;
    document.getElementById('supplier-code').value = supplier.code;
    document.getElementById('supplier-name').value = supplier.name;
    document.getElementById('supplier-contact').value = supplier.contact_person || '';
    document.getElementById('supplier-phone').value = supplier.phone || '';
    document.getElementById('supplier-email').value = supplier.email || '';
    document.getElementById('supplier-address').value = supplier.address || '';
    document.getElementById('supplier-notes').value = supplier.notes || '';
  } catch (error) {
    console.error('공급업체 로드 오류:', error);
  }
}

async function deleteSupplier(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    alert(result.message);
    loadSuppliers();
  } catch (error) {
    console.error('공급업체 삭제 오류:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('supplier-id').value;
  const data = {
    code: document.getElementById('supplier-code').value,
    name: document.getElementById('supplier-name').value,
    contact_person: document.getElementById('supplier-contact').value,
    phone: document.getElementById('supplier-phone').value,
    email: document.getElementById('supplier-email').value,
    address: document.getElementById('supplier-address').value,
    notes: document.getElementById('supplier-notes').value
  };

  try {
    const url = id ? `${API_BASE}/suppliers/${id}` : `${API_BASE}/suppliers`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);
    hideSupplierForm();
    loadSuppliers();
  } catch (error) {
    console.error('공급업체 저장 오류:', error);
    alert('저장 중 오류가 발생했습니다.');
  }
});

// ============ 발주 관리 ============

let orderItems = [];
let allMaterials = [];
let allSuppliers = [];

async function loadOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders`);
    const orders = await response.json();

    const tbody = document.getElementById('orders-list');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">등록된 발주가 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = orders.map(o => `
        <tr>
          <td>${o.order_no}</td>
          <td>${o.supplier_name}</td>
          <td>${o.order_date}</td>
          <td>${o.expected_date || '-'}</td>
          <td>${formatNumber(o.total_amount)}</td>
          <td><span class="status-badge status-${o.status}">${getStatusText(o.status)}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-small btn-primary" onclick="viewOrder(${o.id})">상세</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('발주 로드 오류:', error);
  }
}

async function showOrderForm() {
  document.getElementById('order-form').style.display = 'block';
  document.getElementById('orderForm').reset();
  orderItems = [];

  // 오늘 날짜 설정
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('order-date').value = today;

  // 발주번호 자동 생성
  document.getElementById('order-no').value = `PO${Date.now()}`;

  // 공급업체 목록 로드
  if (allSuppliers.length === 0) {
    const response = await fetch(`${API_BASE}/suppliers`);
    allSuppliers = await response.json();
  }

  const supplierSelect = document.getElementById('order-supplier');
  supplierSelect.innerHTML = '<option value="">선택하세요</option>' +
    allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  // 브자재 목록 로드
  if (allMaterials.length === 0) {
    const response = await fetch(`${API_BASE}/materials`);
    allMaterials = await response.json();
  }

  renderOrderItems();
}

function hideOrderForm() {
  document.getElementById('order-form').style.display = 'none';
  orderItems = [];
}

function addOrderItem() {
  orderItems.push({
    material_id: '',
    quantity: 1,
    unit_price: 0
  });
  renderOrderItems();
}

function removeOrderItem(index) {
  orderItems.splice(index, 1);
  renderOrderItems();
}

function updateOrderItem(index, field, value) {
  orderItems[index][field] = value;
  calculateTotalAmount();
}

function renderOrderItems() {
  const tbody = document.getElementById('order-items-list');

  if (orderItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">+ 추가 버튼을 눌러 항목을 추가하세요</td></tr>';
  } else {
    tbody.innerHTML = orderItems.map((item, index) => {
      const amount = item.quantity * item.unit_price;
      return `
        <tr>
          <td>
            <select onchange="updateOrderItem(${index}, 'material_id', this.value)" required>
              <option value="">선택하세요</option>
              ${allMaterials.map(m => `
                <option value="${m.id}" ${item.material_id == m.id ? 'selected' : ''}>
                  ${m.code} - ${m.name}
                </option>
              `).join('')}
            </select>
          </td>
          <td><input type="number" value="${item.quantity}" onchange="updateOrderItem(${index}, 'quantity', this.value)" required min="1"></td>
          <td><input type="number" value="${item.unit_price}" onchange="updateOrderItem(${index}, 'unit_price', this.value)" required min="0" step="0.01"></td>
          <td>${formatNumber(amount)}</td>
          <td>
            <button type="button" class="btn btn-small btn-danger" onclick="removeOrderItem(${index})">삭제</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  calculateTotalAmount();
}

function calculateTotalAmount() {
  const total = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  document.getElementById('order-total-amount').textContent = formatNumber(total);
}

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (orderItems.length === 0) {
    alert('발주 항목을 추가해주세요.');
    return;
  }

  const data = {
    order_no: document.getElementById('order-no').value,
    supplier_id: document.getElementById('order-supplier').value,
    order_date: document.getElementById('order-date').value,
    expected_date: document.getElementById('order-expected-date').value,
    notes: document.getElementById('order-notes').value,
    items: orderItems
  };

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);
    hideOrderForm();
    loadOrders();
  } catch (error) {
    console.error('발주 생성 오류:', error);
    alert('발주 생성 중 오류가 발생했습니다.');
  }
});

async function viewOrder(id) {
  try {
    const response = await fetch(`${API_BASE}/orders/${id}`);
    const order = await response.json();

    let details = `발주번호: ${order.order_no}\n`;
    details += `공급업체: ${order.supplier_name}\n`;
    details += `발주일자: ${order.order_date}\n`;
    details += `납기예정일: ${order.expected_date || '-'}\n`;
    details += `상태: ${getStatusText(order.status)}\n\n`;
    details += `발주 항목:\n`;

    order.items.forEach(item => {
      details += `- ${item.material_name} (${item.material_code})\n`;
      details += `  수량: ${item.quantity} ${item.unit}, 단가: ${formatNumber(item.unit_price)}, 금액: ${formatNumber(item.amount)}\n`;
      details += `  입고완료: ${item.received_quantity} ${item.unit}\n`;
    });

    details += `\n총액: ${formatNumber(order.total_amount)}원`;

    alert(details);
  } catch (error) {
    console.error('발주 상세 조회 오류:', error);
  }
}

// ============ 입고 관리 ============

let receivingItems = [];
let pendingOrders = [];

async function loadReceiving() {
  try {
    const response = await fetch(`${API_BASE}/receiving`);
    const receiving = await response.json();

    const tbody = document.getElementById('receiving-list');
    if (receiving.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">등록된 입고 내역이 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = receiving.map(r => `
        <tr>
          <td>${r.receiving_no}</td>
          <td>${r.order_no}</td>
          <td>${r.supplier_name}</td>
          <td>${r.receiving_date}</td>
          <td><span class="status-badge status-${r.status}">${getStatusText(r.status)}</span></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('입고 로드 오류:', error);
  }
}

async function showReceivingForm() {
  document.getElementById('receiving-form').style.display = 'block';
  document.getElementById('receivingForm').reset();
  receivingItems = [];

  // 오늘 날짜 설정
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('receiving-date').value = today;

  // 입고번호 자동 생성
  document.getElementById('receiving-no').value = `RC${Date.now()}`;

  // 진행 중인 발주 목록 로드
  const response = await fetch(`${API_BASE}/orders`);
  const allOrders = await response.json();
  pendingOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'partial');

  const orderSelect = document.getElementById('receiving-order');
  orderSelect.innerHTML = '<option value="">선택하세요</option>' +
    pendingOrders.map(o => `<option value="${o.id}">${o.order_no} - ${o.supplier_name}</option>`).join('');
}

function hideReceivingForm() {
  document.getElementById('receiving-form').style.display = 'none';
  receivingItems = [];
}

async function loadOrderItems() {
  const orderId = document.getElementById('receiving-order').value;
  if (!orderId) {
    document.getElementById('receiving-items-list').innerHTML = '<tr><td colspan="5">발주를 선택하세요</td></tr>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`);
    const order = await response.json();

    receivingItems = order.items.map(item => ({
      order_item_id: item.id,
      material_id: item.material_id,
      material_name: `${item.material_code} - ${item.material_name}`,
      unit: item.unit,
      order_quantity: item.quantity,
      received_quantity: item.received_quantity,
      quantity: item.quantity - item.received_quantity,
      inspection_result: 'pass',
      notes: ''
    }));

    renderReceivingItems();
  } catch (error) {
    console.error('발주 항목 로드 오류:', error);
  }
}

function renderReceivingItems() {
  const tbody = document.getElementById('receiving-items-list');

  if (receivingItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">발주 항목이 없습니다</td></tr>';
  } else {
    tbody.innerHTML = receivingItems.map((item, index) => `
      <tr>
        <td>${item.material_name}</td>
        <td>${item.order_quantity} ${item.unit}</td>
        <td>${item.received_quantity} ${item.unit}</td>
        <td><input type="number" value="${item.quantity}" onchange="receivingItems[${index}].quantity = this.value" min="0" max="${item.order_quantity - item.received_quantity}" required></td>
        <td>
          <select onchange="receivingItems[${index}].inspection_result = this.value">
            <option value="pass">합격</option>
            <option value="fail">불합격</option>
          </select>
        </td>
      </tr>
    `).join('');
  }
}

document.getElementById('receivingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (receivingItems.length === 0) {
    alert('입고 항목이 없습니다.');
    return;
  }

  const data = {
    receiving_no: document.getElementById('receiving-no').value,
    order_id: document.getElementById('receiving-order').value,
    receiving_date: document.getElementById('receiving-date').value,
    notes: document.getElementById('receiving-notes').value,
    items: receivingItems.filter(item => item.quantity > 0)
  };

  if (data.items.length === 0) {
    alert('입고 수량을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/receiving`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);
    hideReceivingForm();
    loadReceiving();
  } catch (error) {
    console.error('입고 처리 오류:', error);
    alert('입고 처리 중 오류가 발생했습니다.');
  }
});

// ============ 재고 현황 ============

async function loadInventory() {
  try {
    const response = await fetch(`${API_BASE}/inventory`);
    const inventory = await response.json();

    const tbody = document.getElementById('inventory-list');
    if (inventory.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">재고 데이터가 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = inventory.map(item => `
        <tr>
          <td>${item.code}</td>
          <td>${item.name}</td>
          <td>${item.specification || '-'}</td>
          <td>${item.unit}</td>
          <td>${item.current_stock}</td>
          <td>${item.safety_stock}</td>
          <td><span class="status-badge status-${item.stock_status}">${getStockStatusText(item.stock_status)}</span></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('재고 로드 오류:', error);
  }
}

// ============ 유틸리티 함수 ============

function formatNumber(num) {
  if (!num) return '0';
  return Number(num).toLocaleString('ko-KR');
}

function getStatusText(status) {
  const statusMap = {
    'pending': '대기중',
    'partial': '부분입고',
    'completed': '완료',
    'cancelled': '취소'
  };
  return statusMap[status] || status;
}

function getStockStatusText(status) {
  const statusMap = {
    'normal': '정상',
    'low': '부족',
    'out': '품절'
  };
  return statusMap[status] || status;
}

// 페이지 로드 시 대시보드 표시
document.addEventListener('DOMContentLoaded', () => {
  showPage('dashboard');
});
