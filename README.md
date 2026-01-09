# 부자재 발주 입고 관리 시스템

부자재(원자재/부자재)의 발주, 입고, 재고를 효율적으로 관리하는 웹 기반 시스템입니다.

## 주요 기능

### 1. 대시보드
- 전체 현황 한눈에 파악
- 재고 부족 품목 모니터링
- 진행 중인 발주 현황
- 최근 입고 내역 확인

### 2. 부자재 관리
- 부자재 등록/수정/삭제
- 부자재 코드, 명칭, 규격, 단위 관리
- 표준단가 및 안전재고 설정
- 현재고 실시간 조회

### 3. 공급업체 관리
- 공급업체 정보 등록/수정/삭제
- 업체코드, 상호, 담당자 관리
- 연락처 정보 관리

### 4. 발주 관리
- 발주서 생성 및 관리
- 발주 상세 항목 관리
- 발주 상태 추적 (대기중/부분입고/완료)
- 발주 총액 자동 계산

### 5. 입고 관리
- 입고 처리 및 기록
- 검수 결과 관리
- 부분 입고 지원
- 재고 자동 업데이트

### 6. 재고 현황
- 전체 재고 현황 조회
- 재고 상태 표시 (정상/부족/품절)
- 안전재고 대비 현재고 비교

## 기술 스택

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **API**: RESTful API

## Windows 사용자를 위한 간편 설치 🪟

Windows에서 바로 사용하실 수 있도록 배치 파일을 제공합니다!

### 사전 준비
1. **Node.js 설치** (최초 1회만)
   - https://nodejs.org/ 접속
   - LTS 버전 다운로드 및 설치
   - 설치 후 컴퓨터 재시작

### 설치 및 실행
1. **`install.bat`** 파일을 더블클릭하여 설치
   - 자동으로 필요한 패키지 설치 및 데이터베이스 초기화

2. 프로그램 시작 (2가지 방법)
   - **방법 1**: `start.bat` - 15초 후 브라우저 자동 오픈
   - **방법 2**: `start-simple.bat` - 서버만 시작 (수동 접속 권장)

3. 브라우저에서 `http://localhost:3000` 접속
   - "Server is running" 메시지 확인 후 접속

4. 종료 시 명령 프롬프트 창에서 **Ctrl+C** 입력

> ⚠️ **주의**: 브라우저가 너무 빨리 열려서 연결 오류가 나면, 서버 시작 메시지를 확인한 후 브라우저를 새로고침하거나 `start-simple.bat`을 사용하세요.

> 📘 자세한 사용법은 **[WINDOWS-사용가이드.md](WINDOWS-사용가이드.md)** 파일을 참고하세요!

## 설치 방법 (수동)

### 1. 의존성 설치

```bash
npm install
```

### 2. 데이터베이스 초기화

```bash
npm run init-db
```

이 명령어는 다음을 수행합니다:
- 데이터베이스 테이블 생성
- 샘플 데이터 추가 (부자재 3개, 공급업체 2개)

### 3. 서버 실행

```bash
npm start
```

개발 모드 (자동 재시작):
```bash
npm run dev
```

### 4. 웹 브라우저 접속

```
http://localhost:3000
```

## 프로젝트 구조

```
/
├── server.js              # Express 서버 및 API 엔드포인트
├── package.json           # 프로젝트 설정 및 의존성
├── scripts/
│   └── init-db.js        # 데이터베이스 초기화 스크립트
├── public/               # 프론트엔드 정적 파일
│   ├── index.html        # 메인 HTML
│   ├── style.css         # 스타일시트
│   └── app.js            # 프론트엔드 로직
└── inventory.db          # SQLite 데이터베이스 (자동 생성)
```

## API 엔드포인트

### 부자재 (Materials)
- `GET /api/materials` - 부자재 목록 조회
- `GET /api/materials/:id` - 부자재 상세 조회
- `POST /api/materials` - 부자재 추가
- `PUT /api/materials/:id` - 부자재 수정
- `DELETE /api/materials/:id` - 부자재 삭제

### 공급업체 (Suppliers)
- `GET /api/suppliers` - 공급업체 목록 조회
- `POST /api/suppliers` - 공급업체 추가
- `PUT /api/suppliers/:id` - 공급업체 수정
- `DELETE /api/suppliers/:id` - 공급업체 삭제

### 발주 (Purchase Orders)
- `GET /api/orders` - 발주 목록 조회
- `GET /api/orders/:id` - 발주 상세 조회
- `POST /api/orders` - 발주 생성
- `PATCH /api/orders/:id/status` - 발주 상태 변경

### 입고 (Receiving)
- `GET /api/receiving` - 입고 목록 조회
- `POST /api/receiving` - 입고 처리

### 재고 (Inventory)
- `GET /api/inventory` - 재고 현황 조회
- `GET /api/inventory/:materialId/transactions` - 재고 이력 조회

### 대시보드 (Dashboard)
- `GET /api/dashboard` - 대시보드 통계 조회

## 데이터베이스 스키마

### raw_materials (부자재)
- id, code, name, specification, unit
- standard_price, safety_stock, current_stock
- created_at, updated_at

### suppliers (공급업체)
- id, code, name, contact_person, phone, email, address
- notes, created_at, updated_at

### purchase_orders (발주)
- id, order_no, supplier_id, order_date, expected_date
- status, total_amount, notes, created_at, updated_at

### purchase_order_items (발주 상세)
- id, order_id, material_id, quantity, unit_price, amount
- received_quantity, created_at

### receiving_records (입고)
- id, receiving_no, order_id, receiving_date
- status, notes, created_at

### receiving_items (입고 상세)
- id, receiving_id, order_item_id, material_id, quantity
- inspection_result, notes, created_at

### inventory_transactions (재고 이력)
- id, material_id, transaction_type, quantity
- reference_type, reference_id, notes, created_at

## 사용 방법

### 1. 초기 설정
1. 공급업체 등록
2. 부자재 등록

### 2. 발주 프로세스
1. "발주 관리" 메뉴에서 "발주 생성" 클릭
2. 공급업체 선택
3. 발주 항목 추가 (부자재, 수량, 단가)
4. 발주 생성 완료

### 3. 입고 프로세스
1. "입고 관리" 메뉴에서 "입고 처리" 클릭
2. 발주 선택 (대기중/부분입고 상태만 표시)
3. 입고 수량 입력 (부분 입고 가능)
4. 검수 결과 선택
5. 입고 처리 완료 → 재고 자동 업데이트

### 4. 재고 모니터링
1. "재고 현황" 메뉴에서 전체 재고 확인
2. 안전재고 미만 품목은 "부족" 표시
3. 재고가 0인 품목은 "품절" 표시

## 주요 특징

- **실시간 재고 업데이트**: 입고 처리 시 자동으로 재고 반영
- **부분 입고 지원**: 발주 수량 대비 부분 입고 가능
- **자동 상태 관리**: 발주 상태가 입고 현황에 따라 자동 업데이트
- **안전재고 경고**: 안전재고 미만 품목 실시간 모니터링
- **직관적인 UI**: 탭 기반 네비게이션으로 쉬운 사용
- **반응형 디자인**: 모바일/태블릿에서도 사용 가능

## 인터넷 배포 방법

### Render.com 무료 배포 (추천)

Render.com을 사용하면 무료로 인터넷에 배포할 수 있습니다.

#### 1. Render.com 계정 생성
1. [Render.com](https://render.com) 접속
2. GitHub 계정으로 가입

#### 2. 새 Web Service 생성
1. Dashboard에서 "New +" 클릭 → "Web Service" 선택
2. GitHub 저장소 연결
3. 이 저장소 선택

#### 3. 설정
```
Name: subsidiary-materials-inventory (원하는 이름)
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

#### 4. 배포
- "Create Web Service" 클릭
- 자동으로 빌드 및 배포 시작
- 완료되면 `https://your-app-name.onrender.com` 주소로 접속 가능

#### 주의사항
- 무료 플랜은 15분간 활동이 없으면 자동으로 sleep 모드로 전환됩니다
- Sleep 후 첫 접속 시 재시작에 30초~1분 정도 소요됩니다
- 데이터베이스(SQLite)는 재배포 시 초기화될 수 있으니, 중요한 데이터는 백업하세요

### 기타 배포 옵션

#### Railway.app
- 무료 $5 크레딧 제공
- GitHub 연동 자동 배포
- [Railway.app](https://railway.app)

#### Heroku
- 무료 플랜 종료 (유료만 가능)
- 간단한 CLI 도구

#### AWS EC2 / DigitalOcean
- 완전한 서버 제어
- 월 $5~ 비용 발생
- 직접 서버 관리 필요

## 향후 개발 계획

- [ ] 사용자 인증 및 권한 관리
- [ ] 출고 기능 추가
- [ ] 재고 이동 및 조정 기능
- [ ] 엑셀 가져오기/내보내기
- [ ] 바코드/QR코드 스캔 기능
- [ ] 알림 기능 (재고 부족 등)
- [ ] 통계 및 리포트 기능
- [ ] 다중 창고 지원
- [ ] 이메일 발송 (발주서 등)

## 라이선스

MIT License

## 문의

문제가 발생하거나 개선사항이 있으시면 이슈를 등록해주세요.
