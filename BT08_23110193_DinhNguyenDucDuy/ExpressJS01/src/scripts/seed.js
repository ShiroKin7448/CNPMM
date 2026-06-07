import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Category from "../models/category.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import Voucher from "../models/voucher.js";
import Notification, { NOTIFICATION_AUDIENCE, NOTIFICATION_TYPES } from "../models/notification.js";
import { getProductImages } from "../data/productImages.js";
dotenv.config();

const categories = [
  { name: "Laptop Gaming", slug: "laptop-gaming", icon: "🎮", color: "#000000", description: "Laptop chuyên game hiệu năng cao" },
  { name: "Laptop Văn Phòng", slug: "laptop-van-phong", icon: "💼", color: "#656565", description: "Laptop mỏng nhẹ cho công việc" },
  { name: "MacBook", slug: "macbook", icon: "🍎", color: "#C0FF6B", description: "Dòng MacBook Apple chính hãng" },
  { name: "Phụ Kiện", slug: "phu-kien", icon: "🖱️", color: "#000000", description: "Chuột, bàn phím, tai nghe..." },
];

const imgs = {
  gaming: [
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
    "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800&q=80",
  ],
  office: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
  ],
  mac: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    "https://images.unsplash.com/photo-1611186871525-89b895e2a23c?w=800&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
  ],
  acc: [
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
    "https://images.unsplash.com/photo-1615750185825-4ca287a04ef1?w=800&q=80",
  ],
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_DB_URL);
  console.log("Connected to MongoDB");

  await Category.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});
  await Voucher.deleteMany({});
  await Notification.deleteMany({});

  const cats = await Category.insertMany(categories);
  const g = cats.find(c => c.slug === "laptop-gaming")._id;
  const o = cats.find(c => c.slug === "laptop-van-phong")._id;
  const m = cats.find(c => c.slug === "macbook")._id;
  const a = cats.find(c => c.slug === "phu-kien")._id;

  const products = [
    { name: "ASUS ROG Strix G16 2024", price: 35990000, salePrice: 31990000, category: g, brand: "ASUS", stock: 15, sold: 132, images: imgs.gaming, tags: ["best-seller","sale"], specs: { cpu: "Intel Core i9-14900HX", ram: "16GB DDR5", storage: "1TB NVMe SSD", display: "16\" QHD 240Hz", gpu: "RTX 4070 8GB", os: "Windows 11" } },
    { name: "MSI Raider GE78 HX", price: 49990000, salePrice: null, category: g, brand: "MSI", stock: 8, sold: 67, images: imgs.gaming, tags: ["new","featured"], specs: { cpu: "Intel Core i9-14950HX", ram: "32GB DDR5", storage: "2TB NVMe SSD", display: "17\" UHD 120Hz", gpu: "RTX 4090 16GB", os: "Windows 11" } },
    { name: "Lenovo Legion 5 Pro", price: 27990000, salePrice: 24990000, category: g, brand: "Lenovo", stock: 20, sold: 215, images: imgs.gaming, tags: ["best-seller","sale"], specs: { cpu: "AMD Ryzen 9 7945HX", ram: "16GB DDR5", storage: "1TB NVMe SSD", display: "16\" QHD 165Hz", gpu: "RTX 4060 8GB", os: "Windows 11" } },
    { name: "Acer Predator Helios 18", price: 42990000, salePrice: 39990000, category: g, brand: "Acer", stock: 10, sold: 88, images: imgs.gaming, tags: ["sale","new"], specs: { cpu: "Intel Core i9-14900HX", ram: "32GB DDR5", storage: "1TB SSD", display: "18\" QHD 250Hz", gpu: "RTX 4080 12GB", os: "Windows 11" } },
    { name: "ASUS TUF Gaming A15", price: 19990000, salePrice: 17490000, category: g, brand: "ASUS", stock: 30, sold: 342, images: imgs.gaming, tags: ["best-seller","sale"], specs: { cpu: "AMD Ryzen 7 7745HX", ram: "16GB DDR5", storage: "512GB SSD", display: "15.6\" FHD 144Hz", gpu: "RTX 4060 8GB", os: "Windows 11" } },
    { name: "Dell XPS 15 OLED", price: 42990000, salePrice: null, category: o, brand: "Dell", stock: 12, sold: 94, images: imgs.office, tags: ["featured","new"], specs: { cpu: "Intel Core i7-13700H", ram: "16GB DDR5", storage: "512GB SSD", display: "15.6\" OLED 3.5K", gpu: "RTX 4060 8GB", os: "Windows 11" } },
    { name: "HP Spectre x360 14", price: 36990000, salePrice: 33490000, category: o, brand: "HP", stock: 18, sold: 156, images: imgs.office, tags: ["best-seller","sale"], specs: { cpu: "Intel Core Ultra 7 155H", ram: "16GB LPDDR5", storage: "1TB SSD", display: "14\" 2.8K OLED Touch", gpu: "Intel Arc", os: "Windows 11" } },
    { name: "Lenovo ThinkPad X1 Carbon", price: 38990000, salePrice: null, category: o, brand: "Lenovo", stock: 9, sold: 78, images: imgs.office, tags: ["featured"], specs: { cpu: "Intel Core Ultra 7 165U", ram: "16GB LPDDR5", storage: "512GB SSD", display: "14\" IPS 2.8K", gpu: "Intel Iris Xe", os: "Windows 11 Pro", weight: "1.12 kg" } },
    { name: "ASUS Zenbook 14 OLED", price: 22990000, salePrice: 19990000, category: o, brand: "ASUS", stock: 25, sold: 203, images: imgs.office, tags: ["best-seller","sale","new"], specs: { cpu: "AMD Ryzen 7 8840HS", ram: "16GB LPDDR5", storage: "1TB SSD", display: "14\" 2.8K OLED", gpu: "AMD Radeon 780M", os: "Windows 11" } },
    { name: "Microsoft Surface Laptop 5", price: 31990000, salePrice: 28990000, category: o, brand: "Microsoft", stock: 14, sold: 112, images: imgs.office, tags: ["sale"], specs: { cpu: "Intel Core i7-1265U", ram: "16GB LPDDR5", storage: "512GB SSD", display: "13.5\" PixelSense Touch", gpu: "Intel Iris Xe", os: "Windows 11" } },
    { name: "MacBook Air M3 13\"", price: 28990000, salePrice: 26490000, category: m, brand: "Apple", stock: 22, sold: 387, images: imgs.mac, tags: ["best-seller","sale","featured"], specs: { cpu: "Apple M3 8-core", ram: "8GB Unified", storage: "256GB SSD", display: "13.6\" Liquid Retina", gpu: "10-core GPU", battery: "18h", os: "macOS Sonoma" } },
    { name: "MacBook Air M3 15\"", price: 35990000, salePrice: null, category: m, brand: "Apple", stock: 17, sold: 189, images: imgs.mac, tags: ["new","featured"], specs: { cpu: "Apple M3 8-core", ram: "8GB Unified", storage: "256GB SSD", display: "15.3\" Liquid Retina", gpu: "10-core GPU", battery: "18h", os: "macOS Sonoma" } },
    { name: "MacBook Pro M4 14\"", price: 52990000, salePrice: null, category: m, brand: "Apple", stock: 10, sold: 142, images: imgs.mac, tags: ["new","featured"], specs: { cpu: "Apple M4 Pro 14-core", ram: "24GB Unified", storage: "512GB SSD", display: "14.2\" Liquid Retina XDR", gpu: "20-core GPU", battery: "22h", os: "macOS Sequoia" } },
    { name: "MacBook Pro M4 16\"", price: 71990000, salePrice: 68990000, category: m, brand: "Apple", stock: 6, sold: 58, images: imgs.mac, tags: ["sale","featured"], specs: { cpu: "Apple M4 Max 16-core", ram: "48GB Unified", storage: "1TB SSD", display: "16.2\" Liquid Retina XDR", gpu: "40-core GPU", battery: "24h", os: "macOS Sequoia" } },
    { name: "MacBook Air M2 13\" (Cũ)", price: 21990000, salePrice: 18990000, category: m, brand: "Apple", stock: 30, sold: 521, images: imgs.mac, tags: ["best-seller","sale"], specs: { cpu: "Apple M2 8-core", ram: "8GB Unified", storage: "256GB SSD", display: "13.6\" Liquid Retina", gpu: "8-core GPU", battery: "18h", os: "macOS Ventura" } },
    { name: "Chuột Logitech MX Master 3S", price: 2190000, salePrice: 1890000, category: a, brand: "Logitech", stock: 50, sold: 430, images: imgs.acc, tags: ["best-seller","sale"], specs: {} },
    { name: "Bàn Phím Keychron K2 Pro", price: 2890000, salePrice: null, category: a, brand: "Keychron", stock: 35, sold: 287, images: imgs.acc, tags: ["best-seller"], specs: {} },
    { name: "Tai Nghe Sony WH-1000XM5", price: 8490000, salePrice: 6990000, category: a, brand: "Sony", stock: 20, sold: 198, images: imgs.acc, tags: ["sale","new"], specs: {} },
    { name: "Màn Hình LG 27\" 4K IPS", price: 11990000, salePrice: 9990000, category: a, brand: "LG", stock: 15, sold: 143, images: imgs.acc, tags: ["sale"], specs: {} },
    { name: "Túi Laptop Tomtoc 16\"", price: 890000, salePrice: 690000, category: a, brand: "Tomtoc", stock: 100, sold: 876, images: imgs.acc, tags: ["best-seller","sale","new"], specs: {} },
  ];

  const productsWithSlug = products.map((p, i) => ({
    ...p,
    images: getProductImages(p),
    slug: p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "-") + `-${i}`,
    rating: (4 + Math.random()).toFixed(1) * 1,
    reviewCount: Math.floor(Math.random() * 200) + 10,
    viewCount: p.sold * 6 + (i + 1) * 43,
    buyerCount: Math.max(1, Math.floor(p.sold / 3)),
    commentCustomerCount: Math.max(1, Math.floor(p.sold / 8)),
  }));

  const seededProducts = await Product.insertMany(productsWithSlug);

  const password = await bcrypt.hash("123456", 10);
  const users = await User.insertMany([
    {
      name: "Demo User",
      email: "demo@bt08.local",
      password,
      role: "user",
      isVerified: true,
      loyaltyPoints: 3250,
      totalSpent: 55980000,
      membershipTier: "SILVER",
      loyaltyTransactions: [
        { type: "PURCHASE_REWARD", points: 320, description: "Tích điểm mua hàng từ đơn LSBT08DEMO001", reference: "LSBT08DEMO001" },
        { type: "REVIEW_REWARD", points: 300, description: "Thưởng điểm sau khi đánh giá sản phẩm đã mua", reference: "REVIEW" },
      ],
      favoriteProducts: [seededProducts[0]._id, seededProducts[10]._id, seededProducts[15]._id],
      recentlyViewed: [
        { product: seededProducts[0]._id, viewedAt: new Date() },
        { product: seededProducts[10]._id, viewedAt: new Date(Date.now() - 60 * 60 * 1000) },
        { product: seededProducts[8]._id, viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { product: seededProducts[15]._id, viewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      ],
    },
    {
      name: "Admin BT08",
      email: "admin@bt08.local",
      password,
      role: "admin",
      isVerified: true,
    },
  ]);

  const demoUser = users[0];
  const demoOrder = await Order.create({
    user: demoUser._id,
    orderCode: "LSBT08DEMO001",
    items: [
      {
        product: seededProducts[0]._id,
        name: seededProducts[0].name,
        image: seededProducts[0].images[0],
        price: seededProducts[0].salePrice || seededProducts[0].price,
        quantity: 1,
        total: seededProducts[0].salePrice || seededProducts[0].price,
      },
      {
        product: seededProducts[1]._id,
        name: seededProducts[1].name,
        image: seededProducts[1].images[0],
        price: seededProducts[1].salePrice || seededProducts[1].price,
        quantity: 1,
        total: seededProducts[1].salePrice || seededProducts[1].price,
      },
    ],
    shippingAddress: {
      fullName: "Đinh Nguyễn Đức Duy",
      phone: "0901234567",
      address: "01 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh",
      note: "Gọi trước khi giao hàng",
    },
    paymentMethod: "COD",
    paymentStatus: "PAID",
    paymentInfo: { provider: "COD", paidAt: new Date(), message: "Đã thu tiền COD khi giao hàng thành công." },
    status: "DELIVERED",
    subtotal: 81980000,
    shippingFee: 0,
    voucherCode: "LAPTOP500K",
    voucherTitle: "Laptop giảm 500K",
    voucherDiscount: 500000,
    pointsUsed: 100,
    pointsDiscount: 100000,
    loyaltyPointsEarned: 320,
    loyaltyRewardedAt: new Date(),
    total: 81380000,
    deliveredAt: new Date(),
    timeline: [
      { status: "NEW", label: "Đơn hàng mới", note: "Đơn demo BT08", at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { status: "CONFIRMED", label: "Đã xác nhận đơn hàng", at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { status: "PREPARING", label: "Shop đang chuẩn bị hàng", at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { status: "SHIPPING", label: "Đang giao hàng", at: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { status: "DELIVERED", label: "Đã giao thành công", at: new Date() },
    ],
  });

  await Review.create({
    user: demoUser._id,
    product: seededProducts[0]._id,
    order: demoOrder._id,
    rating: 5,
    comment: "Máy chạy mượt, đóng gói cẩn thận và giao đúng hẹn. Mình hài lòng với trải nghiệm mua hàng.",
    rewardType: "VOUCHER",
    rewardVoucherCode: "REVIEW-DEMO-10",
  });
  await Product.findByIdAndUpdate(seededProducts[0]._id, {
    rating: 5,
    reviewCount: 1,
    commentCustomerCount: 1,
    $addToSet: { purchasedBy: demoUser._id },
  });
  await Product.findByIdAndUpdate(seededProducts[1]._id, {
    $addToSet: { purchasedBy: demoUser._id },
  });

  await Voucher.insertMany([
    {
      code: "BT08WELCOME",
      title: "Chào mừng BT08",
      description: "Khuyến mãi toàn cửa hàng",
      discountType: "PERCENT",
      value: 10,
      minOrder: 1000000,
      maxDiscount: 1000000,
      usageLimit: 200,
      endAt: new Date("2027-12-31"),
    },
    {
      code: "LAPTOP500K",
      title: "Laptop giảm 500K",
      description: "Áp dụng cho đơn laptop từ 10 triệu",
      discountType: "FIXED",
      value: 500000,
      minOrder: 10000000,
      usageLimit: 100,
      usedCount: 1,
      endAt: new Date("2027-12-31"),
    },
    {
      code: "REVIEW-DEMO-10",
      title: "Quà cảm ơn đánh giá",
      description: "Voucher cá nhân nhận sau khi bình luận sản phẩm",
      discountType: "PERCENT",
      value: 10,
      minOrder: 500000,
      maxDiscount: 500000,
      usageLimit: 1,
      assignedTo: demoUser._id,
      source: "REVIEW",
      isPublic: false,
      endAt: new Date("2027-12-31"),
    },
  ]);

  await Notification.insertMany([
    {
      type: NOTIFICATION_TYPES.ORDER_NEW,
      title: "Đơn hàng mới #LSBT08DEMO002",
      message: "Hệ thống ghi nhận 1 đơn hàng mới cần admin xác nhận và xử lý.",
      severity: "success",
      audience: NOTIFICATION_AUDIENCE.ADMIN,
      targetUrl: "/admin",
      metadata: { orderCode: "LSBT08DEMO002", total: 28990000 },
      channels: ["database", "socket", "mail"],
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      type: NOTIFICATION_TYPES.REVIEW_NEW,
      title: "Đánh giá mới cho ASUS ROG Strix G16",
      message: "Khách hàng vừa gửi đánh giá 5 sao kèm bình luận sau khi đơn đã giao.",
      severity: "info",
      audience: NOTIFICATION_AUDIENCE.ADMIN,
      targetUrl: `/product/${seededProducts[0]._id}`,
      metadata: { productId: seededProducts[0]._id, rating: 5 },
      channels: ["database", "socket", "mail"],
      createdAt: new Date(Date.now() - 52 * 60 * 1000),
    },
    {
      type: NOTIFICATION_TYPES.VOUCHER_NEW,
      title: "Voucher BT08WELCOME đang hoạt động",
      message: "Mã giảm giá công khai mới đã sẵn sàng hiển thị trong kho thành viên.",
      severity: "success",
      audience: NOTIFICATION_AUDIENCE.ALL,
      targetUrl: "/store",
      metadata: { code: "BT08WELCOME" },
      channels: ["database", "socket", "mail"],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      type: NOTIFICATION_TYPES.ORDER_STATUS,
      title: "Đơn #LSBT08DEMO001 đã giao thành công",
      message: "Tiền COD của đơn đã giao được ghi nhận vào ví doanh thu.",
      severity: "success",
      audience: NOTIFICATION_AUDIENCE.USER,
      recipient: demoUser._id,
      targetUrl: `/orders/${demoOrder._id}`,
      metadata: { orderId: demoOrder._id, status: "DELIVERED" },
      channels: ["database", "socket", "mail"],
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ]);

  console.log(`Seeded BT08: ${productsWithSlug.length} products, ${cats.length} categories, ${users.length} users, 3 vouchers, 4 notifications, 1 delivered order & 1 review`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });



