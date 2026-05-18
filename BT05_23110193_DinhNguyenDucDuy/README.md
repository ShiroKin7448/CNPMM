# BT05 - LaptopStore 3D E-Commerce

<div align="center">

**Bài tập cá nhân môn Các Công Nghệ Phần Mềm Mới**<br>
**Sinh viên:** Đinh Nguyễn Đức Duy - **MSSV:** 23110193

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

## Tổng Quan

BT05 là ứng dụng **LaptopStore** fullstack được phát triển tiếp từ BT04, gồm frontend React/Vite và backend Express/MongoDB. Bài làm bổ sung chức năng hiển thị sản phẩm theo danh mục với lazy loading, hiển thị top 10 sản phẩm bán chạy/xem nhiều theo carousel ngang, đồng thời làm mới giao diện bằng hiệu ứng 3D theo từng nhóm trang.

Giao diện sử dụng chủ đề laptop/công nghệ với màu đen, xám, trắng và accent xanh `#C0FF6B`. Các trang auth, trang chủ, shop, chi tiết sản phẩm và profile đều có nền 3D chung nhưng được bố trí để không che nội dung chính.

---

## Demo Giao Diện

Ảnh demo được chụp từ môi trường local với frontend `http://localhost:5173` và backend `http://localhost:8080`.

> Ảnh trang chủ được chụp tại khu vực carousel top sản phẩm để thấy rõ nút điều hướng trái/phải theo yêu cầu.

| Trang chủ | Đăng nhập |
|---|---|
| ![Trang chủ có carousel sản phẩm và mũi tên điều hướng](./docs/demo/home.png) | ![Trang đăng nhập](./docs/demo/login.png) |

| Đăng ký | Quên mật khẩu |
|---|---|
| ![Trang đăng ký](./docs/demo/register.png) | ![Trang quên mật khẩu](./docs/demo/forgot-password.png) |

| Shop | Shop có bộ lọc |
|---|---|
| ![Trang shop](./docs/demo/shop.png) | ![Trang shop có bộ lọc sản phẩm](./docs/demo/shop-filter.png) |

| Chi tiết sản phẩm | Profile |
|---|---|
| ![Trang chi tiết sản phẩm](./docs/demo/product-detail.png) | ![Trang profile người dùng](./docs/demo/profile.png) |

Danh sách file ảnh nằm trong `docs/demo/`:

- `home.png`: trang chủ, khu vực top sản phẩm có mũi tên điều hướng trái/phải.
- `login.png`: trang đăng nhập.
- `register.png`: trang đăng ký.
- `forgot-password.png`: trang quên mật khẩu.
- `shop.png`: trang shop danh sách sản phẩm.
- `shop-filter.png`: trang shop khi bật bộ lọc.
- `product-detail.png`: trang chi tiết sản phẩm.
- `profile.png`: trang profile người dùng.

---

## Chức Năng BT05

### 1. Hiển thị sản phẩm theo danh mục với lazy loading

- API `GET /v1/api/products` hỗ trợ `category`, `brand`, `tag`, `minPrice`, `maxPrice`, `sort`, `search`, `page`, `limit`.
- UI trang shop dùng `IntersectionObserver` để tự động gọi API tải tiếp sản phẩm khi kéo xuống cuối trang.
- Khi chọn danh mục ở trang chủ hoặc sidebar shop, URL được đồng bộ dạng `/shop?category=macbook`.
- Bộ lọc có thể kết hợp danh mục, hãng, loại sản phẩm, khoảng giá và sắp xếp.
- Trạng thái lọc được hiển thị bằng chip để người dùng xóa từng điều kiện hoặc xóa toàn bộ.

Ví dụ API:

```http
GET /v1/api/products?category=macbook&brand=Apple&minPrice=20000000&maxPrice=50000000&sort=price_desc&page=1&limit=12
```

### 2. Top 10 bán chạy và top 10 xem nhiều

- API `GET /v1/api/products/top` trả danh sách xếp hạng sản phẩm.
- `type=best-selling` sắp xếp theo số lượng đã bán.
- `type=most-viewed` sắp xếp theo lượt xem chi tiết sản phẩm.
- API hỗ trợ `page` và `limit`, mặc định lấy 10 sản phẩm.
- UI trang chủ hiển thị hai carousel ngang bằng Swiper, có nút mũi tên trái/phải và pagination theo chiều ngang.
- Khi người dùng mở chi tiết sản phẩm, backend tự tăng `viewCount` để phục vụ bảng xếp hạng xem nhiều.

Ví dụ API:

```http
GET /v1/api/products/top?type=best-selling&page=1&limit=10
GET /v1/api/products/top?type=most-viewed&page=1&limit=10
```

---

## Các Trang Chính

| Trang | URL | Chức năng |
|---|---|---|
| Trang chủ | `http://localhost:5173/` | Hero, danh mục, top 10 bán chạy, top 10 xem nhiều, các section sản phẩm |
| Đăng nhập | `http://localhost:5173/login` | Đăng nhập JWT, ghi nhớ token |
| Đăng ký | `http://localhost:5173/register` | Tạo tài khoản và gửi email xác nhận |
| Quên mật khẩu | `http://localhost:5173/forgot-password` | Gửi link đặt lại mật khẩu |
| Shop | `http://localhost:5173/shop` | Search, filter, sort, lazy loading sản phẩm |
| Chi tiết sản phẩm | `http://localhost:5173/product/:id` | Ảnh, thông số, giá, tồn kho, sản phẩm tương tự |
| Profile | `http://localhost:5173/profile` | Thông tin tài khoản và đổi mật khẩu |
| Quản lý user | `http://localhost:5173/user` | Danh sách, sửa, xóa user |

---

## Chức Năng Chính

### Auth

- Đăng ký tài khoản, mã hóa mật khẩu bằng `bcrypt`.
- Gửi email xác nhận tài khoản bằng Nodemailer.
- Đăng nhập bằng JWT và lưu token ở `localStorage`.
- Quên mật khẩu, gửi link reset qua email.
- Đặt lại mật khẩu bằng token.
- Lấy thông tin tài khoản từ JWT qua endpoint `/v1/api/account`.

### Sản Phẩm

- Trang chủ có hero, danh mục nhanh và các carousel sản phẩm.
- Trang shop có search debounce, filter theo danh mục/tag/hãng/khoảng giá và sort.
- Lazy loading tự tải thêm sản phẩm khi kéo xuống cuối trang.
- Card sản phẩm đồng bộ kích thước, xử lý giá dài và hiển thị badge, rating, số đã bán, trạng thái tồn kho.
- Trang chi tiết có gallery ảnh, thông số, số lượng, tồn kho, sản phẩm tương tự và tự tăng lượt xem.

### Giao Diện 3D

- Component `TechScene3D.jsx` dùng Three.js để tạo nền laptop/công nghệ.
- Hiệu ứng được điều chỉnh theo từng nhóm trang để phù hợp ngữ cảnh.
- Lớp nền và độ mờ được tinh chỉnh để nội dung, form và card sản phẩm vẫn dễ đọc.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React, Vite, React Router, TailwindCSS, Ant Design |
| UI/Media | Three.js, Swiper, react-icons, ảnh sản phẩm từ URL ngoài |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Email | Nodemailer SMTP |

---

## Cấu Trúc Project

```text
BT05_23110193_DinhNguyenDucDuy/
├── ExpressJS01/
│   ├── src/
│   │   ├── config/              # Database, view engine
│   │   ├── controllers/         # Controller auth/user/product
│   │   ├── data/                # Bộ ảnh sản phẩm demo
│   │   ├── middleware/          # JWT middleware
│   │   ├── models/              # User, Product, Category
│   │   ├── routes/api.js        # Toàn bộ API route
│   │   ├── scripts/seed.js      # Seed dữ liệu laptop/phụ kiện
│   │   ├── services/            # Business logic
│   │   └── server.js
│   └── package.json
├── ReactJS01/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Layout auth dùng chung
│   │   │   ├── home/            # Hero, product section, top carousel
│   │   │   ├── layout/          # Header, TechScene3D
│   │   │   ├── product/         # Chi tiết sản phẩm
│   │   │   └── shop/            # Filter, grid, product card
│   │   ├── pages/               # login, register, shop, home...
│   │   ├── styles/global.css
│   │   └── util/                # Axios API, debounce
│   └── package.json
└── docs/demo/                   # Ảnh demo dùng trong README
```

---

## API Chính

### Auth/User

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/v1/api/register` | Đăng ký và gửi email xác nhận |
| `POST` | `/v1/api/login` | Đăng nhập |
| `GET` | `/v1/api/account` | Lấy thông tin tài khoản từ JWT |
| `GET` | `/v1/api/verify-email/:token` | Xác nhận email |
| `POST` | `/v1/api/resend-verification` | Gửi lại email xác nhận |
| `POST` | `/v1/api/forgot-password` | Gửi link quên mật khẩu |
| `POST` | `/v1/api/reset-password/:token` | Đặt lại mật khẩu |
| `GET` | `/v1/api/user` | Danh sách user |
| `PUT` | `/v1/api/user/:id` | Cập nhật user |
| `DELETE` | `/v1/api/user/:id` | Xóa user |
| `PUT` | `/v1/api/account/change-password` | Đổi mật khẩu |

### Product/Category

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/v1/api/products` | Search/filter/sort/pagination, dùng cho lazy loading shop |
| `GET` | `/v1/api/products/home` | Dữ liệu các section trang chủ |
| `GET` | `/v1/api/products/top` | Top bán chạy hoặc xem nhiều, hỗ trợ `type`, `page`, `limit` |
| `GET` | `/v1/api/products/:id` | Chi tiết sản phẩm, tự tăng `viewCount` |
| `GET` | `/v1/api/products/similar/:id` | Sản phẩm tương tự |
| `GET` | `/v1/api/categories` | Danh mục |
| `POST` | `/v1/api/products` | Tạo sản phẩm |
| `PUT` | `/v1/api/products/:id` | Cập nhật sản phẩm |
| `DELETE` | `/v1/api/products/:id` | Xóa mềm sản phẩm |

---

## Cách Chạy Local

### 1. Backend

```bash
cd BT05_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run seed
npm run dev
```

Backend chạy tại:

```text
http://localhost:8080
```

### 2. Frontend

```bash
cd BT05_23110193_DinhNguyenDucDuy/ReactJS01
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

---

## Cấu Hình Môi Trường

Tạo file `ExpressJS01/.env`:

```env
PORT=8080
MONGO_DB_URL=mongodb://127.0.0.1:27017/bt05
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1d
FRONTEND_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="LaptopStore BT05 <your_email@gmail.com>"
```

Frontend dùng `ReactJS01/.env.development`:

```env
VITE_BACKEND_URL=http://localhost:8080
```

---

## Kiểm Tra Nhanh

```bash
# Kiểm tra frontend build
cd BT05_23110193_DinhNguyenDucDuy/ReactJS01
npm run build

# Kiểm tra cú pháp backend service/server
cd ../ExpressJS01
node --check src/services/productService.js
node --check src/server.js
```

Các case đã kiểm tra:

- Shop tải sản phẩm theo `page` và `limit`, tự load thêm khi kéo xuống cuối trang.
- Lọc theo danh mục, hãng, khoảng giá, tag và sort hoạt động trên cùng URL query.
- API top 10 bán chạy trả dữ liệu theo `sold`.
- API top 10 xem nhiều trả dữ liệu theo `viewCount`.
- Mở chi tiết sản phẩm tự tăng lượt xem.
- Các ảnh README đã được cập nhật đủ cho trang chủ, đăng nhập, đăng ký, quên mật khẩu, shop, bộ lọc, chi tiết sản phẩm và profile.

---

## Ghi Chú

- Cần MongoDB local đang chạy trước khi seed hoặc chạy backend.
- Email xác nhận/quên mật khẩu cần SMTP hợp lệ. Nếu dùng Gmail, cần App Password.
- Ảnh sản phẩm demo được gắn theo tên sản phẩm trong `ExpressJS01/src/data/productImages.js`.
