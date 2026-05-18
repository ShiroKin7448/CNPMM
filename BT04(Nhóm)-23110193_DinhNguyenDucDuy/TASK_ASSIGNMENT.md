# 📋 PHÂN CÔNG CÔNG VIỆC - HỆ THỐNG TƯ VẤN SINH VIÊN

## 👥 THÀNH VIÊN NHÓM

| Tên       | Công việc                       | Route              | API Endpoint                                         |
| --------- | ------------------------------- | ------------------ | ---------------------------------------------------- |
| **Quân**  | Register (Đăng ký)              | `/register`        | POST `/api/auth/register`                            |
| **Thiên** | Login (Đăng nhập)               | `/login`           | POST `/api/auth/login`                               |
| **Khang** | Forgot Password (Quên mật khẩu) | `/forgot-password` | POST `/api/auth/forgot-password` + `/reset-password` |
| **Duy**   | Edit Profile (Chỉnh sửa hồ sơ)  | `/profile`         | GET + PUT `/api/auth/profile`                        |

---

## 🛠️ YÊU CẦU KỸ THUẬT CHUNG

### Framework & Libraries

- ✅ **React.js** (v18+)
- ✅ **TailwindCSS** (xem file `tailwind.config.js`)
- ✅ **Axios** (gọi API)
- ✅ **Redux Toolkit** (quản lý state)
- ✅ **React Router** (navigation)

### Cấu trúc File

```
frontend/src/
├── pages/
│   ├── RegisterPage.jsx (Quân)
│   ├── LoginPage.jsx (Thiên)
│   ├── ForgotPasswordPage.jsx (Khang)
│   └── ProfilePage.jsx (Duy)
├── components/
│   └── Forms.jsx (component form dùng chung)
├── redux/
│   └── authSlice.js (đã có, chỉnh sửa nếu cần)
├── services/
│   └── api.js (đã có, sử dụng các function có sẵn)
└── utils/
    └── helpers.js (helper function nếu cần)
```

### API Base URL

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎯 CÔNG VIỆC CHI TIẾT

### 1️⃣ QUÂN - REGISTER PAGE

**File cần tạo/chỉnh sửa:**

- `src/pages/RegisterPage.jsx` (TẠO MỚI)
- `src/components/Forms.jsx` (thêm `RegisterForm`)

**Yêu cầu:**

1. Tạo form đăng ký với:
   - ✅ Input: Username, Email, Password, Confirm Password
   - ✅ Validation frontend (email format, password length, password match)
   - ✅ Submit button có loading state
   - ✅ Error message display

2. Redux Integration:

   ```javascript
   // Dispatch actions
   dispatch(registerStart());
   // Call API via axios
   await authAPI.register(formData);
   // On success: dispatch registerSuccess()
   // On error: dispatch registerFailure(error message)
   ```

3. Navigation:
   - Sau khi register thành công → Chuyển hướng đến OTP verification page
   - Link đến Login page: "Đã có tài khoản? Đăng nhập"

4. UI Components sử dụng:
   - `<Header>` - Tiêu đề page
   - `<Card>` - Container
   - `<Input>` - Text input
   - `<Button>` - Submit button
   - `<Alert>` - Error message

**Hướng dẫn code:**

```javascript
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  registerStart,
  registerSuccess,
  registerFailure,
} from "../redux/authSlice";
import { authAPI } from "../services/api";

const handleRegister = async (formData) => {
  dispatch(registerStart());
  try {
    const response = await authAPI.register(formData);
    dispatch(registerSuccess());
    // Chuyển đến OTP verification page
    navigate("/verify-otp", { state: { email: formData.email } });
  } catch (error) {
    dispatch(registerFailure(error.response?.data?.message));
  }
};
```

---

### 2️⃣ THIÊN - LOGIN PAGE

**File cần tạo/chỉnh sửa:**

- `src/pages/LoginPage.jsx` (ĐÃ CÓ, cần hoàn thiện)
- `src/components/Forms.jsx` (hoàn thiện `LoginForm`)

**Yêu cầu:**

1. Form đăng nhập:
   - ✅ Input: Email, Password
   - ✅ Validation frontend
   - ✅ "Nhớ mật khẩu" checkbox (optional - lưu vào localStorage)
   - ✅ "Quên mật khẩu?" link
   - ✅ Loading state & error message

2. Redux Integration:

   ```javascript
   dispatch(loginStart());
   await authAPI.login({ email, password });
   // On success: lưu user + token vào Redux & localStorage
   dispatch(loginSuccess({ user, token }));
   // On error: dispatch loginFailure(error)
   ```

3. Navigation:
   - Sau login thành công → Kiểm tra role:
     - Role "admin" → `/admin/profile`
     - Role "user" → `/user/profile`

4. UI Components:
   - `<Header>`
   - `<Card>`
   - `<Input>`
   - `<Button>`
   - `<Alert>` for errors

**Hướng dẫn code:**

```javascript
const handleLogin = async (formData) => {
  dispatch(loginStart());
  try {
    const response = await authAPI.login(formData);
    const userData = {
      /* từ response */
    };
    dispatch(loginSuccess({ user: userData, token: response.token }));
    // Redirect based on role
    navigate(response.role === "admin" ? "/admin/profile" : "/user/profile");
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message));
  }
};
```

---

### 3️⃣ KHANG - FORGOT PASSWORD PAGE

**File cần tạo/chỉnh sửa:**

- `src/pages/ForgotPasswordPage.jsx` (TẠO MỚI)
- `src/components/Forms.jsx` (thêm `ForgotPasswordForm`, `OTPForm`, `ResetPasswordForm`)

**Yêu cầu:**
Page có 3 bước (steps):

**Bước 1: Nhập Email**

- Input: Email
- Button: "Gửi OTP"
- Sau submit → Chuyển sang Bước 2

**Bước 2: Xác thực OTP**

- Display: "Nhập mã OTP được gửi đến [email]"
- Input: OTP (6 chữ số)
- Button: "Xác thực"
- Link: "Gửi lại mã OTP"
- Sau submit → Chuyển sang Bước 3

**Bước 3: Nhập Mật khẩu Mới**

- Input: Mật khẩu mới, Xác nhận mật khẩu
- Button: "Đặt lại mật khẩu"
- Sau submit thành công → Chuyển hướng đến Login page

2. Redux Integration:

```javascript
forgotPasswordStart / Success / Failure;
resetPasswordStart / Success / Failure;
```

3. API Calls:

```javascript
await authAPI.forgotPassword(email); // Bước 1
await authAPI.resetPassword({ email, otp, newPassword }); // Bước 3
```

**Hướng dẫn code:**

```javascript
const [step, setStep] = useState(1); // 1, 2, 3
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");

const handleForgotPassword = async (emailInput) => {
  dispatch(forgotPasswordStart());
  try {
    await authAPI.forgotPassword(emailInput);
    setEmail(emailInput);
    setStep(2); // Go to OTP step
    dispatch(forgotPasswordSuccess());
  } catch (error) {
    dispatch(forgotPasswordFailure(error.message));
  }
};

const handleResetPassword = async (newPassword) => {
  dispatch(resetPasswordStart());
  try {
    await authAPI.resetPassword({ email, otp, newPassword });
    dispatch(resetPasswordSuccess());
    navigate("/login", { state: { message: "Đặt lại mật khẩu thành công!" } });
  } catch (error) {
    dispatch(resetPasswordFailure(error.message));
  }
};
```

---

### 4️⃣ DUY - EDIT PROFILE PAGE

**File cần tạo/chỉnh sửa:**

- `src/pages/ProfilePage.jsx` (TẠO MỚI hoặc hoàn thiện)
- `src/components/Forms.jsx` (thêm `UpdateProfileForm`)

**Yêu cầu:**

1. Load profile hiện tại:

   ```javascript
   useEffect(() => {
     const fetchProfile = async () => {
       const user = await authAPI.getProfile();
       // Populate form với data hiện tại
     };
     fetchProfile();
   }, []);
   ```

2. Form chỉnh sửa profile:
   - ✅ Input: Username, Email, Phone (nếu có), Bio (nếu có)
   - ✅ Các field có default value từ user hiện tại
   - ✅ Email: read-only (không cho sửa)
   - ✅ Validation frontend
   - ✅ Save button có loading state

3. Redux Integration:

   ```javascript
   // Thêm action trong authSlice
   updateProfileStart / Success / Failure;
   ```

4. API Call:

   ```javascript
   await authAPI.updateProfile(formData);
   ```

5. Navigation:
   - Sau update thành công → Hiển thị success message
   - Cập nhật Redux state với user info mới
   - Link: "Đăng xuất"

**Hướng dẫn code:**

```javascript
const handleUpdateProfile = async (formData) => {
  dispatch(updateProfileStart());
  try {
    const response = await authAPI.updateProfile(formData);
    dispatch(updateProfileSuccess(response.user));
    // Show success notification
    showNotification("Profile updated successfully!", "success");
  } catch (error) {
    dispatch(updateProfileFailure(error.message));
  }
};

const handleLogout = () => {
  dispatch(logout());
  navigate("/login");
};
```

---

## 🔧 CÔNG VIỆC CẦN HOÀN THIỆN (CHUNG)

### 1. Redux authSlice.js - THÊM CÁC ACTION

```javascript
// Thêm các action mới nếu chưa có
-updateProfileStart - updateProfileSuccess - updateProfileFailure;
```

### 2. API Service (api.js) - ĐÃ CÓ, CHỈ CẦN SỬ DỤNG

Các function có sẵn:

```javascript
authAPI.register(data);
authAPI.verifyOTP(email, otp);
authAPI.login(data);
authAPI.forgotPassword(email);
authAPI.resetPassword(data);
authAPI.getProfile();
authAPI.updateProfile(data);
```

### 3. Components UI (UI.jsx) - ĐÃ CÓ, SỬ DỤNG

```javascript
<Header />      // Tiêu đề
<Card />        // Container
<Input />       // Text input
<Button />      // Button
<Alert />       // Alert message
```

---

## 📌 QUY TRÌNH GIT

### 1. Cách clone repository

```bash
git clone [repository-url]
cd hcmute-student-consulting
cd frontend
npm install
```

### 2. Tạo branch riêng cho từng người

```bash
# Quân - Register
git checkout -b feature/register

# Thiên - Login
git checkout -b feature/login

# Khang - Forgot Password
git checkout -b feature/forgot-password

# Duy - Edit Profile
git checkout -b feature/edit-profile
```

### 3. Commit & Push code

```bash
# Thêm file
git add .

# Commit với message rõ ràng
git commit -m "feat(register): implement register page with OTP verification"

# Push lên GitHub
git push origin feature/register
```

### 4. Tạo Pull Request (PR)

- Sau khi push, vào GitHub → tạo PR từ branch của mình vào `main`
- Mô tả chi tiết công việc đã làm
- Chờ approve từ team lead

---

## ✅ CHECKLIST CHO MỖI THÀNH VIÊN

### Quân - Register

- [ ] Tạo `RegisterPage.jsx`
- [ ] Tạo `RegisterForm` component
- [ ] Validation form frontend
- [ ] Redux integration
- [ ] Axios API call
- [ ] Error handling
- [ ] Styling với TailwindCSS
- [ ] Test form submission
- [ ] Navigate sau register thành công
- [ ] Commit & push code

### Thiên - Login

- [ ] Hoàn thiện `LoginPage.jsx`
- [ ] Hoàn thiện `LoginForm` component
- [ ] Validation form
- [ ] Redux integration
- [ ] Axios API call
- [ ] Role-based redirect
- [ ] Error handling & display
- [ ] Styling
- [ ] Test login
- [ ] Commit & push code

### Khang - Forgot Password

- [ ] Tạo `ForgotPasswordPage.jsx` (3 steps)
- [ ] Tạo các form component (Email, OTP, NewPassword)
- [ ] Step navigation logic
- [ ] Redux integration
- [ ] Axios API calls
- [ ] Validation cho mỗi bước
- [ ] Error handling
- [ ] Styling
- [ ] Test flow đầu cuối
- [ ] Commit & push code

### Duy - Edit Profile

- [ ] Tạo/hoàn thiện `ProfilePage.jsx`
- [ ] Tạo `UpdateProfileForm` component
- [ ] Fetch profile khi load page
- [ ] Redux integration (thêm actions nếu cần)
- [ ] Axios API calls
- [ ] Validation form
- [ ] Error handling
- [ ] Styling
- [ ] Test update profile
- [ ] Test logout
- [ ] Commit & push code

---

## 🚀 CÔNG VIỆC SAU HOÀN THÀNH

1. **Code Review**: Mỗi thành viên review code của người khác
2. **Merge PR**: Sau approved, merge vào `main` branch
3. **Testing**: Test toàn bộ flow authentication
4. **Documentation**: Cập nhật README nếu cần

---

## 📚 TÀI LIỆU THAM KHẢO

- React Hooks: https://react.dev/reference/react
- Redux Toolkit: https://redux-toolkit.js.org/
- Axios: https://axios-http.com/
- TailwindCSS: https://tailwindcss.com/
- React Router: https://reactrouter.com/

---

**Created:** 2026-05-12
**Status:** Ready for implementation
