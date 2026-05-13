# 🔵 BT04 — Redux + Page Wiring

<div align="center">

**Phần đóng góp của thành viên trong dự án nhóm HCMUTE Student Consulting**

| 👤 Sinh viên | 🎓 MSSV | 🏫 Lớp |
|:---:|:---:|:---:|
| **Đinh Nguyễn Đức Duy** | **23110193** | Nhóm 02 — Tiết 2-4 — Phòng A308 |

[![GitHub](https://img.shields.io/badge/GitHub-ShiroKin7448-181717?style=for-the-badge&logo=github)](https://github.com/ShiroKin7448/CNPMM)
[![Group Repo](https://img.shields.io/badge/Nhóm-hcmute--student--consulting-blue?style=for-the-badge&logo=github)](https://github.com/DangTranAnhQuan/hcmute-student-consulting)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)

</div>

---

## 📌 Mô Tả

Đây là phần **Người 4 — Redux + Page Wiring** trong dự án nhóm **hcmute-student-consulting**.

Nhiệm vụ:
- Xây dựng và quản lý **Redux store** (`store.js`)
- Định nghĩa **authSlice** với tất cả actions cho luồng xác thực (`authSlice.js`)
- Tạo **custom hooks** kết nối Redux với API (`hooks.js`)
- Tạo **selectors** để truy cập state (`selectors.js`)
- Xây dựng **ProfilePage** — trang xem/chỉnh sửa thông tin cá nhân (`ProfilePage.jsx`)

---

## 📂 Cấu Trúc File

```
BT04_Redux_Page_Wiring_23110193_DinhNguyenDucDuy/
├── redux/
│   ├── authSlice.js      ← Redux slice: actions & reducers cho auth
│   ├── store.js          ← Cấu hình Redux store
│   ├── hooks.js          ← Custom hooks: useAuth(), useAppDispatch, useAppSelector
│   └── selectors.js      ← Selectors để lấy state từ Redux
├── pages/
│   └── ProfilePage.jsx   ← Trang hồ sơ cá nhân (xem + chỉnh sửa)
└── README.md
```

---

## 🔧 Chi Tiết Từng File

### `redux/authSlice.js`
Redux Slice quản lý toàn bộ trạng thái xác thực:

| Action Group | Actions |
|---|---|
| Register | `registerStart`, `registerSuccess`, `registerFailure` |
| Verify OTP | `verifyOTPStart`, `verifyOTPSuccess`, `verifyOTPFailure` |
| Login | `loginStart`, `loginSuccess`, `loginFailure` |
| Logout | `logout` |
| Forgot Password | `forgotPasswordStart`, `forgotPasswordSuccess`, `forgotPasswordFailure` |
| Reset Password | `resetPasswordStart`, `resetPasswordSuccess`, `resetPasswordFailure` |
| Get Profile | `getProfileStart`, `getProfileSuccess`, `getProfileFailure` |
| Update Profile | `updateProfileStart`, `updateProfileSuccess`, `updateProfileFailure` |
| Misc | `clearError` |

**State shape:**
```javascript
{
  user: null | { email, role, username, ... },
  token: null | string,
  isLoading: boolean,
  error: null | string,
  isAuthenticated: boolean
}
```

---

### `redux/store.js`
Cấu hình Redux store với `@reduxjs/toolkit`:

```javascript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: { auth: authReducer },
});
```

Được nhúng vào ứng dụng thông qua `<Provider store={store}>` trong `index.js`.

---

### `redux/hooks.js`
Custom hooks bọc toàn bộ logic gọi API + dispatch Redux actions:

```javascript
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAuth = () => {
  // Trả về: user, token, isLoading, error, isAuthenticated
  // + các hàm: login, register, verifyOTP,
  //            forgotPassword, resetPassword,
  //            getProfile, updateProfile, logout
};
```

**Xử lý lỗi API:**
- Log chi tiết lỗi (`status`, `responseData`, `message`)
- Parse validation errors từ mảng `errors[]`
- Fallback message tiếng Việt

---

### `redux/selectors.js`
Selectors để truy cập auth state:

```javascript
selectAuth(state)            // toàn bộ auth slice
selectUser(state)            // thông tin user
selectIsAuthenticated(state) // trạng thái đăng nhập
selectIsLoading(state)       // loading state
selectAuthError(state)       // lỗi hiện tại
selectToken(state)           // JWT token
```

---

### `pages/ProfilePage.jsx`
Trang hồ sơ cá nhân với đầy đủ chức năng:

**Tính năng:**
- ✅ Tự động load profile khi vào trang (`getProfile` on mount)
- ✅ Hiển thị thông tin: Username, Email (readonly), Họ tên, SĐT, Địa chỉ
- ✅ Chỉnh sửa thông tin với validation frontend
- ✅ Hiển thị vai trò người dùng (admin / user)
- ✅ Loading state khi lưu
- ✅ Thông báo thành công / lỗi
- ✅ Nút Đăng xuất
- ✅ Redirect về `/login` nếu chưa đăng nhập

**Redux Integration:**
```javascript
const { user, isLoading, error, getProfile, updateProfile, logout } = useAuth();
```

---

## 🔗 Liên Kết Với Dự Án Nhóm

File này là một phần của dự án lớn hơn. Trong dự án nhóm:

| Thành viên | Phần đảm nhận | Route |
|---|---|---|
| **Quân** | Register Page | `/register` |
| **Thiên** | Login Page | `/login` |
| **Khang** | Forgot Password Page | `/forgot-password` |
| **Duy** (người này) | Redux + ProfilePage | `/profile` |

Code được push lên nhánh `feature/edit-profile` của repo nhóm.

---

## 🛠 Tech Stack

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white)

---

## 📌 Cách Tích Hợp Vào Dự Án Nhóm

1. Sao chép thư mục `redux/` vào `frontend/src/redux/`
2. Sao chép `pages/ProfilePage.jsx` vào `frontend/src/pages/`
3. Đảm bảo `index.js` đã wrap `<App>` với `<Provider store={store}>`
4. `App.jsx` đã có route `/profile`, `/user/profile`, `/admin/profile` trỏ đến `ProfilePage`

---

<div align="center">

*Repo được duy trì bởi **Đinh Nguyễn Đức Duy** — MSSV 23110193*
*Môn: Các Công Nghệ Phần Mềm Mới*

</div>
