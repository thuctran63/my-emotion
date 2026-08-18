# My Emotion 🌿

Nhật ký cảm xúc cá nhân — ghi lại cảm xúc mỗi ngày (5 cấp độ) kèm nhật ký ngắn, theo dõi xu hướng qua trang thống kê.

## Tính năng

- **Hôm nay** — chọn cảm xúc 1 chạm (5 khuôn mặt SVG), autosave nhật ký (debounce 600ms), streak + biểu đồ 30 ngày
- **Lịch sử** — timeline theo tháng, sửa/xóa inline, export JSON
- **Thống kê** — trend + trung bình 7 ngày, phân bố cảm xúc, pattern theo thứ, **Year in Pixels**, insight tự sinh
- Song ngữ **VI/EN**, dark mode theo hệ thống + toggle thủ công
- Tối ưu tốc độ: optimistic UI, code-splitting, SVG charts tự vẽ (0 dependency chart lib)

## Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router |
| Backend | Hono (chạy chung local & Vercel) |
| Database | MongoDB Atlas (driver `mongodb`) |

## Chạy local

```bash
npm install
npm run dev            # web :5173 + api :3001
```

> Không cần `MONGODB_URI` để chạy thử: khi thiếu biến này, API tự dùng **in-memory store** (dữ liệu sẽ mất khi khởi động lại). Muốn lưu thật, tạo cluster trên Atlas và đặt `MONGODB_URI` trong `.env`:

```bash
cp .env.example .env   # điền MONGODB_URI
```

## Deploy lên Vercel

1. Tạo cluster miễn phí tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), lấy connection string
2. Import repo lên GitHub → tạo project trên [Vercel](https://vercel.com)
3. Framework preset: **Vite** (Vercel tự nhận diện)
4. Thêm env var `MONGODB_URI` vào project settings
5. Deploy — xong! API `/api/*` chạy qua `api/index.ts`, SPA rewrite trong `vercel.json`

## Scripts

```bash
npm run dev        # web + api (concurrently)
npm run dev:web    # chỉ web
npm run dev:api    # chỉ api
npm run build      # typecheck + build
npm run smoke      # smoke test CRUD (cần api đang chạy + MONGODB_URI)
```

## API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/entries?from&to` | Danh sách (mới nhất trước) |
| POST | `/api/entries` | Upsert theo `date` |
| PATCH | `/api/entries/:date` | Cập nhật một phần |
| DELETE | `/api/entries/:date` | Xóa |

Body: `{ date: "YYYY-MM-DD", level: 1-5, note?: string (≤5000) }`

## Ghi chú

- Ngày được tính theo **múi giờ local** của trình duyệt (không dùng ngày server)
- Không có auth — app cá nhân. Thêm khi cần chia sẻ.