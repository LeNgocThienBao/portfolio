# Portfolio CMS — bản tích hợp trên giao diện portfolio hiện tại

## Cấu trúc
- `public/index.html`: giao diện portfolio Minimal Editorial đã giữ lại và bổ sung dữ liệu thực tế.
- `public/admin.html`: trang quản trị riêng tại `/admin`.
- `public/portfolio.js`: đọc nội dung từ API và cập nhật website.
- `worker.js`: API đăng nhập, phiên quản trị và lưu nội dung vào Cloudflare D1.
- `schema.sql`: bảng `portfolio_content` (id = 1).

## Cấu hình Cloudflare trước khi deploy
1. Giữ database D1 `portfolio-content` đã tạo. Lấy đúng Database ID trong trang D1 và điền vào `wrangler.toml`.
2. Gắn D1 binding tên `DB`; static assets binding tên `ASSETS`.
3. Tạo Worker secrets `ADMIN_PASSWORD` và `SESSION_SECRET` (chuỗi ngẫu nhiên dài, tối thiểu 32 ký tự). Không ghi các giá trị này vào Git.
4. Deploy bản staging/preview và kiểm tra `/`, `/admin`, đăng nhập, lưu và tải lại nội dung. Chỉ sau khi kiểm tra mới thay Worker live.

## CMS hiện hỗ trợ
- Sửa tên hiển thị, chức danh, hero và thông tin kinh nghiệm.
- Sửa tiêu đề, meta, mô tả, dòng nhấn, URL thumbnail và URL chi tiết cho 4 hạng mục công việc.
- Sửa danh sách công cụ, email và LinkedIn.
- Ảnh/video cần có URL HTTPS công khai; upload file trực tiếp lên R2 chưa được tích hợp ở phiên bản này.

## Bảo mật
- `/admin` không được index.
- Cookie phiên `HttpOnly`, `Secure`, `SameSite=Strict`, hết hạn sau 8 giờ.
- API ghi yêu cầu phiên hợp lệ; mật khẩu và secret chỉ đặt trong Cloudflare Worker secrets.

## Lưu ý
Không có số liệu hiệu quả quảng cáo hoặc kết quả kinh doanh nào được tự thêm. Các hạng mục portfolio đang mô tả phạm vi công việc đã xác nhận, không tự nhận là case study có thành tích định lượng.