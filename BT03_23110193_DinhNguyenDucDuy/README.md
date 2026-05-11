# 🚀 BT03 — Hệ Thống Quản Lý Người Dùng FullStack

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5.x-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)](https://ant.design/)

**Bài Tập 03 — Môn Công Nghệ Phần Mềm Mã Nguồn Mở**

*Họ và tên: **Đinh Nguyễn Đức Duy** — MSSV: **23110193***

</div>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Giao diện ứng dụng](#-giao-diện-ứng-dụng)
- [Tác giả](#-tác-giả)

---

## 🌟 Giới Thiệu

Dự án xây dựng một ứng dụng **FullStack** hoàn chỉnh bao gồm:

- **Backend RESTful API** với Node.js + Express.js, kết nối MongoDB, xác thực bằng JWT
- **Frontend SPA** với React.js (Vite), giao diện hiện đại dùng Ant Design theo dark theme
- Tích hợp đầy đủ các luồng: **Đăng ký → Đăng nhập → Xem danh sách User → Quên mật khẩu**

> 📌 Dự án sử dụng **MongoDB** (thay cho MySQL theo yêu cầu mở rộng trong slide bài tập).

---

## ✨ Tính Năng

| Tính năng | Mô tả | Status |
|-----------|-------|--------|
| 🔐 **Đăng ký** | Tạo tài khoản mới, mật khẩu được mã hóa bằng `bcrypt` | ✅ |
| 🔑 **Đăng nhập** | Xác thực bằng JWT, lưu token vào `localStorage` | ✅ |
| 👥 **Danh sách User** | Bảng hiển thị user với tìm kiếm, lọc và phân trang | ✅ |
| 🔒 **Quên mật khẩu** | Gửi email reset link qua SMTP (Nodemailer), hết hạn sau 15 phút | ✅ |
| 🔄 **Duy trì phiên** | F5 trang không bị đăng xuất, tự fetch lại session từ token | ✅ |
| 🛡️ **Auth Guard** | Route `/user` tự redirect về `/login` nếu chưa đăng nhập | ✅ |
| 🌙 **Dark Theme** | Giao diện tối hiện đại với glassmorphism và micro-animations | ✅ |

---

## 🛠 Công Nghệ Sử Dụng

### Backend
| Package | Phiên bản | Mục đích |
|---------|-----------|----------|
| `express` | 5.2.1 | Web framework |
| `mongoose`  9.6.2 | ODM kết nối MongoDB |
| `bcrypt` | 6.0.0 | Mã hóa mật khẩu |
| `jsonwebtoken` | 9.0.3 | Tạo & xác thực JWT |
| `nodemailer` | 6.9.16 | Gửi email qua SMTP |
| `dotenv` | 17.4.2 | Quản lý biến môi trường |
| `cors` | 2.8.6 | Xử lý Cross-Origin |
| `ejs` | 5.0.2 | Template engine |
| `@babel/node` | 7.29.0 | Hỗ trợ ES Modules |
| `nodemon` | 3.1.14 | Auto-restart khi dev |

### Frontend
| Package | Phiên bản | Mục đích |
|---------|-----------|----------|
| `react` | 19.x | UI Framework |
| `vite` | 8.x | Build tool |
| `react-router-dom` | 7.x | Client-side routing |
| `axios` | 1.x | HTTP client |
| `antd` | 5.x | UI component library |
| `@ant-design/icons` | 5.x | Icon library |

---

## 📁 Cấu Trúc Dự Án

```
BT03_23110193_DinhNguyenDucDuy/
│
├── 📂 ExpressJS01/                  # Backend
│   ├── .env                         # Biến môi trường (PORT, DB, JWT, SMTP)
│   ├── .babelrc                     # Cấu hình Babel (ES Modules)
│   ├── package.json
│   └── src/
│       ├── server.js                # Entry point — khởi tạo Express
│       ├── config/
│       │   ├── database.js          # Kết nối MongoDB qua Mongoose
│       │   └── viewEngine.js        # Cấu hình EJS & static files
│       ├── models/
│       │   └── user.js              # Schema: name, email, password, role, resetToken
│       ├── middleware/
│       │   ├── auth.js              # Xác thực JWT, whitelist public routes
│       │   └── delay.js             # Giả lập độ trễ mạng (dev only)
│       ├── services/
│       │   └── userService.js       # Business logic: hash, JWT, nodemailer
│       ├── controllers/
│       │   └── userController.js    # Xử lý request/response
│       └── routes/
│           └── api.js               # Khai báo tất cả API routes
│
└── 📂 ReactJS01/                    # Frontend
    ├── index.html
    ├── .env.development             # VITE_BACKEND_URL
    └── src/
        ├── main.jsx                 # Entry point — Router + Ant Design Config
        ├── App.jsx                  # Root component + fetchAccount on refresh
        ├── styles/
        │   └── global.css           # Design system, CSS variables, animations
        ├── util/
        │   ├── axios.customize.js   # Axios instance + interceptors
        │   └── api.js               # Hàm gọi API tập trung
        ├── components/
        │   ├── context/
        │   │   └── auth.context.jsx # AuthWrapper + useAuth hook
        │   └── layout/
        │       └── header.jsx       # Navigation header động theo auth state
        └── pages/
            ├── home.jsx             # Trang chủ với feature showcase
            ├── login.jsx            # Form đăng nhập
            ├── register.jsx         # Form đăng ký
            ├── user.jsx             # Bảng danh sách người dùng
            └── forgot-password.jsx  # Luồng quên mật khẩu (3 bước)
```

---

## ⚙️ Hướng Dẫn Cài Đặt

### Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) >= 18.x
- [MongoDB](https://www.mongodb.com/try/download/community) đang chạy ở `localhost:27017`
- npm >= 9.x

### 1. Clone dự án

```bash
git clone <link-repo-của-bạn>
cd BT03_23110193_DinhNguyenDucDuy
```

### 2. Cài đặt Backend

```bash
cd ExpressJS01
npm install
```

### 3. Cài đặt Frontend

```bash
cd ../ReactJS01
npm install
```

### 4. Chạy ứng dụng

Mở **2 terminal** riêng biệt:

**Terminal 1 — Backend:**
```bash
cd ExpressJS01
npm run dev
# ✅ Server chạy tại: http://localhost:8080
```

**Terminal 2 — Frontend:**
```bash
cd ReactJS01
npm run dev
# ✅ App chạy tại: http://localhost:5173
```

---

## 🔧 Cấu Hình Môi Trường

### Backend — `ExpressJS01/.env`

```env
# Server
PORT=8080

# MongoDB
MONGO_DB_URL=mongodb://localhost:27017/fullstack02

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1d

# Email SMTP (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_16_chars
EMAIL_FROM="BT03 System <your_email@gmail.com>"

# Frontend URL (dùng cho link reset password trong email)
FRONTEND_URL=http://localhost:5173
```

> 💡 **Lấy Gmail App Password:**
> Google Account → Security → 2-Step Verification → App passwords → Tạo mới → Copy 16 ký tự

### Frontend — `ReactJS01/.env.development`

```env
VITE_BACKEND_URL=http://localhost:8080
```

---

## 📡 API Endpoints

Base URL: `http://localhost:8080`

### 🔓 Public Routes (Không cần xác thực)

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| `GET` | `/` | — | Kiểm tra server health |
| `POST` | `/v1/api/register` | `{name, email, password}` | Đăng ký tài khoản |
| `POST` | `/v1/api/login` | `{email, password}` | Đăng nhập → trả JWT |
| `POST` | `/v1/api/forgot-password` | `{email}` | Gửi email reset mật khẩu |

### 🔐 Protected Routes (Cần `Authorization: Bearer <token>`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/v1/api/user` | Lấy danh sách tất cả user |
| `GET` | `/v1/api/account` | Lấy thông tin tài khoản hiện tại |

### Response Format chuẩn

```json
{
  "EC": 0,        // Error Code: 0 = thành công, khác 0 = lỗi
  "EM": "...",    // Error Message: mô tả kết quả
  "DT": { }       // Data: dữ liệu trả về
}
```

---

## 🖼 Giao Diện Ứng Dụng

### 🏠 Trang Chủ
<img width="1873" height="1026" alt="{CE587F8E-5692-43DA-B77D-6D395DA6D122}" src="https://github.com/user-attachments/assets/b41dbb7b-9256-4527-a970-031e1fdaf139" />

---

### 📝 Trang Đăng Ký
<img width="1873" height="986" alt="{DC9887CF-B81E-42C9-B4CF-A623E3EA2B0B}" src="https://github.com/user-attachments/assets/78ff6979-5927-4dac-992a-16dcd97417cc" />


---

### 🔑 Trang Đăng Nhập
<img width="1870" height="1009" alt="{DD7F3930-5225-4E9F-8011-901A311EEBE7}" src="https://github.com/user-attachments/assets/b08ff1f9-2773-4e99-b210-7b637c14c68f" />


---

### 👥 Trang Quản Lý User
<img width="1872" height="962" alt="{6640AA22-BE67-44AA-90C6-C52CF31B92BF}" src="https://github.com/user-attachments/assets/c2a0f81b-22a0-40c1-98a2-05ceb54fab66" />

---

### 🔒 Trang Quên Mật Khẩu
<img width="1873" height="985" alt="{AEB91B72-D3A6-474E-BA1F-70B922ADECF9}" src="https://github.com/user-attachments/assets/2218521d-f052-4ac2-a580-99177a5c058d" />

---

### 📧 Email Reset Mật Khẩu
<img width="1871" height="1033" alt="{D6CD7A46-C053-427F-8748-5FD91E18D772}" src="https://github.com/user-attachments/assets/6aad3f3f-cf7c-4f5c-906a-ea4b6391d1f0" />

---
<img width="1802" height="991" alt="{F9D9C53F-4032-49D6-835C-5D295E3E25AE}" src="https://github.com/user-attachments/assets/791e8d7d-9002-4fe8-a6d0-e93034041667" />

---
<img width="1872" height="1025" alt="{E2942BF3-18F9-4EAC-8B7C-A84B26469F45}" src="https://github.com/user-attachments/assets/d81c8167-e9d5-400f-b690-3724d9491899" />

---
<img width="1511" height="804" alt="{4C35E388-748C-4670-B6C7-18B54860BA14}" src="https://github.com/user-attachments/assets/8a1470c1-8e1b-4d7e-9e0d-ef523c4aa20d" />

---
## 🔑 Luồng Hoạt Động

```
[Register]
  └─► Nhập name/email/password
       └─► bcrypt hash password (saltRounds=10)
            └─► Lưu vào MongoDB
                 └─► Redirect → /login ✅

[Login]
  └─► Nhập email/password
       └─► So sánh bcrypt hash
            └─► Tạo JWT (expire: 1d)
                 └─► Lưu token vào localStorage
                      └─► Redirect → / ✅

[F5 / Refresh trang]
  └─► Đọc token từ localStorage
       └─► Gọi GET /v1/api/account (Bearer token)
            └─► Restore auth state vào Context ✅

[Forgot Password]
  └─► Nhập email
       └─► Tạo reset token ngẫu nhiên (crypto.randomBytes)
            └─► Hash SHA-256 → lưu DB (expire 15 phút)
                 └─► Gửi email chứa link reset (Nodemailer)
                      └─► User nhấn link → đặt mật khẩu mới ✅
```

---

## 👨‍💻 Tác Giả

<div align="center">

| | |
|--|--|
| **Họ và tên** | Đinh Nguyễn Đức Duy |
| **MSSV** | 23110193 |
| **Môn học** | Công Nghệ Phần Mềm Mã Nguồn Mở |
| **Bài tập** | BT03 — FullStack Node.js + React.js |

</div>

---

<div align="center">

Made with ❤️ by **Đinh Nguyễn Đức Duy** — 23110193

</div>
