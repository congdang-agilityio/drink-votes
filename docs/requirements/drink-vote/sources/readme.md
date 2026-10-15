---
source: "/home/congdang/Projects/drink-votes/README.md"
retrieved: 2026-10-15T15:49:46Z
converter: copy
---

# Drink Vote

Team chọn quán nhậu cho buổi tối: ai đi, đi quán nào, chốt lúc mấy giờ. App nhỏ, dùng để demo
[squad](https://github.com/congdang-agilityio/agile-squad): một đội phần mềm AI làm từ ý
tưởng đến production qua GitHub Projects và Railway.

## Vấn đề

"Tối nay nhậu không?" trên chat luôn kết thúc giống nhau: mỗi người gợi ý một quán, không
ai chốt, đến 5 giờ chiều vẫn chưa biết bao nhiêu người đi để đặt bàn. Drink Vote biến mỗi lần
rủ thành một **kèo**: có ngày, có danh sách quán để vote, có giờ chốt, và có số người đi.

## Người dùng

- **Người rủ (chủ kèo):** tạo kèo, chọn những quán được đưa vào vote, đặt bàn theo kết quả.
- **Thành viên:** báo đi hay không, vote quán, xem kết quả.

Không có tài khoản: người dùng nhập tên một lần, app nhớ bằng cookie.

## Tính năng

### M1: Kèo tối nay
- Danh sách quán: thêm quán (tên, địa chỉ, link Google Maps, ghi chú như "có chỗ để xe", "bia tươi").
- Tạo kèo: ngày, giờ ngồi (mặc định 18:30), giờ chốt (mặc định 16:00), các quán được vote.
  Kèo có link riêng để gửi vào chat.
- Trong kèo, mỗi người:
  - báo **Đi / Không đi**;
  - vote **1 quán** (chỉ người báo Đi mới vote được), được đổi phiếu khi kèo còn mở.
- Trang kèo: số người đi, ai đi, số phiếu từng quán, quán đang dẫn.
- `GET /healthz` trả `200` khi app và database đều chạy.

### M2: Luật chơi
- Kèo tự chốt đúng giờ chốt theo giờ Việt Nam (`Asia/Ho_Chi_Minh`); sau đó không đổi Đi/Không đi
  hay phiếu được nữa. Chủ kèo có thể chốt sớm.
- Kèo dưới **3 người đi** lúc chốt thì bị huỷ ("không đủ quân").
- Hoà phiếu: quán lâu chưa đi nhất thắng; chưa đi bao giờ thì xếp trước.
- Lịch sử: các kèo đã chốt (ngày, quán, số người), và mỗi quán đã đi bao nhiêu lần.

## Ngoài phạm vi

Đăng nhập, phân quyền, nhiều team, chia tiền, đặt bàn qua app của quán, thông báo
Slack/email, bản đồ, giao diện mobile riêng.

## Kỹ thuật

- Node.js 22, TypeScript, Hono, HTML render từ server (không SPA).
- PostgreSQL, migration chạy trước khi app khởi động.
- Test: Vitest (unit + API với database test).
- Deploy: Railway, hai môi trường `staging` và `production`, mỗi môi trường một Postgres.
- Cấu hình qua biến môi trường: `DATABASE_URL`, `PORT`, `APP_TZ=Asia/Ho_Chi_Minh`,
  `DEFAULT_CLOSE_AT=16:00`, `MIN_PEOPLE=3`.

## Chạy local

```bash
npm install
cp .env.example .env        # DATABASE_URL trỏ tới Postgres local
npm run migrate
npm run dev                 # http://localhost:3000
npm test
```

## Làm với squad

```text
/plugin marketplace add congdang-agilityio/agile-squad
/plugin install squad@agile-squad
/squad:setup                       # board, labels, gates, Railway project
```

Rồi nói với PM: *"Xây Drink Vote theo README này, M1 trước."*

1. **BA** viết stories và acceptance criteria → **GATE 1** (stakeholder duyệt).
2. **Team Lead** chia task, gắn Complexity → **GATE 2**.
3. `/squad:run scope=#<epic>`: Dev làm song song, Reviewer review, QA kiểm theo acceptance criteria, Team Lead merge.
4. **DevOps** thêm Postgres (task `infra`), deploy staging, smoke test → **GATE 3** trên GitHub → production.
5. `/squad:fix` cho lỗi nhỏ, `/squad:report` để xem tiến độ và chi phí.

Một dev khác muốn vào làm cùng: được cấp quyền repo và board, cài plugin, chạy
`/squad:doctor` (không chạy setup lại), rồi `/squad:run scope=#<epic>`.
