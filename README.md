# UTE Show (Check-in + Slideshow)

Ứng dụng này hiển thị thông tin check-in sự kiện thời gian thực (dành cho màn hình lớn) kết hợp với slideshow.

## 🚀 Chạy dự án

1. Sao chép biến môi trường:

```bash
cp .env.example .env.local
```

2. Điền thông tin Supabase của bạn vào `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Cài đặt dependencies & chạy dev server:

```bash
pnpm install
pnpm dev
```

4. Mở http://localhost:3000 để xem màn hình check-in.

## 🧩 Cơ sở dữ liệu (Supabase)

Tạo bảng `checkins` trong Supabase (SQL Editor):

```sql
create table public.checkins (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  chuc_vu text not null,
  don_vi text not null,
  created_at timestamptz default now() not null
);

-- Kích hoạt RLS để chỉ người dùng đã đăng nhập mới có thể insert/delete
alter table public.checkins enable row level security;

create policy "allow authenticated inserts" on public.checkins
  for insert using (auth.role() = 'authenticated');

create policy "allow authenticated deletes" on public.checkins
  for delete using (auth.role() = 'authenticated');
```

> **Lưu ý:** Cơ chế `admin` trong ứng dụng là dựa trên việc đăng nhập Supabase. Để bảo mật tốt hơn, bạn có thể bổ sung cột `is_admin` và sử dụng RLS để chỉ cho phép admin xoá dữ liệu.

## 🧠 Kiến trúc

- `/` — Trang hiển thị slideshow + danh sách check-in realtime.
- `/admin` — Bảng điều khiển admin (đăng nhập + tạo check-in + xóa check-in).

## 📦 Thành phần chính

- `components/Slideshow.tsx` — Slide ảnh auto chuyển.
- `components/CheckinList.tsx` — Danh sách check-in cập nhật realtime bằng Supabase Realtime.
- `components/CheckinForm.tsx` — Form check-in (admin).
- `components/MagicGlow.tsx` — Hiệu ứng UI "Magic" (làm nền lung linh).

## 💡 Gợi ý nâng cao

- Thêm xác thực `is_admin` trong bảng users/giao diện để chỉ định admin rõ ràng.
- Lưu ảnh slide trong Supabase Storage và gọi API để lấy.
- Hiển thị số lượng check-in và thống kê theo thời gian thực.
