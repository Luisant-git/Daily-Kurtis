import { FEATURED_CATEGORIES } from "./site.js";

const img = (id, w = 800, h = 1000) => {
  if (typeof id === "string" && id.startsWith("http")) {
    return id;
  }
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

const PRODUCT_IMAGE_SETS = [
  [
    "https://byshree.com/cdn/shop/files/1_f826d20a-360e-4820-875e-cee0f5077feb.jpg?v=1782497433&width=800",
    "https://byshree.com/cdn/shop/files/3_d31a8a29-4ca2-4e7d-8384-8cc170773d3a.jpg?v=1782497433&width=800",
    "https://byshree.com/cdn/shop/files/6_16610da8-cf68-4b84-8cac-26c8bb9f16d2.jpg?v=1782497435&width=800",
    
  ],
  ["https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQvg92ghM3yWpPca1uOXgVIF95eQO-2adE2a0ZyWscHHAbH32ofyayfwdii6D76lKCnAjJy4_x7uXxQVyyLZSGV7rAwrrNFIbHG8ZXzWub3OKje2iuk_Mddsw",
    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR40TQuxl-5L5E49SSKfPGdV5c7SrU4o_mH_uNQ-AAsQV1oHF6ZqMjtN_u8B6Xu-PkmdJIvY2Ydc0cwpwDZ8ZaZhiOGf2Po"
  ],
  [
    "https://byshree.com/cdn/shop/files/26220KBCREAM_main.jpg?v=1782498479&width=800",
    "https://byshree.com/cdn/shop/files/26220KBCREAM_right.jpg?v=1782498479&width=800",
"https://byshree.com/cdn/shop/files/26220KBCREAM_detail.jpg?v=1782498481&width=800"
  ],
  [
    "https://www.aachho.com/cdn/shop/files/8_1dc18193-4971-46cb-9f07-421e5ebd85d0_540x.jpg?v=1768904018",
    
  ],["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRkgyrspXfhB85gTI_Uu-XAsuVkLCRN57LgYS8I778VRBPO5mR5mnjKsT3KVox_xzQLpxE9v4Xx2b0kUU8uHt8Tww90yoO4WolKCFairg-R",
    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTh09U4kfppknHoWgq16W3q91AQI8ESPOPgyDRGVXZQgIp1Ygsy2ItT8AgeEgY311iXZFQYf8YqEuBv_EjUWAceOmdvRkaNItqIDVIYLnI",
  ],
  
  ["https://www.aachho.com/cdn/shop/files/2_e37a2a76-088f-4aa6-b9b3-a5701ac9c6f5_1800x1800.jpg?v=1777123392",
    "https://www.aachho.com/cdn/shop/files/1_61483654-40ab-4964-a5ba-89e3b3f52964_1800x1800.jpg?v=1777123393",
    "https://www.aachho.com/cdn/shop/files/4_1bfa5ce0-478b-4681-b640-9ae251f6b303_1800x1800.jpg?v=1777123392",
  ],
  ["https://byshree.com/cdn/shop/files/SIDH-26158KBPOWDERBLUE_main.jpg?v=1782495311&width=800",
    "https://byshree.com/cdn/shop/files/SIDH-26158KBPOWDERBLUE_back.jpg?v=1782495312&width=800",
    "https://byshree.com/cdn/shop/files/SIDH-26158KBPOWDERBLUE_left.jpg?v=1782495310&width=800",
  ],
  ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTOS5z-XBpJVdOmR0GguGNK9xYYNrKAQqCXVHun2ARQebrW5QQMsShQVqFWet4SKZemRJHtfrFDBc0JSQp3T4Kz_diyABc2eQ",
    "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTQwQTWTha2mPmImn4NKgVpL3K-6rcGNPtT1e0wpV7ge9di7xM36OHkAZeZy4EwCStmMl4Va451JnDRBFH8oY97yNeUPjVY",
    "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQXVXjiABdxhsDrPbVdKpGOp0JzH5SQgcl6lwcSoWDhftDrtfBxuzlH-0eiV4HW-7zIxVuwFp1TtZTwFZ6BCPuMZ3C7eRkhYF94bkrZHobAq3imyfb7VnejNA",
  ],
  ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS_BvYcqw80LgBJtp-aeTnTfvmJycNN_WuTnq3B1OelPx8WlvfkSSEnydmJK8SxIoCelWYcDmKFksHXIQ8JW6fvCRH46CpRj7D3MQt2yoxbLhrSd4Md916j",
    "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTSp_kHDNJXjMpFK7HZmArDLwio6dmo3SLs4H5G5Zvf5tTc4Giut0HwkMxBxEOTSvO65tXpGN1kvPEdAhNHKuJDNqsD09i6mhhDdwFMPH1_0dFYh6MFp-uLQg",
  ],
["https://byshree.com/cdn/shop/files/20331NAVYBLUE_back.jpg?v=1782491413&width=540",
  "https://byshree.com/cdn/shop/files/20331NAVYBLUE_left.jpg?v=1782491439&width=800",
  "https://byshree.com/cdn/shop/files/20331NAVYBLUE_detail.jpg?v=1782491412&width=800",
],
  
  
];

function getProductImages(index) {
  const images = PRODUCT_IMAGE_SETS[index % PRODUCT_IMAGE_SETS.length] || PRODUCT_IMAGE_SETS[0];
  return images.map(img).filter(Boolean);
}

const CATEGORIES = FEATURED_CATEGORIES.map((category) => category.name);

const FABRICS = ["Cotton", "Rayon", "Chanderi", "Silk", "Georgette", "Linen", "Crepe"];
const OCCASIONS = ["Casual", "Office", "Festive", "Party", "Daily", "Wedding"];

const NAMES = [
  "Aamna Hand-block Kurti",
  "Riya Floral Anarkali",
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
  const productImages = getProductImages(i);
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
    images: productImages,
    thumbnail: productImages[0],
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