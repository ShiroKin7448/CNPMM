# Bài Tập 01: Quản Lý Người Dùng (CRUD) với Express.js & MongoDB

Dự án này là bài tập thực hành xây dựng hệ thống quản lý người dùng cơ bản theo mô hình MVC, áp dụng các kỹ thuật backend hiện đại.

## 📸 Giao diện Demo

*(Ghi chú: Thay thế các đường link bên dưới bằng link ảnh thực tế của bạn)*

**1. Màn hình Danh sách Người dùng**
![Danh sách User](https://github.com/user-attachments/assets/0eb5b289-8359-42df-af67-217e31007b1e)

**2. Màn hình Thêm mới**
![Thêm mới User](https://github.com/user-attachments/assets/d102d486-4bb9-4c69-a5d5-900798747732)

**3. Màn hình Sửa**
![Sửa User](https://github.com/user-attachments/assets/f1e73db8-bf4d-48ce-822a-95a60198f2c4)

## 👨‍💻 Thông tin sinh viên
*   **Họ và tên:** Đinh Nguyễn Đức Duy
*   **Mã số sinh viên:** 23110193
*   **Chuyên ngành:** Công nghệ phần mềm
*   **Môn học:** Các công nghệ phần mềm mới
*   **Nhóm - Tiết - Phòng:** Nhóm 02 - Tiết 2-4 - Phòng A308

## 🚀 Công nghệ sử dụng
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose (ODM)
*   **Template Engine:** EJS
*   **Giao diện:** Bootstrap 5
*   **Công cụ phát triển:** Babel (ES6+), Nodemon

## 🛠️ Hướng dẫn cài đặt và chạy dự án

**Bước 1: Clone dự án về máy**
\`\`\`bash
git clone https://github.com/ShiroKin7448/Cac-cong-nghe-phan-mem-moi_-Nhom-02_St2_St4_A308.git
cd Cac-cong-nghe-phan-mem-moi_-Nhom-02_St2_St4_A308/BT01_23110193_DinhNguyenDucDuy
\`\`\`

**Bước 2: Cài đặt thư viện**
\`\`\`bash
npm install
\`\`\`

**Bước 3: Cấu hình biến môi trường**
Đảm bảo file `.env` đã được cấu hình chính xác và MongoDB đang chạy ngầm trên máy:
\`\`\`env
PORT=8088
DATABASE_URL=mongodb://127.0.0.1:27017/node_fulltask
\`\`\`

**Bước 4: Khởi chạy Server**
\`\`\`bash
npm start
\`\`\`
Truy cập vào trình duyệt tại địa chỉ: `http://localhost:8088/crud` để kiểm tra.

## 📋 Chức năng chính
*   **Create:** Thêm mới tài khoản người dùng với xác thực bắt buộc nhập mật khẩu.
*   **Read:** Hiển thị danh sách toàn bộ người dùng từ database.
*   **Update:** Cập nhật thông tin cá nhân của người dùng.
*   **Delete:** Xóa tài khoản người dùng khỏi hệ thống.

