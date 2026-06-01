# BT07 (Nhóm) - Phần Đóng Góp Của Đinh Nguyễn Đức Duy

**Sinh viên:** Đinh Nguyễn Đức Duy
**MSSV:** 23110193

Folder này lưu đúng phần source được phân công cho Duy trong dự án nhóm HCMUTE Student Consulting. Đây là phần trích xuất để nộp cá nhân; ứng dụng đầy đủ và các dependency liên quan nằm trong repo nhóm.

## Phạm Vi Phụ Trách

| Khu vực | File | Nội dung |
|---|---|---|
| Backend | `backend/src/controllers/counselorController.js` | API tư vấn viên tương tự, thống kê, danh sách bình luận có phân trang và validate ID |
| Backend | `backend/src/routes/counselorRoutes.js` | Route `GET /:id/similar`, `GET /:id/stats`, `GET /:id/reviews` |
| Frontend | `frontend/src/pages/BookCounselorPage.jsx` | Yêu thích, tự ghi lịch sử xem, stats, bình luận sinh viên và danh sách tư vấn viên tương tự |

## Chức Năng Chính

- Gợi ý tối đa 6 tư vấn viên cùng chuyên môn, loại trừ tư vấn viên đang xem.
- Hiển thị lượt đặt, rating và số đánh giá.
- Thêm hoặc bỏ tư vấn viên yêu thích.
- Ghi nhận lịch sử xem khi người dùng đã đăng nhập.
- Hiển thị bình luận từ sinh viên theo phân trang.
- Trả `404` khi ID tư vấn viên không hợp lệ và giới hạn số bình luận mỗi trang.

## Kiểm Tra Đã Chạy

```bash
node --check backend/src/controllers/counselorController.js
node --check backend/src/routes/counselorRoutes.js

cd frontend
npm run build
```

Frontend build thành công. Repo nhóm còn 2 warning ESLint có sẵn tại `CommonUI.jsx` và `ProfilePage.jsx`, không thuộc phần source của Duy.

## GitHub

- Repo nhóm: [DangTranAnhQuan/hcmute-student-consulting](https://github.com/DangTranAnhQuan/hcmute-student-consulting)
- Nhánh Duy: [`feature/counselor-similar-stats`](https://github.com/DangTranAnhQuan/hcmute-student-consulting/tree/feature/counselor-similar-stats)
- Commit Duy: [`b0cc97a`](https://github.com/DangTranAnhQuan/hcmute-student-consulting/commit/b0cc97a9d3f977a4ba7c0fb20a03879ffd2d2ec7)
- Repo cá nhân: [https://github.com/ShiroKin7448/CNPMM.git](https://github.com/ShiroKin7448/CNPMM.git)
