# Frontend - Tư vấn Sinh viên HCMUTE

Giao diện người dùng (UI) được xây dựng bằng React.js, TailwindCSS, Redux Toolkit và Axios.

## 📋 Cấu trúc dự án

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── UI.jsx              # Reusable UI components (Input, Button, Card, Alert)
│   │   ├── Layout.jsx          # Header, Footer, Navbar components
│   │   └── Forms.jsx           # Form components (LoginForm, RegisterForm, OTPForm, etc)
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing page
│   │   ├── LoginPage.jsx       # Login functionality
│   │   ├── RegisterPage.jsx    # Registration with OTP verification
│   │   ├── ForgotPasswordPage.jsx  # Password reset workflow
│   │   └── ProfilePage.jsx     # User profile with edit
│   ├── redux/
│   │   ├── store.js            # Redux store configuration
│   │   ├── authSlice.js        # Auth state management
│   │   └── hooks.js            # Custom hooks for auth
│   ├── services/
│   │   └── api.js              # Axios API client with interceptors
│   ├── utils/
│   │   └── ProtectedRoute.jsx  # Route protection and auth guards
│   ├── App.jsx                 # Main application component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── .env                        # Environment variables
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình biến môi trường

Sửa file `.env`:

```
REACT_APP_API_URL=http://localhost:3000/api
```

### 3. Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ mở ở `http://localhost:3000`

## 📦 Thư viện sử dụng

- **React** - UI library
- **React Router DOM** - Routing
- **Redux Toolkit** - State management
- **React Redux** - Redux bindings for React
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

## 🎨 Các trang chính

### 1. **Trang chủ** (`/`)

- Landing page với thông tin về dịch vụ
- Các tính năng chính của nền tảng
- Liên kết đến đăng nhập/đăng ký

### 2. **Đăng nhập** (`/login`)

- Form đăng nhập với validation
- Liên kết quên mật khẩu
- Chuyển hướng dựa trên role (admin/user)

### 3. **Đăng ký** (`/register`)

- Multi-step form: đăng ký → xác nhận OTP
- Validation email, password, username
- Gửi OTP qua email
- Kích hoạt tài khoản

### 4. **Quên mật khẩu** (`/forgot-password`)

- Bước 1: Nhập email
- Bước 2: Xác nhận OTP
- Bước 3: Đặt mật khẩu mới

### 5. **Hồ sơ** (`/profile`, `/user/profile`, `/admin/profile`)

- Xem thông tin hồ sơ
- Chỉnh sửa thông tin cá nhân
- Hiển thị role người dùng
- Đăng xuất

## 🔐 Xác thực và bảo mật

### JWT Authentication

- Token được lưu trữ trong localStorage
- Tự động thêm token vào header của mỗi request
- Xử lý lỗi 401 (token hết hạn) và chuyển hướng đến login

### Rate Limiting

- Bảo vệ các endpoint login/register khỏi brute force attacks
- Được xử lý ở backend

### OTP Verification

- Xác thực đăng ký qua OTP
- Xác thực reset mật khẩu qua OTP
- Mã OTP hết hạn sau 5 phút

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Navbar responsive với menu mobile

## 🎯 Tính năng chính

### Quản lý trạng thái (Redux)

- Lưu trữ thông tin người dùng
- Quản lý token
- Lưu trữ lỗi
- Trạng thái loading

### Validation

- Client-side validation trước khi gửi
- Hiển thị lỗi từ backend
- Real-time error clearing

### Reusable Components

- UI components (Input, Button, Card, Alert, Spinner)
- Form components (LoginForm, RegisterForm, OTPForm, etc)
- Layout components (Header, Navbar, Footer)

## 🔗 Tích hợp API

Tất cả các endpoint API được định nghĩa trong `src/services/api.js`:

```javascript
-POST / auth / register -
  POST / auth / verify -
  otp -
  POST / auth / login -
  POST / auth / forgot -
  password -
  POST / auth / reset -
  password -
  GET / auth / profile -
  PUT / auth / profile;
```

## 🚫 Route Protection

- **Public Routes**: HomePage, LoginPage, RegisterPage, ForgotPasswordPage
- **Protected Routes**: ProfilePage (yêu cầu xác thực)
- **Role-based Routes**:
  - `/user/profile` - Chỉ user
  - `/admin/profile` - Chỉ admin

## 📝 Commits cho Github

Khi hoàn thành các chức năng, tạo commits theo cấu trúc:

```bash
git add .
git commit -m "feat: implement login feature with validation"
git commit -m "feat: implement register with OTP verification"
git commit -m "feat: implement forgot password workflow"
git commit -m "feat: implement profile management"
git commit -m "style: add responsive design and tailwind styling"
```

Push lên repository cá nhân và nhóm:

```bash
git push origin main
git push upstream main
```

## 🤝 Phân chia công việc cho team

Mỗi thành viên có thể xử lý:

1. **Thành viên 1**: Login feature
2. **Thành viên 2**: Register + OTP verification
3. **Thành viên 3**: Forgot Password + Reset Password
4. **Thành viên 4**: Profile + Edit Profile
5. **Thành viên 5**: UI/UX refinement và responsive design

## 🐛 Debugging

- Mở DevTools: F12 hoặc Ctrl+Shift+I
- Xem Redux state: Redux DevTools (cài đặt extension)
- Xem API calls: Network tab
- Xem console errors: Console tab

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Tác giả**: Nhóm 6 - HCMUTE  
**Ngày tạo**: 2024
