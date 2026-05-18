# Backend - Tư vấn Sinh viên HCMUTE

API Backend được xây dựng với Node.js, Express.js, MongoDB, và các bảo mật tiên tiến.

## 📋 Cấu trúc dự án

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js        # Xử lý logic xác thực
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   ├── rateLimit.js             # Rate limiting middleware
│   │   └── validator.js             # Input validation middleware
│   ├── models/
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   └── authRoutes.js            # Authentication routes
│   └── app.js                       # Express app configuration
├── .env                             # Environment variables
├── .gitignore                       # Git ignore patterns
├── package.json                     # Dependencies
└── README.md                        # Documentation
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/hcmute-student-consulting

# JWT
ACCESS_TOKEN_SECRET=your-secret-key-here

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=3000
CLIENT_URL=http://localhost:3000
```

### 3. Chạy server

**Development (with nodemon)**:

```bash
npm run dev
```

**Production**:

```bash
npm start
```

Server sẽ chạy ở `http://localhost:3000`

## 🔐 Tính năng bảo mật

### 1. **Rate Limiting**

- Giới hạn số lần request đến các endpoint login/register
- Ngăn chặn brute force attacks
- Giới hạn: 5 requests / 15 phút

### 2. **JWT Authentication**

- Token với thời hạn 15 phút
- Lưu trong httpOnly cookie (bảo vệ XSS)
- Verification middleware bắt buộc cho protected routes

### 3. **Password Hashing**

- Bcryptjs với salt rounds = 10
- Mật khẩu không bao giờ lưu dạng plain text

### 4. **OTP Verification**

- Mã OTP 6 chữ số
- Hết hạn sau 5 phút
- Gửi qua email Gmail

### 5. **CORS Protection**

- Chỉ cho phép requests từ frontend (localhost:3000)
- Credentials mode: true (cho phép cookies)

## 📡 API Endpoints

### Authentication Endpoints

#### 1. **Register (Đăng ký)**

```
POST /api/auth/register

Request body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201):
{
  "message": "Đã gửi mã OTP qua email, vui lòng kiểm tra!"
}

Validations:
- Email hợp lệ và chưa tồn tại
- Password >= 6 ký tự
- Username không được để trống
```

#### 2. **Verify OTP (Xác thực OTP)**

```
POST /api/auth/verify-otp

Request body:
{
  "email": "john@example.com",
  "otp": "123456"
}

Response (200):
{
  "message": "Xác thực OTP thành công!",
  "role": "user",
  "accessToken": "jwt-token"
}

Validations:
- OTP chính xác
- OTP chưa hết hạn
```

#### 3. **Login (Đăng nhập)**

```
POST /api/auth/login

Request body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Đăng nhập thành công!",
  "role": "user"
}

Validations:
- Email tồn tại
- Password chính xác
- Tài khoản đã được kích hoạt OTP

Rate Limit: 5 requests / 15 phút
```

#### 4. **Forgot Password (Quên mật khẩu)**

```
POST /api/auth/forgot-password

Request body:
{
  "email": "john@example.com"
}

Response (200):
{
  "message": "Đã gửi OTP đổi mật khẩu!"
}

Validations:
- Email tồn tại
```

#### 5. **Reset Password (Đặt lại mật khẩu)**

```
POST /api/auth/reset-password

Request body:
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}

Response (200):
{
  "message": "Đổi mật khẩu thành công!"
}

Validations:
- OTP chính xác
- OTP chưa hết hạn
```

#### 6. **Get Profile (Lấy hồ sơ)** - Protected

```
GET /api/auth/profile

Headers:
{
  "Authorization": "Bearer <token>",
  "Cookie": "accessToken=<token>"
}

Response (200):
{
  "_id": "user-id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "fullName": "John Doe",
  "phone": "0123456789",
  "address": "123 Street",
  "isActivated": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}

Requires: Valid JWT token
```

#### 7. **Update Profile (Cập nhật hồ sơ)** - Protected

```
PUT /api/auth/profile

Headers:
{
  "Authorization": "Bearer <token>",
  "Cookie": "accessToken=<token>"
}

Request body:
{
  "username": "john_doe",
  "fullName": "John Doe",
  "phone": "0987654321",
  "address": "456 Avenue"
}

Response (200):
{
  "_id": "user-id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "fullName": "John Doe",
  "phone": "0987654321",
  "address": "456 Avenue",
  "isActivated": true,
  "updatedAt": "2024-01-02T00:00:00.000Z"
}

Requires: Valid JWT token
```

## 🗄️ Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  username: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (enum: ["user", "admin"], default: "user"),
  fullName: String,
  phone: String,
  address: String,
  otp: String,
  otpExpires: Date,
  isActivated: Boolean (default: false),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

## 🔄 Authentication Flow

### Registration Flow

```
1. User submits register form
2. Backend validates input
3. Check if email already exists
4. Hash password with bcryptjs
5. Generate OTP
6. Save user (isActivated: false)
7. Send OTP to email
8. Frontend receives message to check email

9. User submits OTP
10. Verify OTP matches and not expired
11. Set isActivated: true
12. Generate JWT token
13. Return token to frontend
```

### Login Flow

```
1. User submits email & password
2. Find user by email
3. Verify password with bcryptjs
4. Check if account is activated
5. Generate JWT token (15 min expiry)
6. Set httpOnly cookie with token
7. Return role to determine redirect
```

### Password Reset Flow

```
1. User submits email
2. Check if email exists
3. Generate new OTP
4. Save OTP with 5 min expiry
5. Send OTP to email

6. User submits OTP
7. Verify OTP is correct and not expired

8. User submits new password
9. Hash new password
10. Update user password
11. Clear OTP
12. Return success
```

## 🛠️ Middleware

### 1. Rate Limiting (`rateLimit.js`)

```javascript
- loginLimiter: 5 requests / 15 minutes
- Applied to: /register, /login
- Returns 429 (Too Many Requests) when exceeded
```

### 2. Validation (`validator.js`)

```javascript
- registerValidator: Validates register input
  - Email format
  - Password length >= 6
  - Username not empty
```

### 3. Authentication (`auth.js`)

```javascript
- verifyToken: Checks JWT token from cookie or Authorization header
- verifyAdmin: Checks if user has admin role
- Returns 401 if no token
- Returns 403 if token invalid/expired
```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication
2. Create App Password
3. Use App Password in `EMAIL_PASS` env variable

### Email Templates

- **Registration OTP**: Gửi mã xác thực 6 chữ số
- **Password Reset OTP**: Gửi mã đổi mật khẩu 6 chữ số

## 🐛 Error Handling

Tất cả endpoints trả về error messages dưới dạng:

```json
{
  "message": "Error description"
}
```

Common Error Codes:

- 400: Bad Request (Validation failed)
- 401: Unauthorized (No token)
- 403: Forbidden (Invalid token/No permission)
- 404: Not Found
- 429: Too Many Requests (Rate limit)
- 500: Internal Server Error

## 🧪 Testing

### Manual Testing với Postman

1. Register user
2. Verify OTP (use same OTP from console)
3. Login
4. Copy token từ cookies
5. Test protected endpoints dengan token

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Profile (with token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

## 📝 Commits cho Github

```bash
git add .
git commit -m "feat: setup backend with Express and MongoDB"
git commit -m "feat: implement authentication with JWT"
git commit -m "feat: add OTP verification for registration"
git commit -m "feat: implement password reset functionality"
git commit -m "feat: add profile management endpoints"
git commit -m "feat: add rate limiting and validation"
git commit -m "feat: add CORS support"

git push origin main
git push upstream main
```

## 🤝 Phân chia công việc

Mỗi thành viên có thể chịu trách nhiệm:

1. Registration + OTP verification
2. Login + JWT
3. Password reset
4. Profile management
5. Security & Documentation

## 📚 Tài liệu tham khảo

- [Express.js](https://expressjs.com)
- [Mongoose](https://mongoosejs.com)
- [JWT](https://jwt.io)
- [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Nodemailer](https://nodemailer.com)

---

**Tác giả**: Nhóm 6 - HCMUTE  
**Ngày tạo**: 2024
