const img = (id, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Curated photo ids of women's ethnic fashion / kurtis from Unsplash
const PHOTOS = [
  "1610030469983-98e550d6193c",
  "1583391733956-6c78276477e3",
  "1610030469668-8e4a72f24e26",
  "1583391733981-8498408ee3a4",
  "1614252369475-531eba835be6",
  "1602810318383-e386cc2a3ccf",
  "1592301933927-35b597393c0a",
  "1596993100471-c3905dafa78e",
  "1583391733975-b21142b3aa3a",
  "1631233859262-0d7f6c895a3c",
  "1623625434462-e5e42318ae49",
  "1617922001439-4a2e6562f328",
  "1610189025609-bb6b3b3a9e7d",
  "1583391733956-6c78276477e3",
  "1602810316693-3667c854239a",
  "1610030469983-98e550d6193c",
];

const CATEGORIES = [
  "Cotton Kurthis",
  "Printed Kurthis",
  "Casual Wear",
  "Office Wear",
  "Party Wear",
  "Festival Collection",
  "Straight Cut",
  "A-Line",
  "Anarkali",
  "Plus Size",
];

const FABRICS = ["Cotton", "Rayon", "Chanderi", "Silk", "Georgette", "Linen", "Crepe"];
const OCCASIONS = ["Casual", "Office", "Festive", "Party", "Daily", "Wedding"];

const NAMES = [
  "Aamna Hand-block Kurti",
  "Riya Floral Anarkali",
  "Meher Chanderi Straight",
  "Saira Cotton A-Line",
  "Anaya Mirror Work Kurti",
  "Ishani Silk Festive Set",
  "Naina Office Essential",
  "Zoya Pastel Cotton",
  "Kavya Block Print Kurti",
  "Tara Embroidered Anarkali",
  "Mira Rayon Straight",
  "Diya Festive Silk",
  "Aarohi Casual Cotton",
  "Reva Office Crepe",
  "Saanvi Party Georgette",
  "Inaya Linen Lounge",
  "Pari Plus Size Anarkali",
  "Sia Pastel A-Line",
  "Myra Festive Chanderi",
  "Avni Cotton Daily Wear",
  "Lavanya Royal Anarkali",
  "Kiara Silk Wonder",
  "Vanya Block Printed",
  "Hiya Mirror Magic",
  "Eira Embroidered Kurti",
  "Trisha Festive Set",
  "Roopa Office Essential",
  "Pihu Cotton Comfort",
  "Saanchi Plus A-Line",
  "Anika Straight Cut",
  "Misha Rayon Print",
  "Yara Linen Slouchy",
  "Niyati Wedding Anarkali",
  "Aadhya Festive Silk",
  "Suhana Casual Cotton",
  "Mahira Crepe Office",
  "Aaradhya Party Wear",
  "Nitya Daily Kurti",
  "Bhavya Block Print",
  "Reyansi Festive Set",
];

const COLOR_PALETTE = [
  { name: "Maroon", hex: "#800000" },
  { name: "Ivory", hex: "#f5efe6" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Emerald", hex: "#0d6e4a" },
  { name: "Indigo", hex: "#293582" },
  { name: "Blush", hex: "#f1c9c5" },
  { name: "Mustard", hex: "#cf9b2a" },
  { name: "Olive", hex: "#6a7140" },
  { name: "Powder Blue", hex: "#a8c8e0" },
  { name: "Coral", hex: "#e26a5a" },
];

const SIZES_ALL = ["XS", "S", "M", "L", "XL", "XXL"];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pickN(arr, n, seed) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[(seed + i * 3) % arr.length]);
  return out;
}

const DESCRIPTIONS = [
  "Crafted from breathable fabric with elegant detailing, perfect for everyday wear.",
  "A timeless piece featuring intricate handwork and graceful silhouettes for festive moments.",
  "Soft, flowy and effortlessly stylish — designed to make you feel beautiful every day.",
  "Hand-block printed by artisans, blending heritage techniques with a modern fit.",
  "A signature Daily Kurtis piece — comfortable, refined, and gorgeously tailored.",
];

export const PRODUCTS = NAMES.map((name, i) => {
  const price = 999 + ((i * 137) % 4500);
  const discount = 10 + ((i * 7) % 50);
  const discountPrice = Math.round(price * (1 - discount / 100) / 10) * 10;
  const category = CATEGORIES[i % CATEGORIES.length];
  const fabric = FABRICS[i % FABRICS.length];
  const occasion = OCCASIONS[i % OCCASIONS.length];
  const photo1 = PHOTOS[i % PHOTOS.length];
  const photo2 = PHOTOS[(i + 4) % PHOTOS.length];
  const photo3 = PHOTOS[(i + 7) % PHOTOS.length];
  const photo4 = PHOTOS[(i + 2) % PHOTOS.length];
  return {
    id: i + 1,
    name,
    slug: slugify(name) + "-" + (i + 1),
    description: DESCRIPTIONS[i % DESCRIPTIONS.length],
    category,
    fabric,
    occasion,
    price,
    discountPrice,
    discount,
    rating: Math.round((3.8 + ((i * 17) % 12) / 10) * 10) / 10,
    reviews: 24 + ((i * 31) % 480),
    sizes: SIZES_ALL.slice(0, 4 + (i % 3)),
    colors: pickN(COLOR_PALETTE, 3 + (i % 3), i),
    stock: 5 + ((i * 11) % 40),
    featured: i % 4 === 0,
    bestSeller: i % 5 === 0,
    newArrival: i % 3 === 0,
    images: [img(photo1), img(photo2), img(photo3), img(photo4)],
    thumbnail: img(photo1, 600, 750),
  };
});

export const getProductBySlug = (slug) =>
  PRODUCTS.find((p) => p.slug === slug);

export const getRelatedProducts = (p, n = 4) =>
  PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, n);

export const CATEGORY_LIST = CATEGORIES;
export const FABRIC_LIST = FABRICS;
export const OCCASION_LIST = OCCASIONS;
export const COLOR_LIST = COLOR_PALETTE;
export const SIZE_LIST = SIZES_ALL;