import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.js";
import Product from "../models/product.js";
dotenv.config();

const categories = [
  { name: "Laptop Gaming", slug: "laptop-gaming", icon: "🎮", color: "#EF4444", description: "Laptop chuyên game hiệu năng cao" },
  { name: "Laptop Văn Phòng", slug: "laptop-van-phong", icon: "💼", color: "#3B82F6", description: "Laptop mỏng nhẹ cho công việc" },
  { name: "MacBook", slug: "macbook", icon: "🍎", color: "#8B5CF6", description: "Dòng MacBook Apple chính hãng" },
  { name: "Phụ Kiện", slug: "phu-kien", icon: "🖱️", color: "#10B981", description: "Chuột, bàn phím, tai nghe..." },
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
  console.log("✅ Connected to MongoDB");

  await Category.deleteMany({});
  await Product.deleteMany({});

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
    slug: p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "-") + `-${i}`,
    rating: (4 + Math.random()).toFixed(1) * 1,
    reviewCount: Math.floor(Math.random() * 200) + 10,
  }));

  await Product.insertMany(productsWithSlug);
  console.log(`✅ Seeded ${productsWithSlug.length} products & ${cats.length} categories`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
