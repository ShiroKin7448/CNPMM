const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const productImageSets = {
  "asus-rog-strix-g16-2024": [
    img("photo-1771015310937-6754da25e49a"),
    img("photo-1603302576837-37561b2e2302"),
    img("photo-1550745165-9bc0b252726f"),
    img("photo-1598550476439-6847785fcea6"),
  ],
  "msi-raider-ge78-hx": [
    img("photo-1547082299-de196ea013d6"),
    img("photo-1593640408182-31c70c8268f5"),
    img("photo-1518770660439-4636190af475"),
    img("photo-1593642632559-0c6d3fc62b89"),
  ],
  "lenovo-legion-5-pro": [
    img("photo-1544731612-de7f96afe55f"),
    img("photo-1515879218367-8466d910aaa4"),
    img("photo-1517694712202-14dd9538aa97"),
    img("photo-1484417894907-623942c8ee29"),
  ],
  "acer-predator-helios-18": [
    img("photo-1531297484001-80022131f5a1"),
    img("photo-1519389950473-47ba0277781c"),
    img("photo-1623177623442-979c1e42c255"),
    img("photo-1527443224154-c4a3942d3acf"),
  ],
  "asus-tuf-gaming-a15": [
    img("photo-1498050108023-c5249f4df085"),
    img("photo-1484788984921-03950022c9ef"),
    img("photo-1461749280684-dccba630e2f6"),
    img("photo-1516321318423-f06f85e504b3"),
  ],
  "dell-xps-15-oled": [
    img("photo-1696453423495-046a7d83bf55"),
    img("photo-1497366754035-f200968a6e72"),
    img("photo-1497366811353-6870744d04b2"),
    img("photo-1460925895917-afdab827c52f"),
  ],
  "hp-spectre-x360-14": [
    img("photo-1496181133206-80ce9b88a853"),
    img("photo-1525547719571-a2d4ac8945e2"),
    img("photo-1499951360447-b19be8fe80f5"),
    img("photo-1453928582365-b6ad33cbcf64"),
  ],
  "lenovo-thinkpad-x1-carbon": [
    img("photo-1541807084-5c52b6b3adef"),
    img("photo-1522199755839-a2bacb67c546"),
    img("photo-1483058712412-4245e9b90334"),
    img("photo-1516321497487-e288fb19713f"),
  ],
  "asus-zenbook-14-oled": [
    img("photo-1500530855697-b586d89ba3ee"),
    img("photo-1516321318423-f06f85e504b3"),
    img("photo-1504384308090-c894fdcc538d"),
    img("photo-1518005020951-eccb494ad742"),
  ],
  "microsoft-surface-laptop-5": [
    img("photo-1537498425277-c283d32ef9db"),
    img("photo-1587614382346-4ec70e388b28"),
    img("photo-1492724441997-5dc865305da7"),
    img("photo-1555421689-491a97ff2040"),
  ],
  "macbook-air-m3-13": [
    img("photo-1517336714731-489689fd1ca8"),
    img("photo-1588872657578-7efd1f1555ed"),
    img("photo-1484788984921-03950022c9ef"),
    img("photo-1515378791036-0648a3ef77b2"),
  ],
  "macbook-air-m3-15": [
    img("photo-1527443224154-c4a3942d3acf"),
    img("photo-1516321497487-e288fb19713f"),
    img("photo-1496181133206-80ce9b88a853"),
    img("photo-1541807084-5c52b6b3adef"),
  ],
  "macbook-pro-m4-14": [
    img("photo-1517694712202-14dd9538aa97"),
    img("photo-1515879218367-8466d910aaa4"),
    img("photo-1498050108023-c5249f4df085"),
    img("photo-1519389950473-47ba0277781c"),
  ],
  "macbook-pro-m4-16": [
    img("photo-1580910051074-3eb694886505"),
    img("photo-1555421689-491a97ff2040"),
    img("photo-1522199755839-a2bacb67c546"),
    img("photo-1460925895917-afdab827c52f"),
  ],
  "macbook-air-m2-13-cu": [
    img("photo-1499951360447-b19be8fe80f5"),
    img("photo-1453928582365-b6ad33cbcf64"),
    img("photo-1497366811353-6870744d04b2"),
    img("photo-1525547719571-a2d4ac8945e2"),
  ],
  "chuot-logitech-mx-master-3s": [
    img("photo-1527864550417-7fd91fc51a46"),
    img("photo-1527814050087-3793815479db"),
    img("photo-1615663245857-ac93bb7c39e7"),
    img("photo-1675589052020-0489b8a84f09"),
  ],
  "ban-phim-keychron-k2-pro": [
    img("photo-1587829741301-dc798b83add3"),
    img("photo-1595225476474-87563907a212"),
    img("photo-1618384887929-16ec33fab9ef"),
    img("photo-1563297007-0686b7003af7"),
  ],
  "tai-nghe-sony-wh-1000xm5": [
    img("photo-1505740420928-5e560c06d30e"),
    img("photo-1583394838336-acd977736f90"),
    img("photo-1546435770-a3e426bf472b"),
    img("photo-1484704849700-f032a568e944"),
  ],
  "man-hinh-lg-27-4k-ips": [
    img("photo-1527443224154-c4a3942d3acf"),
    img("photo-1593640408182-31c70c8268f5"),
    img("photo-1547082299-de196ea013d6"),
    img("photo-1623177623442-979c1e42c255"),
  ],
  "tui-laptop-tomtoc-16": [
    img("photo-1547949003-9792a18a2601"),
    img("photo-1590874103328-eac38a683ce7"),
    img("photo-1553062407-98eeb64c6a62"),
    img("photo-1545127398-14699f92334b"),
  ],
};

const normalizeKey = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getProductImages = (product = {}) => {
  const slug = normalizeKey(product.slug || product.name || "");
  const key = Object.keys(productImageSets).find((item) => slug.startsWith(item));
  return key ? productImageSets[key] : product.images || [];
};

export const applyProductImages = (product) => {
  if (!product) return product;
  return { ...product, images: getProductImages(product) };
};

export const applyProductImagesList = (products = []) =>
  products.map(applyProductImages);
