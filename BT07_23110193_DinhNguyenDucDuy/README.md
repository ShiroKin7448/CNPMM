# BT07 - LaptopStore Loyalty E-Commerce

<div align="center">

**Bài tập cá nhân môn Các Công Nghệ Phần Mềm Mới**<br>
**Sinh viên:** Đinh Nguyễn Đức Duy - **MSSV:** 23110193

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

## Tổng Quan

BT07 phát triển tiếp từ BT06 LaptopStore. Ngoài giỏ hàng, checkout COD/MoMo sandbox, theo dõi đơn và dashboard admin, bài làm bổ sung hệ thống chăm sóc khách hàng đầy đủ: bình luận sản phẩm đã mua, quà sau đánh giá, yêu thích, lịch sử đã xem, mã giảm giá, kho điểm, hạng thành viên và màn admin quản lý ưu đãi.

## Demo BT07

Ảnh được chụp từ frontend `http://localhost:5173` và backend `http://localhost:8080` sau khi chạy seed BT07.

| Kho điểm, voucher, yêu thích và sản phẩm đã xem |
|---|
| ![BT07 kho thành viên](./docs/demo/bt07-member-store.png) |

| Checkout áp mã giảm giá và đổi điểm |
|---|
| ![BT07 checkout ưu đãi](./docs/demo/bt07-checkout-benefits.png) |

| Bình luận của khách đã mua thành công |
|---|
| ![BT07 bình luận sản phẩm](./docs/demo/bt07-product-reviews.png) |

| Admin quản lý mã giảm giá và hạng thành viên |
|---|
| ![BT07 admin loyalty](./docs/demo/bt07-admin-loyalty.png) |

| Admin xem sản phẩm và vị trí giao trước khi cập nhật đơn |
|---|
| ![BT07 admin chi tiết đơn](./docs/demo/bt07-admin-order-location.png) |

Các ảnh màn hình kế thừa từ BT06 vẫn nằm trong `docs/demo/`: giỏ hàng, checkout COD/MoMo, QR MoMo sandbox, danh sách đơn, chi tiết đơn và dashboard admin.

## Chức Năng Mới

### 1. Bình Luận Và Đánh Giá

- Chỉ tài khoản có đơn `DELIVERED` chứa sản phẩm mới được đánh giá.
- Một sản phẩm trong mỗi lần mua thành công chỉ được đánh giá một lần.
- Mỗi đánh giá hợp lệ nhận quà cho lần mua tiếp theo: luân phiên voucher cá nhân giảm 10% hoặc `300` điểm.
- Rating, số bình luận và số khách bình luận được cập nhật lại từ collection `Review`.
- UI bình luận nằm ngay trên trang chi tiết sản phẩm; đơn đã giao có nút **Bình luận và nhận quà**.

API:

```http
GET  /v1/api/products/:productId/reviews
GET  /v1/api/products/:productId/review-eligibility
POST /v1/api/products/:productId/reviews
```

### 2. Yêu Thích, Tương Tự Và Đã Xem

- Nút trái tim trên card và trang chi tiết gọi API thật để thêm hoặc bỏ yêu thích.
- Trang `/store` hiển thị sản phẩm yêu thích và 12 sản phẩm xem gần nhất.
- Trang chi tiết vẫn có carousel sản phẩm tương tự cùng danh mục.
- Sản phẩm hiển thị số lượt xem, số lượng đã bán, số khách mua và số khách bình luận.
- Khi admin xác nhận đơn `DELIVERED`, backend ghi nhận khách mua duy nhất bằng `purchasedBy` và tăng `buyerCount`.

API:

```http
POST /v1/api/store/favorites/:productId
POST /v1/api/store/recently-viewed/:productId
GET  /v1/api/store/me
GET  /v1/api/products/similar/:id
```

### 3. Voucher, Khuyến Mãi, Kho Điểm Và Hạng Thành Viên

- Voucher hỗ trợ giảm theo phần trăm hoặc số tiền cố định; có đơn tối thiểu, mức giảm tối đa, thời hạn và giới hạn lượt dùng.
- Checkout cho phép chọn mã hợp lệ và đổi điểm trước khi đặt đơn.
- Quy đổi: `1 điểm = 1.000 VND`.
- Nếu đơn bị hủy hoặc tạo giao dịch MoMo thất bại, hệ thống hoàn điểm và hoàn lượt voucher.
- Đơn giao thành công tự cộng điểm mua hàng và cập nhật hạng thành viên.

| Hạng | Tổng chi tiêu tối thiểu |
|---|---:|
| `MEMBER` | `0 VND` |
| `SILVER` | `30.000.000 VND` |
| `GOLD` | `80.000.000 VND` |
| `DIAMOND` | `150.000.000 VND` |

API:

```http
GET  /v1/api/promotions
GET  /v1/api/store/me
GET  /v1/api/admin/loyalty
POST /v1/api/admin/vouchers
```

### 4. Bổ Sung Cho Admin

- `/admin/loyalty`: xem voucher, lượt sử dụng, kho điểm và hạng khách hàng; tạo mã khuyến mãi mới.
- `/admin`: mỗi đơn có nút **Xem sản phẩm & vị trí** để mở danh sách sản phẩm, người nhận, số điện thoại, địa chỉ và ghi chú giao hàng trước khi cập nhật trạng thái.
- Dashboard bổ sung số voucher đang chạy, số khách thành viên và số bình luận.

## Chức Năng Kế Thừa Từ BT06

- Đăng ký, xác nhận email, đăng nhập JWT, quên và đặt lại mật khẩu.
- Trang chủ, shop, search debounce, filter, sort, lazy loading, top sản phẩm bán chạy và xem nhiều.
- Chi tiết sản phẩm, gallery, tồn kho, thông số và sản phẩm tương tự.
- Giỏ hàng lưu MongoDB, chọn riêng sản phẩm để checkout.
- Thanh toán COD và MoMo sandbox; hoàn kho và khôi phục giỏ với đơn MoMo quá hạn.
- Theo dõi đơn hàng, hủy trực tiếp hoặc gửi yêu cầu hủy.
- Dashboard admin quản lý doanh thu, tồn kho và trạng thái đơn.

## Cách Chạy

Yêu cầu: Node.js, npm và MongoDB local.

```bash
# Terminal 1 - Backend
cd BT07_23110193_DinhNguyenDucDuy/ExpressJS01
npm install
npm run seed
npm run dev

# Terminal 2 - Frontend
cd BT07_23110193_DinhNguyenDucDuy/ReactJS01
npm install
npm run dev
```

Truy cập:

| Màn hình | URL |
|---|---|
| Trang chủ | `http://localhost:5173` |
| Kho thành viên | `http://localhost:5173/store` |
| Lịch sử đơn | `http://localhost:5173/orders` |
| Dashboard admin | `http://localhost:5173/admin` |
| Admin ưu đãi | `http://localhost:5173/admin/loyalty` |

Tài khoản seed:

| Quyền | Email | Mật khẩu |
|---|---|---|
| User | `demo@bt07.local` | `123456` |
| Admin | `admin@bt07.local` | `123456` |

> `npm run seed` xóa dữ liệu cũ trong database `bt07` trước khi tạo lại dữ liệu demo.

## Cấu Trúc Chính

```text
BT07_23110193_DinhNguyenDucDuy/
├── ExpressJS01/
│   └── src/
│       ├── controllers/
│       ├── models/          # User, Product, Order, Cart, Review, Voucher
│       ├── routes/api.js
│       ├── scripts/seed.js
│       └── services/        # order, loyalty, review, cart, product...
├── ReactJS01/
│   └── src/
│       ├── components/product/ProductReviews.jsx
│       ├── pages/store.jsx
│       ├── pages/admin-loyalty.jsx
│       ├── pages/checkout.jsx
│       └── pages/admin-dashboard.jsx
└── docs/demo/
```

## Kiểm Tra Đã Chạy

```bash
cd ReactJS01
npm run build

cd ../ExpressJS01
npm run seed
```

Đã gọi API thực tế để kiểm tra: login user/admin, promotions, kho thành viên, eligibility review, tạo review nhận điểm, yêu thích, đã xem, checkout áp voucher + điểm, hủy hoàn ưu đãi, admin chuyển COD qua `CONFIRMED -> PREPARING -> SHIPPING -> DELIVERED`, cộng điểm mua hàng và cập nhật số khách mua.
