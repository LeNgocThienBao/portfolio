# Portfolio CMS – hướng dẫn triển khai

## Có gì trong bộ này?
- `public/index.html`: giao diện portfolio hiện tại, giữ phong cách và bố cục.
- `public/admin.html`: trang quản trị tại `/admin`.
- `public/portfolio.js`: lấy nội dung đã lưu từ API và cập nhật phần thông tin/dự án trên website.
- `worker.js`: API đăng nhập, đọc/lưu nội dung; cookie phiên HttpOnly/Secure/SameSite và chữ ký HMAC.
- `schema.sql`: cấu trúc bảng D1.
- `wrangler.toml`: cấu hình Worker + Static Assets + D1.

## Lưu ý quan trọng
Đây là bộ mã nguồn tích hợp để triển khai thử nghiệm, chưa được kết nối vào Cloudflare của bạn và chưa được deploy. Website live hiện tại không bị thay đổi. Bản portfolio nguồn đang có một số placeholder (YOUR NAME, email, tên dự án...) nên hãy thay bằng thông tin đã xác minh trước khi công khai.

## Triển khai Cloudflare (sau khi tải source lên GitHub)
1. Trong Cloudflare Dashboard → Workers & Pages → D1 SQL Database, tạo database tên `portfolio-content`.
2. Mở database → Console và chạy nội dung file `schema.sql`.
3. Sao chép Database ID, thay `REPLACE_WITH_YOUR_D1_DATABASE_ID` trong `wrangler.toml`.
4. Cài Wrangler và đăng nhập Cloudflare, sau đó chạy `npx wrangler secret put ADMIN_PASSWORD` và nhập mật khẩu quản trị trực tiếp trong terminal.
5. Chạy `npx wrangler secret put SESSION_SECRET` và nhập một chuỗi ngẫu nhiên dài (ít nhất 32 ký tự).
6. Chạy `npx wrangler deploy`.
7. Mở URL Worker, vào `/admin` để đăng nhập.

Không gửi mật khẩu hoặc SESSION_SECRET qua chat/GitHub. Không commit secrets vào repository.

## Giới hạn hiện tại
CMS hiện cho phép chỉnh sửa tên hiển thị, giới thiệu, chức danh, thông tin kinh nghiệm và mô tả 4 dự án. Chưa có chức năng upload ảnh/video; muốn thêm media cần cấu hình Cloudflare R2. Một số phần văn bản tĩnh khác của template chưa được đưa vào form quản trị. Cần kiểm tra staging trước khi gắn domain hoặc thay website live.
