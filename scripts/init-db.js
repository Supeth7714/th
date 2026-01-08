const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'inventory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 브자재 마스터 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS raw_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      specification TEXT,
      unit VARCHAR(20) NOT NULL,
      standard_price DECIMAL(10,2),
      safety_stock INTEGER DEFAULT 0,
      current_stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 공급업체 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      contact_person VARCHAR(100),
      phone VARCHAR(20),
      email VARCHAR(100),
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 발주 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no VARCHAR(50) UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      order_date DATE NOT NULL,
      expected_date DATE,
      status VARCHAR(20) DEFAULT 'pending',
      total_amount DECIMAL(12,2),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )
  `);

  // 발주 상세 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2),
      amount DECIMAL(12,2),
      received_quantity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES purchase_orders(id),
      FOREIGN KEY (material_id) REFERENCES raw_materials(id)
    )
  `);

  // 입고 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS receiving_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receiving_no VARCHAR(50) UNIQUE NOT NULL,
      order_id INTEGER NOT NULL,
      receiving_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'completed',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES purchase_orders(id)
    )
  `);

  // 입고 상세 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS receiving_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receiving_id INTEGER NOT NULL,
      order_item_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      inspection_result VARCHAR(20) DEFAULT 'pass',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (receiving_id) REFERENCES receiving_records(id),
      FOREIGN KEY (order_item_id) REFERENCES purchase_order_items(id),
      FOREIGN KEY (material_id) REFERENCES raw_materials(id)
    )
  `);

  // 재고 이력 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      transaction_type VARCHAR(20) NOT NULL,
      quantity INTEGER NOT NULL,
      reference_type VARCHAR(50),
      reference_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES raw_materials(id)
    )
  `, (err) => {
    if (err) {
      console.error('데이터베이스 초기화 오류:', err);
    } else {
      console.log('데이터베이스가 성공적으로 초기화되었습니다.');

      // 샘플 데이터 추가
      insertSampleData();
    }
  });
});

function insertSampleData() {
  // 샘플 브자재
  db.run(`INSERT OR IGNORE INTO raw_materials (code, name, specification, unit, standard_price, safety_stock, current_stock)
          VALUES ('RM001', '강판', 'SUS304 2.0T', 'KG', 5000, 100, 150)`);
  db.run(`INSERT OR IGNORE INTO raw_materials (code, name, specification, unit, standard_price, safety_stock, current_stock)
          VALUES ('RM002', '알루미늄 프로파일', '40x40 6063', 'M', 8000, 50, 80)`);
  db.run(`INSERT OR IGNORE INTO raw_materials (code, name, specification, unit, standard_price, safety_stock, current_stock)
          VALUES ('RM003', '볼트', 'M8x20 SUS', 'EA', 100, 500, 1200)`);

  // 샘플 공급업체
  db.run(`INSERT OR IGNORE INTO suppliers (code, name, contact_person, phone, email)
          VALUES ('SUP001', '대한철강', '김철수', '02-1234-5678', 'steel@example.com')`);
  db.run(`INSERT OR IGNORE INTO suppliers (code, name, contact_person, phone, email)
          VALUES ('SUP002', '서울알루미늄', '이영희', '02-2345-6789', 'alu@example.com')`);

  console.log('샘플 데이터가 추가되었습니다.');
  db.close();
}
