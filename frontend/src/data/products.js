const img = (id, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Curated photo ids of women's ethnic fashion / kurtis from Unsplash
const PHOTOS = ["https://www.libas.in/cdn/shop/files/GS1116_7Main_f86d0135-5f7d-4e7e-ac85-45f765c60117.jpg?v=1771334654&width=360"
  ,"https://www.libas.in/cdn/shop/files/49789A_1Main_26b6b944-db62-4be9-a68e-ff65f87cd6a8.jpg?v=1761741125&width=360",
  ]

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