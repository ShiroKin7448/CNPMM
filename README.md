# 📚 CNPMM — Các Công Nghệ Phần Mềm Mới

<div align="center">

**Tổng hợp bài tập môn học — Công Nghệ Phần Mềm Mã Nguồn Mở**

| 👤 Sinh viên | 🎓 MSSV | 🏫 Lớp |
|:---:|:---:|:---:|
| **Đinh Nguyễn Đức Duy** | **23110193** | Nhóm 02 — Tiết 2-4 — Phòng A308 |

[![GitHub](https://img.shields.io/badge/GitHub-ShiroKin7448-181717?style=for-the-badge&logo=github)](https://github.com/ShiroKin7448/CNPMM)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

</div>

---

## 📂 Danh Sách Bài Tập

| # | Tên bài | Công nghệ chính | Link |
|:-:|---------|----------------|------|
| BT01 | Quản lý User — CRUD với EJS | Express.js · MongoDB · EJS · Bootstrap | [📁 Xem thư mục](./BT01_23110193_DinhNguyenDucDuy/) |
| BT02 | Edit Profile — Authentication & Authorization | Express.js · MongoDB · JWT · Nodemailer | [📁 Xem thư mục](./BT02_EditProfile_23110193_DinhNguyenDucDuy/) |
| BT03 | FullStack — Node.js + React.js | Express.js · MongoDB · React · Ant Design · JWT | [📁 Xem thư mục](./BT03_23110193_DinhNguyenDucDuy/) |
| BT03(NHOM) | Redux + Page Wiring — Dự án nhóm | React · Redux Toolkit · Axios · TailwindCSS | [📁 Xem thư mục](./BT03(NHOM)_Redux_Page_Wiring_23110193_DinhNguyenDucDuy/) |
| BT04 | **E-Commerce — Laptop Store (API + UI)** | React · **TailwindCSS** · **Swiper** · Express · MongoDB | [📁 Xem thư mục](./BT04_23110193_DinhNguyenDucDuy/) |

---

## 📖 Chi Tiết Từng Bài

---

### 🟢 BT01 — Quản Lý Người Dùng CRUD

> **Thư mục:** [`BT01_23110193_DinhNguyenDucDuy/`](./BT01_23110193_DinhNguyenDucDuy/)

Xây dựng hệ thống quản lý người dùng cơ bản theo mô hình **MVC**, render giao diện phía server bằng EJS.

**Chức năng:**
- ✅ **Create** — Thêm mới người dùng
- ✅ **Read** — Hiển thị danh sách từ MongoDB
- ✅ **Update** — Cập nhật thông tin
- ✅ **Delete** — Xóa người dùng

**Tech Stack:**

![Express](https://img.shields.io/badge/Express.js-000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Template-B4CA65?style=flat-square)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat-square&logo=bootstrap&logoColor=white)

**Cách chạy:**
```bash
cd BT01_23110193_DinhNguyenDucDuy
npm install
npm start
# Truy cập: http://localhost:8088/crud
```

---

### 🟡 BT02 — Edit Profile (Auth & Authorization)

> **Thư mục:** [`BT02_EditProfile_23110193_DinhNguyenDucDuy/`](./BT02_EditProfile_23110193_DinhNguyenDucDuy/)

Xây dựng hệ thống xác thực người dùng đầy đủ với bảo vệ route, refresh token và gửi email.

**Chức năng:**
- ✅ Đăng ký / Đăng nhập với JWT
- ✅ Cập nhật thông tin cá nhân (Edit Profile)
- ✅ Rate limiting chống brute-force (`express-rate-limit`)
- ✅ Validate input với `express-validator`
- ✅ Gửi email qua Nodemailer
- ✅ Mã hóa mật khẩu bằng `bcryptjs`

**Tech Stack:**

![Express](https://img.shields.io/badge/Express.js-000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens)
![Nodemailer](https://img.shields.io/badge/Nodemailer-22B573?style=flat-square)

**Cách chạy:**
```bash
cd BT02_EditProfile_23110193_DinhNguyenDucDuy/EditProfile
npm install
# Cấu hình .env (PORT, MONGO_DB_URL, JWT_SECRET, EMAIL_*)
npm start
```

---

### 🔵 BT03 — FullStack Node.js + React.js

> **Thư mục:** [`BT03_23110193_DinhNguyenDucDuy/`](./BT03_23110193_DinhNguyenDucDuy/)
> **README chi tiết:** [📄 Xem tại đây](./BT03_23110193_DinhNguyenDucDuy/README.md)

Ứng dụng FullStack hoàn chỉnh với **REST API** (Express) và **SPA** (React + Ant Design), giao tiếp qua Axios với JWT Authentication.

**Chức năng:**
- ✅ Register / Login với JWT + bcrypt
- ✅ Danh sách User (bảng có search, filter, sort)
- ✅ Forgot Password → gửi email reset link (15 phút)
- ✅ Reset Password → đặt mật khẩu mới qua token
- ✅ Duy trì session khi F5 trang
- ✅ Dark theme hiện đại với glassmorphism

**Tech Stack:**

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant_Design-0170FE?style=flat-square&logo=antdesign&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens)

**Cách chạy:**
```bash
# Terminal 1 — Backend
cd BT03_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run dev        # http://localhost:8080

# Terminal 2 — Frontend
cd BT03_23110193_DinhNguyenDucDuy/ReactJS01
npm install
npm run dev        # http://localhost:5173
```

---

<!--
=======================================================
  HƯỚNG DẪN THÊM BÀI TẬP MỚI (đọc kỹ trước khi thêm)
=======================================================

1. Tạo thư mục với đúng format tên:
   BT[số]_23110193_DinhNguyenDucDuy

2. Thêm 1 dòng vào bảng "Danh Sách Bài Tập" ở trên:
   | BT0X | Tên bài | Tech Stack | [📁 Xem thư mục](./BT0X_.../) |

3. Copy khối template dưới đây và điền thông tin:

---

### 🟣 BT0X — Tên Bài Tập

> **Thư mục:** [`BT0X_23110193_DinhNguyenDucDuy/`](./BT0X_23110193_DinhNguyenDucDuy/)

Mô tả ngắn về bài tập này.

**Chức năng:**
- ✅ Chức năng 1
- ✅ Chức năng 2

**Tech Stack:**
![...badge...]

**Cách chạy:**
```bash
cd BT0X_...
npm install
npm start
```

=======================================================
-->

---

### 🟣 BT03(NHOM) — Redux + Page Wiring (Dự Án Nhóm)

> **Thư mục:** [`BT03(NHOM)_Redux_Page_Wiring_23110193_DinhNguyenDucDuy/`](./BT03(NHOM)_Redux_Page_Wiring_23110193_DinhNguyenDucDuy/)
> **README chi tiết:** [📄 Xem tại đây](./BT03(NHOM)_Redux_Page_Wiring_23110193_DinhNguyenDucDuy/README.md)

Phần đóng góp của Đinh Nguyễn Đức Duy trong dự án nhóm **hcmute-student-consulting** — hệ thống tư vấn sinh viên HCMUTE. Đảm nhận vai trò quản lý **Redux state** và xây dựng **ProfilePage**.

**Chức năng:**
- ✅ Redux store với `@reduxjs/toolkit`
- ✅ `authSlice.js` — đầy đủ actions cho Register, Login, OTP, Forgot/Reset Password, Profile
- ✅ `hooks.js` — `useAuth()` hook kết nối Redux + Axios API
- ✅ `selectors.js` — selectors truy cập auth state
- ✅ `ProfilePage.jsx` — xem/chỉnh sửa hồ sơ, validation, logout

**Tech Stack:**

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

**Link repo nhóm:** [DangTranAnhQuan/hcmute-student-consulting](https://github.com/DangTranAnhQuan/hcmute-student-consulting) — nhánh `feature/edit-profile`

---

### 🛒 BT04 — E-Commerce Laptop Store (API + UI Cá Nhân)

> **Thư mục:** [`BT04_23110193_DinhNguyenDucDuy/`](./BT04_23110193_DinhNguyenDucDuy/)
> **README chi tiết:** [📄 Xem tại đây](./BT04_23110193_DinhNguyenDucDuy/README.md)

Bài tập cá nhân **API + UI** — Cửa hàng **Laptop & Phụ Kiện** FullStack với TailwindCSS. Giao diện sáng, sinh động, hiện đại.

**Chức năng mới (tiếp nối BT03):**
- ✅ **Trang chủ bán hàng** — Hero banner, section Giảm Giá / Bán Chạy / Mới Nhất / Nổi Bật
- ✅ **Trang Shop** — Tìm kiếm realtime, filter (danh mục, hãng, giá, tag), sort, pagination
- ✅ **Chi tiết sản phẩm** — Swiper ảnh + thumbnail, tồn kho, số bán, tăng/giảm số lượng, sản phẩm tương tự
- ✅ **Profile Page** — Xem thông tin + đổi mật khẩu
- ✅ **CRUD User** — Admin sửa/xóa người dùng
- ✅ 8 Product API mới (search, filter, sort, pagination, similar...)

**Tech Stack:**

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Swiper](https://img.shields.io/badge/Swiper.js-6332F6?style=flat-square)
![Express](https://img.shields.io/badge/Express.js-000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

**Cách chạy:**
```bash
# Backend
cd BT04_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run seed   # Seed 20 sản phẩm laptop
npm run dev    # http://localhost:8080

# Frontend
cd ../ReactJS01
npm install
npm run dev    # http://localhost:5173
```

---

## 🛠 Yêu Cầu Hệ Thống

Tất cả bài tập trong repo này yêu cầu:

| Công cụ | Phiên bản tối thiểu | Tải về |
|---------|-------------------|--------|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org/) |
| MongoDB | >= 6.x | [mongodb.com](https://www.mongodb.com/try/download/community) |
| npm | >= 9.x | Đi kèm Node.js |
| Git | Bất kỳ | [git-scm.com](https://git-scm.com/) |

---

## 📌 Ghi Chú Chung

<div align="center">

*Repo được duy trì bởi **Đinh Nguyễn Đức Duy** — MSSV 23110193*
*Môn: Các Công Nghệ Phần Mềm Mới*

</div>
