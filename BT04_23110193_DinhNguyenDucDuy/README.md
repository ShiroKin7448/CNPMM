# 🛒 BT04 — FullStack E-Commerce: Laptop & Phụ Kiện

<div align="center">

**Bài tập cá nhân — API + UI | Môn: Các Công Nghệ Phần Mềm Mới**

| 👤 Sinh viên | 🎓 MSSV | 🏫 Lớp |
|:---:|:---:|:---:|
| **Đinh Nguyễn Đức Duy** | **23110193** | Nhóm 02 — Tiết 2-4 |

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

## 📌 Mô Tả

BT04 tiếp nối từ BT03, bổ sung đầy đủ tính năng **E-Commerce** cho cửa hàng **Laptop & Phụ Kiện** sử dụng TailwindCSS. Giao diện sáng, sinh động, hiện đại.

---

## ✅ Chức Năng Đã Thực Hiện

### 🏪 Trang Bán Hàng (sau khi đăng nhập)
- **Trang chủ** — Hero banner gradient, danh mục nhanh, 4 section sản phẩm: 🔥 Giảm Giá, 🏆 Bán Chạy, ✨ Mới Nhất, ⭐ Nổi Bật
- Mỗi section scroll ngang bằng **Swiper.js**

### 🔍 Trang Shop (`/shop`)
- Tìm kiếm realtime với **debounce**
- Sidebar filter: **Danh mục**, **Tag**, **Thương hiệu**, **Khoảng giá**
- Sort: Mới nhất, Bán chạy, Giá tăng/giảm, Đánh giá
- Pagination
- Mobile drawer filter

### 📦 Trang Chi Tiết Sản Phẩm (`/product/:id`)
- **Swiper** ảnh chính + thumbnail (nếu nhiều ảnh)
- Giá gốc / giá sale với % tiết kiệm
- 🟢 Báo tồn kho — số lượng đã bán
- Tăng giảm số lượng `[−] N [+]` (max = stock)
- Thông số kỹ thuật (bảng CPU, RAM, SSD, GPU...)
- **Sản phẩm tương tự** cùng danh mục (Swiper)
- Breadcrumb điều hướng

### 👤 Trang Profile (`/profile`)
- Hiển thị thông tin tài khoản
- Form đổi mật khẩu với password strength indicator

### 👥 Quản lý User (`/user`)
- Bảng danh sách user với tìm kiếm, filter, sort
- Admin: nút **Sửa** (modal) và **Xóa** (confirm dialog)

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/v1/api/register` | Đăng ký |
| POST | `/v1/api/login` | Đăng nhập |
| GET | `/v1/api/account` | Thông tin tài khoản |
| POST | `/v1/api/forgot-password` | Quên mật khẩu |
| POST | `/v1/api/reset-password/:token` | Đặt lại mật khẩu |

### User Management *(mới trong BT04)*
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/v1/api/user` | Danh sách user |
| PUT | `/v1/api/user/:id` | Cập nhật user |
| DELETE | `/v1/api/user/:id` | Xóa user |
| PUT | `/v1/api/account/change-password` | Đổi mật khẩu |

### Products *(mới trong BT04)*
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/v1/api/products` | Danh sách + search/filter/sort/pagination |
| GET | `/v1/api/products/home` | Dữ liệu trang chủ |
| GET | `/v1/api/products/:id` | Chi tiết sản phẩm |
| GET | `/v1/api/products/similar/:id` | Sản phẩm tương tự |
| GET | `/v1/api/categories` | Danh sách danh mục |
| POST | `/v1/api/products` | Tạo sản phẩm (admin) |
| PUT | `/v1/api/products/:id` | Cập nhật sản phẩm (admin) |
| DELETE | `/v1/api/products/:id` | Xóa sản phẩm (admin) |

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React.js + Vite + **TailwindCSS v3** + Ant Design |
| Animation | **Swiper.js** (ảnh + scroll ngang) |
| Icons | react-icons |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Email | Nodemailer (SMTP Gmail) |

---

## 🚀 Cách Chạy

```bash
# 1. Clone repo
git clone https://github.com/ShiroKin7448/CNPMM.git
cd CNPMM/BT/BT04_23110193_DinhNguyenDucDuy

# 2. Backend
cd ExpressJS01
npm install
# Đảm bảo MongoDB đang chạy local
npm run seed    # Seed 20 sản phẩm + 4 danh mục
npm run dev     # http://localhost:8080

# 3. Frontend (terminal khác)
cd ../ReactJS01
npm install
npm run dev     # http://localhost:5173
```

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x (local, port 27017)
- npm >= 9.x

---

## 📂 Cấu Trúc Project

```
BT04_23110193_DinhNguyenDucDuy/
├── ExpressJS01/                  # Backend
│   └── src/
│       ├── models/               # User, Product, Category
│       ├── services/             # Business logic
│       ├── controllers/          # Request handlers
│       ├── routes/api.js         # All routes
│       ├── middleware/auth.js    # JWT middleware
│       └── scripts/seed.js       # Seed 20 products
└── ReactJS01/                    # Frontend
    └── src/
        ├── pages/                # home, shop, product-detail, profile, user...
        ├── components/
        │   ├── shop/             # ProductCard, ProductGrid, FilterSidebar
        │   ├── home/             # HeroBanner, ProductSection
        │   ├── product/          # ImageSwiper, QuantitySelector, SimilarProducts
        │   └── layout/header.jsx
        └── util/                 # api.js, axios.customize.js, useDebounce.js
```
