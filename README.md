# CNPMM - Các Công Nghệ Phần Mềm Mới

<div align="center">

**Tổng hợp bài tập môn Các Công Nghệ Phần Mềm Mới**
**Sinh viên:** Đinh Nguyễn Đức Duy - **MSSV:** 23110193
**Lớp:** Nhóm 02 - Tiết 2-4 - Phòng A308

[![GitHub](https://img.shields.io/badge/GitHub-ShiroKin7448-181717?style=for-the-badge&logo=github)](https://github.com/ShiroKin7448/CNPMM)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express.js-000?style=for-the-badge&logo=express)

</div>

## Tổng Quan

Repository này lưu toàn bộ bài tập cá nhân và phần đóng góp bài nhóm của môn Các Công Nghệ Phần Mềm Mới. Các bài từ BT04 trở đi phát triển dần thành hệ thống LaptopStore fullstack với React/Vite, Express, MongoDB, JWT, giỏ hàng, thanh toán, loyalty, notification realtime và thống kê admin.

Repo GitHub: [https://github.com/ShiroKin7448/CNPMM.git](https://github.com/ShiroKin7448/CNPMM.git)

## Danh Sách Bài Tập

| Bài | Nội dung | Công nghệ chính | Thư mục |
|---|---|---|---|
| BT01 | Quản lý User CRUD với EJS | Express.js, MongoDB, EJS, Bootstrap | [BT01_23110193_DinhNguyenDucDuy](./BT01_23110193_DinhNguyenDucDuy/) |
| BT02 | Edit Profile, Authentication, Authorization | Express.js, MongoDB, JWT, Nodemailer | [BT02_EditProfile_23110193_DinhNguyenDucDuy](./BT02_EditProfile_23110193_DinhNguyenDucDuy/) |
| BT03 | Fullstack Node.js + React.js | Express.js, MongoDB, React, Ant Design, JWT | [BT03_23110193_DinhNguyenDucDuy](./BT03_23110193_DinhNguyenDucDuy/) |
| BT03 Nhóm | Redux + Page Wiring trong dự án tư vấn sinh viên | React, Redux Toolkit, Axios, TailwindCSS | [BT03(NHOM)_Redux_Page_Wiring_23110193_DinhNguyenDucDuy](./BT03(NHOM)_Redux_Page_Wiring_23110193_DinhNguyenDucDuy/) |
| BT04 | LaptopStore E-Commerce Fullstack | React, Vite, TailwindCSS, Express, MongoDB, JWT | [BT04_23110193_DinhNguyenDucDuy](./BT04_23110193_DinhNguyenDucDuy/) |
| BT04 Nhóm | Admin CMS, FAQ, Search, Forum moderation | React, Redux Toolkit, Express, MongoDB, JWT | [BT04(Nhóm)-23110193_DinhNguyenDucDuy](./BT04(Nhóm)-23110193_DinhNguyenDucDuy/) |
| BT05 | LaptopStore 3D, lazy loading, top products | React, Vite, Three.js, Swiper, Express, MongoDB | [BT05_23110193_DinhNguyenDucDuy](./BT05_23110193_DinhNguyenDucDuy/) |
| BT06 | Cart, COD, MoMo Sandbox, Orders, Admin Dashboard | React, Vite, Express, MongoDB, MoMo Sandbox, JWT | [BT06_23110193_DinhNguyenDucDuy](./BT06_23110193_DinhNguyenDucDuy/) |
| BT07 | Loyalty E-Commerce, reviews, voucher, points | React, Vite, Express, MongoDB, JWT | [BT07_23110193_DinhNguyenDucDuy](./BT07_23110193_DinhNguyenDucDuy/) |
| BT07 Nhóm | Counselor stats, similar, favorites, reviews | React, Redux Toolkit, Express, MongoDB | [BT07(NHOM)_23110193_DinhNguyenDucDuy](./BT07(NHOM)_23110193_DinhNguyenDucDuy/) |
| BT08 | Realtime notification, mail, analytics dashboard | React, Vite, Express, MongoDB, Socket.IO, Nodemailer | [BT08_23110193_DinhNguyenDucDuy](./BT08_23110193_DinhNguyenDucDuy/) |

## Cập Nhật Mới Nhất - BT08

BT08 được tạo từ BT07 và bổ sung đầy đủ yêu cầu realtime notification, gửi mail và thống kê theo thời gian.

### Chức Năng Chính BT08

- Realtime notification bằng Socket.IO cho các hoạt động mới của ứng dụng.
- Lưu notification vào MongoDB và hiển thị trên UI.
- Gửi email thông báo qua Nodemailer nếu có cấu hình SMTP.
- Header có chuông thông báo, badge số thông báo chưa đọc và dropdown realtime.
- Trang `/notifications` cho phép xem thông báo, lọc unread, đánh dấu đã đọc từng thông báo hoặc tất cả.
- Trang `/admin/statistics` thống kê doanh thu, dòng tiền, đơn theo trạng thái, khách hàng mới và top 10 sản phẩm bán nhiều nhất.
- API thống kê trả về `summary`, `series`, `statusStats`, `ordersByStatus`, `topProducts`, `newCustomers`, `cashFlow` và `labels`.
- Dashboard admin tự refresh khi có event `analytics:refresh`.

### API BT08

```http
GET /v1/api/notifications?limit=8&page=1&unread=true
PUT /v1/api/notifications/:id/read
PUT /v1/api/notifications/read-all
GET /v1/api/admin/statistics?startDate=2026-05-26&endDate=2026-06-08&groupBy=day
```

### Socket Events BT08

```text
notification:new
analytics:refresh
socket:ready
```

### Demo BT08

| Admin thống kê doanh thu, dòng tiền, top sản phẩm và đơn theo trạng thái |
|---|
| ![BT08 admin statistics](./BT08_23110193_DinhNguyenDucDuy/docs/demo/bt08-admin-statistics.png) |

| Trang notification realtime |
|---|
| ![BT08 notifications](./BT08_23110193_DinhNguyenDucDuy/docs/demo/bt08-notifications.png) |

README chi tiết của BT08: [BT08_23110193_DinhNguyenDucDuy/README.md](./BT08_23110193_DinhNguyenDucDuy/README.md)

## Tóm Tắt Từng Bài

### BT01 - Quản Lý Người Dùng CRUD

BT01 xây dựng hệ thống quản lý người dùng cơ bản theo mô hình MVC, render giao diện bằng EJS.

Chức năng chính:

- Thêm người dùng mới.
- Hiển thị danh sách người dùng từ MongoDB.
- Cập nhật thông tin người dùng.
- Xóa người dùng.

Cách chạy:

```bash
cd BT01_23110193_DinhNguyenDucDuy
npm install
npm start
```

URL demo: `http://localhost:8088/crud`

### BT02 - Edit Profile, Auth & Authorization

BT02 bổ sung hệ thống xác thực, bảo vệ route, cập nhật profile và gửi email.

Chức năng chính:

- Đăng ký, đăng nhập bằng JWT.
- Cập nhật thông tin cá nhân.
- Rate limiting chống brute-force.
- Validate input bằng `express-validator`.
- Gửi email qua Nodemailer.
- Mã hóa mật khẩu bằng bcrypt.

Cách chạy:

```bash
cd BT02_EditProfile_23110193_DinhNguyenDucDuy/EditProfile
npm install
npm start
```

README chi tiết: [BT02 README](./BT02_EditProfile_23110193_DinhNguyenDucDuy/README.md)

### BT03 - Fullstack Node.js + React.js

BT03 là ứng dụng fullstack có REST API Express và SPA React + Ant Design.

Chức năng chính:

- Register/Login với JWT và bcrypt.
- Danh sách user dạng bảng có search/filter/sort.
- Forgot Password và Reset Password bằng email token.
- Duy trì session khi reload trang.

Cách chạy:

```bash
# Backend
cd BT03_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run dev

# Frontend
cd ../ReactJS01
npm install
npm run dev
```

### BT03 Nhóm - Redux + Page Wiring

Phần đóng góp trong dự án HCMUTE Student Consulting, tập trung vào Redux state và ProfilePage.

Chức năng chính:

- `authSlice.js` cho register, login, OTP, forgot/reset password và profile.
- `useAuth()` hook kết nối Redux với Axios API.
- `selectors.js` truy cập auth state.
- `ProfilePage.jsx` xem/chỉnh sửa hồ sơ, validation và logout.

### BT04 - LaptopStore E-Commerce Fullstack

BT04 xây dựng cửa hàng LaptopStore fullstack bằng React/Vite, TailwindCSS, Express và MongoDB.

Chức năng chính:

- Auth đầy đủ: đăng ký, đăng nhập, xác nhận email, quên mật khẩu, đặt lại mật khẩu.
- Trang shop có search debounce, filter, sort, pagination và query string.
- Trang chi tiết sản phẩm có gallery, thông số kỹ thuật, tồn kho và sản phẩm tương tự.
- Quản lý user/profile.
- Backend API xử lý filter/search an toàn.

Cách chạy:

```bash
# Backend
cd BT04_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run seed
npm run dev

# Frontend
cd ../ReactJS01
npm install
npm run dev
```

### BT04 Nhóm - Admin CMS, FAQ, Search, Forum

Phần bài nhóm trong dự án HCMUTE Student Consulting, phụ trách Admin CMS, FAQ, Search và Forum persistence/moderation.

Chức năng chính:

- Admin CMS quản lý bài viết và FAQ.
- FAQ public có lọc danh mục và tìm kiếm.
- Search tập trung trên bài viết, FAQ và forum.
- Forum lưu chủ đề, trả lời, vote và trạng thái giải quyết vào MongoDB.
- Admin ghim/bỏ ghim, xóa chủ đề và xóa trả lời.

### BT05 - LaptopStore 3D E-Commerce

BT05 phát triển tiếp từ BT04, bổ sung lazy loading sản phẩm và top 10 sản phẩm bằng carousel ngang.

Chức năng chính:

- Shop lazy loading bằng `IntersectionObserver`.
- API top 10 bán chạy và top 10 xem nhiều.
- Tự tăng `viewCount` khi mở chi tiết sản phẩm.
- Giao diện nền 3D bằng Three.js.
- Carousel ngang bằng Swiper.

### BT06 - Cart, Checkout & Orders

BT06 phát triển tiếp từ BT05, bổ sung giỏ hàng MongoDB, checkout COD/MoMo, lịch sử đơn hàng và admin dashboard.

Chức năng chính:

- Giỏ hàng lưu database, chọn riêng từng sản phẩm để thanh toán.
- Checkout COD và MoMo sandbox.
- Màn quét QR, callback return/IPN, query trạng thái và refund MoMo.
- Tự hủy đơn MoMo pending quá hạn, hoàn kho và đưa sản phẩm về lại giỏ.
- Theo dõi đơn hàng bằng timeline trạng thái.
- Admin dashboard quản lý đơn hàng, tiền và tồn kho.

Tài khoản seed:

```text
User:  demo@bt06.local  / 123456
Admin: admin@bt06.local / 123456
```

### BT07 - LaptopStore Loyalty E-Commerce

BT07 phát triển tiếp từ BT06, bổ sung hệ thống chăm sóc khách hàng, voucher, điểm, yêu thích và review xác thực.

Chức năng chính:

- Chỉ đơn `DELIVERED` mới được đánh giá sản phẩm.
- Đánh giá nhận voucher hoặc điểm thưởng.
- Lưu sản phẩm yêu thích và sản phẩm đã xem.
- Kho điểm, hạng thành viên và voucher.
- Áp mã giảm giá và đổi điểm khi checkout.
- Hoàn ưu đãi nếu hủy đơn.
- Admin quản lý voucher, kho điểm và hạng thành viên.

Tài khoản seed:

```text
User:  demo@bt07.local  / 123456
Admin: admin@bt07.local / 123456
```

### BT07 Nhóm - Counselor Stats, Similar, Favorites & Reviews

Phần đóng góp cá nhân trong dự án nhóm HCMUTE Student Consulting gồm backend counselor controller/routes và frontend `BookCounselorPage.jsx`.

Chức năng chính:

- API tư vấn viên tương tự, stats và bình luận có phân trang.
- Validate ID tư vấn viên.
- Nút yêu thích, lịch sử xem, stats, bình luận sinh viên và danh sách gợi ý tương tự.

Nhánh nhóm: [feature/counselor-similar-stats](https://github.com/DangTranAnhQuan/hcmute-student-consulting/tree/feature/counselor-similar-stats)

### BT08 - Realtime Notification & Analytics

BT08 phát triển tiếp từ BT07, bổ sung realtime notification, gửi mail và thống kê admin theo thời gian.

Chức năng chính:

- Socket.IO server tích hợp HTTP server Express.
- Notification model lưu MongoDB, phân quyền theo `audience=admin|user|all` hoặc `recipient`.
- Gửi email thông báo qua Nodemailer.
- Trang notification realtime và chuông thông báo trên header.
- Thống kê doanh thu đơn đã giao, tiền vào ví, tiền đang xử lý, COD chờ thu, MoMo chờ thanh toán.
- Thống kê đơn theo trạng thái, khách hàng mới, review mới và top sản phẩm bán nhiều nhất.
- Bảng danh sách đơn theo trạng thái.

Cách chạy:

```bash
# Backend
cd BT08_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run seed
npm run dev

# Frontend
cd ../ReactJS01
npm install
npm run dev
```

Tài khoản seed:

```text
User:  demo@bt08.local  / 123456
Admin: admin@bt08.local / 123456
```

## Demo Local Nhanh

| Bài | Lệnh chạy chính | URL/Route cần kiểm tra |
|---|---|---|
| BT01 | `npm start` | `http://localhost:8088/crud` |
| BT02 | `npm start` trong `EditProfile` | `POST /api/auth/edit-profile` |
| BT03 | Backend `npm run dev`, Frontend `npm run dev` | `/login`, `/register`, `/user`, `/forgot-password` |
| BT04 | Backend `npm run seed && npm run dev`, Frontend `npm run dev` | `/`, `/shop`, `/product/:id`, `/profile`, `/user` |
| BT05 | Backend `npm run seed && npm run dev`, Frontend `npm run dev` | `/`, `/shop`, `/product/:id`, `/v1/api/products/top` |
| BT06 | Backend `npm run seed && npm run dev`, Frontend `npm run dev` | `/cart`, `/checkout`, `/orders`, `/admin` |
| BT07 | Backend `npm run seed && npm run dev`, Frontend `npm run dev` | `/store`, `/product/:id`, `/checkout`, `/admin/loyalty` |
| BT08 | Backend `npm run seed && npm run dev`, Frontend `npm run dev` | `/notifications`, `/admin/statistics` |

## Yêu Cầu Hệ Thống

| Công cụ | Phiên bản khuyến nghị |
|---|---|
| Node.js | >= 18.x |
| npm | >= 9.x |
| MongoDB | >= 6.x |
| Git | Bất kỳ phiên bản hiện đại |

## Ghi Chú Chung

- Mỗi bài có thể có README riêng trong thư mục bài tập.
- Với các bài dùng MongoDB, cần chạy MongoDB local trước khi seed hoặc chạy server.
- Không push `node_modules`, `dist`, `build`, `.env` chứa thông tin nhạy cảm.
- Các bài LaptopStore từ BT04 đến BT08 dùng backend mặc định `http://localhost:8080` và frontend `http://localhost:5173`.
- BT08 dùng database demo `bt08`, tách riêng với BT07.

<div align="center">

Repo được duy trì bởi **Đinh Nguyễn Đức Duy - 23110193**
Môn: **Các Công Nghệ Phần Mềm Mới**

</div>
