# BT02 - Edit Profile API

**Sinh viên:** Đinh Nguyễn Đức Duy

**MSSV:** 23110193

BT02 là bài tập backend Express.js tập trung vào chức năng chỉnh sửa hồ sơ người dùng có xác thực JWT và phân quyền theo role.

## Chức Năng

- Kết nối MongoDB bằng Mongoose.
- Middleware đọc JWT từ cookie `accessToken`.
- Middleware phân quyền `authorize("user")`.
- API cập nhật `username` của người dùng đang đăng nhập.
- Trả lỗi `401` khi chưa đăng nhập và `403` khi token/role không hợp lệ.

## Cấu Trúc

```text
BT02_EditProfile_23110193_DinhNguyenDucDuy/
└── EditProfile/
    ├── src/
    │   ├── app.js
    │   ├── controllers/authController.js
    │   ├── middleware/auth.js
    │   ├── models/User.js
    │   └── routes/authRoutes.js
    ├── package.json
    └── .env.example
```

## Cách Chạy

```bash
cd BT02_EditProfile_23110193_DinhNguyenDucDuy/EditProfile
npm install
copy .env.example .env
npm start
```

Server mặc định:

```text
http://localhost:3002
```

## Biến Môi Trường

```env
PORT=3002
MONGO_URI=mongodb://127.0.0.1:27017/bt02_edit_profile
ACCESS_TOKEN_SECRET=your_access_token_secret
```

## Trang/API Demo

| Mục | Method | URL | Ghi chú |
|---|---:|---|---|
| Edit Profile | POST | `http://localhost:3002/api/auth/edit-profile` | Cần cookie `accessToken` hợp lệ, role `user` |

Body mẫu:

```json
{
  "username": "duy_demo"
}
```

Khi gọi API không có cookie đăng nhập, server trả `401`, xác nhận middleware bảo vệ route đang hoạt động.

## Kết Quả Kiểm Tra Local

- Đã chạy `npm install` thành công.
- Đã chạy server bằng `node src/app.js`.
- `POST /api/auth/edit-profile` trả `401` khi chưa có token, đúng với yêu cầu xác thực.
