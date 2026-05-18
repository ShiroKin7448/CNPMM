# 📋 Installation & Setup Checklist

## Prerequisites

- [ ] Node.js v16+ installed
- [ ] npm or yarn installed
- [ ] MongoDB running (local or cloud)
- [ ] Gmail account (for OTP emails)

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Expected packages:**

- ✅ express
- ✅ mongoose
- ✅ jsonwebtoken
- ✅ bcryptjs
- ✅ nodemailer
- ✅ express-rate-limit
- ✅ express-validator
- ✅ cookie-parser
- ✅ cors
- ✅ dotenv

### Step 2: Environment Configuration

Create `backend/.env`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/hcmute-student-consulting
# For MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/dbname

# JWT Secret (at least 32 characters)
ACCESS_TOKEN_SECRET=your-very-long-secret-key-at-least-32-characters-long

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3000
CLIENT_URL=http://localhost:3000
```

### Step 3: Verify Configuration

```bash
# Test database connection
npm run dev
# Should see: ✅ Đã kết nối MongoDB...
```

### Step 4: Run Backend

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

**Expected output:**

```
✅ Đã kết nối MongoDB cho Website Tư vấn sinh viên!
🚀 Server đang chạy tại http://localhost:3000
```

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

**Expected packages:**

- ✅ react
- ✅ react-dom
- ✅ react-router-dom
- ✅ redux / react-redux
- ✅ @reduxjs/toolkit
- ✅ axios
- ✅ tailwindcss
- ✅ autoprefixer
- ✅ postcss
- ✅ react-scripts

### Step 2: Environment Configuration

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Step 3: Run Frontend

```bash
npm start
```

**Expected:**

- ✅ Browser opens to http://localhost:3000
- ✅ Shows HCMUTE landing page
- ✅ Can navigate to login/register

---

## 🧪 Testing the Application

### Test 1: Register User

```
1. Go to http://localhost:3000/register
2. Fill form:
   - Username: testuser
   - Email: test@example.com
   - Password: Test@1234
3. Click "Đăng ký"
4. Should see: "Đã gửi mã OTP qua email"
5. Check backend console or email for OTP
6. Enter OTP (check console logs for OTP value during development)
7. Should redirect to login page
```

### Test 2: Login User

```
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: Test@1234
3. Click "Đăng nhập"
4. Should redirect to /user/profile
5. See profile information displayed
```

### Test 3: Edit Profile

```
1. After login, go to /profile
2. Click "Chỉnh sửa hồ sơ"
3. Update fields (name, phone, address)
4. Click "Lưu thay đổi"
5. Should show success message
6. Data should persist on page refresh
```

### Test 4: Forgot Password

```
1. Go to /forgot-password
2. Enter registered email
3. Click "Gửi OTP"
4. Enter OTP
5. Enter new password
6. Click "Đặt lại mật khẩu"
7. Should redirect to login
8. Login with new password should work
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'cors'"

**Solution:**

```bash
cd backend
npm install cors
```

### Issue: MONGO_URI not found

**Solution:**

- Check `.env` file exists in backend folder
- Verify `MONGO_URI` is set correctly
- Check MongoDB is running

### Issue: "Port 3000 already in use"

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue: OTP not in email

**Solution:**

- Check Gmail credentials in `.env`
- Verify app password (not regular password)
- Check spam folder
- Check backend console logs for OTP

### Issue: "CORS error"

**Solution:**

```bash
# Check backend CORS configuration
# Should include CLIENT_URL in allowed origins
```

### Issue: Redux DevTools not available

**Solution:**

- Install Redux DevTools browser extension
- Create mock data in Redux if needed

---

## ✅ Verification Checklist

### Backend Running?

- [ ] Terminal shows "Server đang chạy..."
- [ ] Can access http://localhost:3000/api/health
- [ ] MongoDB connection message shown

### Frontend Running?

- [ ] Browser opens to http://localhost:3000
- [ ] Can see landing page
- [ ] Navigation links work

### API Connectivity?

- [ ] Can navigate to /login
- [ ] Can navigate to /register
- [ ] Form submission attempts API call

### Database?

- [ ] Users collection created in MongoDB
- [ ] Can see user document after registration

### Email?

- [ ] OTP email sent after registration
- [ ] OTP email sent on forgot password

---

## 📊 Development Tools

### Browser DevTools

- **F12** or **Ctrl+Shift+I** - Open DevTools
- **Network Tab** - Monitor API calls
- **Console Tab** - Check JavaScript errors
- **Application Tab** - Check localStorage, cookies

### Redux DevTools

- Install extension: [Redux DevTools](https://github.com/reduxjs/redux-devtools-extension)
- View state changes in real-time
- Time-travel debugging

### Postman / Insomnia

For testing API endpoints directly:

```
POST http://localhost:3000/api/auth/register
Body: {
  "username": "test",
  "email": "test@test.com",
  "password": "pass123"
}
```

---

## 📝 Common Commands

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start with nodemon
npm start            # Start production
npm test             # Run tests (if configured)

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start dev server
npm build            # Build for production
npm test             # Run tests
```

---

## 🔐 Security Reminders

- ⚠️ Never commit `.env` files
- ⚠️ Use strong `ACCESS_TOKEN_SECRET`
- ⚠️ Don't share Gmail app password
- ⚠️ Change default values before production
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting on all sensitive endpoints

---

## 📱 Testing on Different Devices

### Mobile Testing

```bash
# Get local machine IP
ipconfig getifaddr en0  # Mac
ipconfig              # Windows

# On mobile, use IP address:
http://YOUR_IP:3000
```

### Responsive Design

- Open DevTools (F12)
- Click device toggle (Ctrl+Shift+M)
- Test different screen sizes

---

## ✨ Next Development Steps

1. **Code Review**: Have team members review each other's code
2. **Git Integration**: Push to personal + group repositories
3. **Additional Features**: Add new endpoints as needed
4. **Testing**: Write unit and integration tests
5. **Documentation**: Keep README updated
6. **Deployment**: Set up CI/CD pipeline

---

## 📚 Additional Resources

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Project Overview](README.md)

---

**Last Updated**: 2026
**Status**: Ready for Development
