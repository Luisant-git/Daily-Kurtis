import { FEATURED_CATEGORIES } from "./site.js";

const CATEGORIES = FEATURED_CATEGORIES.map((category) => category.name);

const FABRICS = ["Cotton", "Rayon", "Chanderi", "Silk", "Georgette", "Linen", "Crepe"];
const OCCASIONS = ["Casual", "Office", "Festive", "Party", "Daily", "Wedding"];

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

export const CATEGORY_LIST = CATEGORIES;
export const FABRIC_LIST = FABRICS;
export const OCCASION_LIST = OCCASIONS;
export const COLOR_LIST = COLOR_PALETTE;
export const SIZE_LIST = SIZES_ALL;