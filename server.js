const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 데이터베이스 연결
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
  } else {
    console.log('데이터베이스에 연결되었습니다.');
  }
});

// ============ 부자재 API ============

// 부자재 목록 조회
app.get('/api/materials', (req, res) => {
  const query = 'SELECT * FROM raw_materials ORDER BY code';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 부자재 상세 조회
app.get('/api/materials/:id', (req, res) => {
  const query = 'SELECT * FROM raw_materials WHERE id = ?';
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// 부자재 추가
app.post('/api/materials', (req, res) => {
  const { code, name, specification, unit, standard_price, safety_stock } = req.body;
  const query = `INSERT INTO raw_materials (code, name, specification, unit, standard_price, safety_stock)
                 VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(query, [code, name, specification, unit, standard_price, safety_stock], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '부자재가 추가되었습니다.' });
  });
});

// 부자재 수정
app.put('/api/materials/:id', (req, res) => {
  const { code, name, specification, unit, standard_price, safety_stock } = req.body;
  const query = `UPDATE raw_materials
                 SET code = ?, name = ?, specification = ?, unit = ?,
                     standard_price = ?, safety_stock = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

  db.run(query, [code, name, specification, unit, standard_price, safety_stock, req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '부자재가 수정되었습니다.' });
  });
});

// 부자재 삭제
app.delete('/api/materials/:id', (req, res) => {
  const query = 'DELETE FROM raw_materials WHERE id = ?';
  db.run(query, [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '부자재가 삭제되었습니다.' });
  });
});

// ============ 공급업체 API ============

// 공급업체 목록 조회
app.get('/api/suppliers', (req, res) => {
  const query = 'SELECT * FROM suppliers ORDER BY code';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 공급업체 추가
app.post('/api/suppliers', (req, res) => {
  const { code, name, contact_person, phone, email, address, notes } = req.body;
  const query = `INSERT INTO suppliers (code, name, contact_person, phone, email, address, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [code, name, contact_person, phone, email, address, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '공급업체가 추가되었습니다.' });
  });
});

// 공급업체 수정
app.put('/api/suppliers/:id', (req, res) => {
  const { code, name, contact_person, phone, email, address, notes } = req.body;
  const query = `UPDATE suppliers
                 SET code = ?, name = ?, contact_person = ?, phone = ?,
                     email = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

  db.run(query, [code, name, contact_person, phone, email, address, notes, req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '공급업체가 수정되었습니다.' });
  });
});

// 공급업체 삭제
app.delete('/api/suppliers/:id', (req, res) => {
  const query = 'DELETE FROM suppliers WHERE id = ?';
  db.run(query, [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '공급업체가 삭제되었습니다.' });
  });
});

// ============ 발주 API ============

// 발주 목록 조회
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT po.*, s.name as supplier_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    ORDER BY po.order_date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 발주 상세 조회
app.get('/api/orders/:id', (req, res) => {
  const orderQuery = `
    SELECT po.*, s.name as supplier_name, s.phone as supplier_phone
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.id = ?
  `;

  const itemsQuery = `
    SELECT poi.*, rm.code as material_code, rm.name as material_name,
           rm.unit, rm.specification
    FROM purchase_order_items poi
    LEFT JOIN raw_materials rm ON poi.material_id = rm.id
    WHERE poi.order_id = ?
  `;

  db.get(orderQuery, [req.params.id], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.all(itemsQuery, [req.params.id], (err, items) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ ...order, items });
    });
  });
});

// 발주 생성
app.post('/api/orders', (req, res) => {
  const { order_no, supplier_id, order_date, expected_date, items, notes } = req.body;

  // 총액 계산
  const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const orderQuery = `INSERT INTO purchase_orders (order_no, supplier_id, order_date, expected_date, total_amount, notes, status)
                      VALUES (?, ?, ?, ?, ?, ?, 'pending')`;

  db.run(orderQuery, [order_no, supplier_id, order_date, expected_date, total_amount, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const orderId = this.lastID;

    // 발주 상세 항목 추가
    const itemQuery = `INSERT INTO purchase_order_items (order_id, material_id, quantity, unit_price, amount)
                       VALUES (?, ?, ?, ?, ?)`;

    let completed = 0;
    items.forEach(item => {
      const amount = item.quantity * item.unit_price;
      db.run(itemQuery, [orderId, item.material_id, item.quantity, item.unit_price, amount], (err) => {
        if (err) {
          console.error('항목 추가 오류:', err);
        }
        completed++;
        if (completed === items.length) {
          res.json({ id: orderId, message: '발주가 생성되었습니다.' });
        }
      });
    });
  });
});

// 발주 상태 변경
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const query = 'UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

  db.run(query, [status, req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '발주 상태가 변경되었습니다.' });
  });
});

// ============ 입고 API ============

// 입고 목록 조회
app.get('/api/receiving', (req, res) => {
  const query = `
    SELECT rr.*, po.order_no, s.name as supplier_name
    FROM receiving_records rr
    LEFT JOIN purchase_orders po ON rr.order_id = po.id
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    ORDER BY rr.receiving_date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 입고 처리
app.post('/api/receiving', (req, res) => {
  const { receiving_no, order_id, receiving_date, items, notes } = req.body;

  const receivingQuery = `INSERT INTO receiving_records (receiving_no, order_id, receiving_date, notes, status)
                          VALUES (?, ?, ?, ?, 'completed')`;

  db.run(receivingQuery, [receiving_no, order_id, receiving_date, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const receivingId = this.lastID;

    // 입고 상세 항목 추가 및 재고 업데이트
    let completed = 0;
    items.forEach(item => {
      // 입고 상세 추가
      const itemQuery = `INSERT INTO receiving_items (receiving_id, order_item_id, material_id, quantity, inspection_result, notes)
                         VALUES (?, ?, ?, ?, ?, ?)`;

      db.run(itemQuery, [receivingId, item.order_item_id, item.material_id, item.quantity, item.inspection_result || 'pass', item.notes], (err) => {
        if (err) {
          console.error('입고 항목 추가 오류:', err);
          return;
        }

        // 재고 업데이트
        const updateStockQuery = `UPDATE raw_materials
                                  SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
                                  WHERE id = ?`;

        db.run(updateStockQuery, [item.quantity, item.material_id], (err) => {
          if (err) {
            console.error('재고 업데이트 오류:', err);
            return;
          }

          // 발주 항목의 입고 수량 업데이트
          const updateOrderItemQuery = `UPDATE purchase_order_items
                                        SET received_quantity = received_quantity + ?
                                        WHERE id = ?`;

          db.run(updateOrderItemQuery, [item.quantity, item.order_item_id], (err) => {
            if (err) {
              console.error('발주 항목 업데이트 오류:', err);
              return;
            }

            // 재고 이력 추가
            const transactionQuery = `INSERT INTO inventory_transactions (material_id, transaction_type, quantity, reference_type, reference_id)
                                      VALUES (?, 'receiving', ?, 'receiving_record', ?)`;

            db.run(transactionQuery, [item.material_id, item.quantity, receivingId], (err) => {
              if (err) {
                console.error('재고 이력 추가 오류:', err);
              }

              completed++;
              if (completed === items.length) {
                // 모든 항목이 입고되었는지 확인하고 발주 상태 업데이트
                checkAndUpdateOrderStatus(order_id);
                res.json({ id: receivingId, message: '입고가 처리되었습니다.' });
              }
            });
          });
        });
      });
    });
  });
});

// 발주의 모든 항목이 입고되었는지 확인하고 상태 업데이트
function checkAndUpdateOrderStatus(orderId) {
  const query = `
    SELECT
      SUM(quantity) as total_ordered,
      SUM(received_quantity) as total_received
    FROM purchase_order_items
    WHERE order_id = ?
  `;

  db.get(query, [orderId], (err, row) => {
    if (err || !row) return;

    let status = 'pending';
    if (row.total_received > 0 && row.total_received < row.total_ordered) {
      status = 'partial';
    } else if (row.total_received >= row.total_ordered) {
      status = 'completed';
    }

    db.run('UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, orderId]);
  });
}

// ============ 재고 API ============

// 재고 현황 조회
app.get('/api/inventory', (req, res) => {
  const query = `
    SELECT
      rm.*,
      CASE
        WHEN rm.current_stock < rm.safety_stock THEN 'low'
        WHEN rm.current_stock = 0 THEN 'out'
        ELSE 'normal'
      END as stock_status
    FROM raw_materials rm
    ORDER BY rm.code
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 재고 이력 조회
app.get('/api/inventory/:materialId/transactions', (req, res) => {
  const query = `
    SELECT * FROM inventory_transactions
    WHERE material_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `;

  db.all(query, [req.params.materialId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ============ 대시보드 API ============

app.get('/api/dashboard', (req, res) => {
  const stats = {};

  // 총 부자재 수
  db.get('SELECT COUNT(*) as count FROM raw_materials', [], (err, row) => {
    stats.totalMaterials = row ? row.count : 0;

    // 재고 부족 품목 수
    db.get('SELECT COUNT(*) as count FROM raw_materials WHERE current_stock < safety_stock', [], (err, row) => {
      stats.lowStockMaterials = row ? row.count : 0;

      // 진행 중인 발주 수
      db.get("SELECT COUNT(*) as count FROM purchase_orders WHERE status IN ('pending', 'partial')", [], (err, row) => {
        stats.pendingOrders = row ? row.count : 0;

        // 총 공급업체 수
        db.get('SELECT COUNT(*) as count FROM suppliers', [], (err, row) => {
          stats.totalSuppliers = row ? row.count : 0;

          // 최근 입고 내역
          db.all(`
            SELECT rr.*, po.order_no, s.name as supplier_name
            FROM receiving_records rr
            LEFT JOIN purchase_orders po ON rr.order_id = po.id
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            ORDER BY rr.receiving_date DESC
            LIMIT 5
          `, [], (err, rows) => {
            stats.recentReceiving = rows || [];

            res.json(stats);
          });
        });
      });
    });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT} 에서 접속하세요.`);
});
