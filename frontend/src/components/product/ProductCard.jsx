import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, XCircle } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Rating from "../ui/Rating";
import Price from "../ui/Price";

export default function ProductCard({ product, onQuickView }) {
  const { toggle, has } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn, openLoginModal } = useAuth();
  const liked = has(product.id);
  const primaryImage = product.images?.[0] || product.thumbnail || "";
  const secondaryImage = product.images?.[1] || primaryImage;
  
  // Get default variant (for Add to Cart button) - first color + first size
  const defaultColor = product.colors?.[0]?.name;
  const defaultSize = product.sizes?.[0];
  
  // Find the quantity for the default variant
  const defaultVariantStock = product.sizeDetails?.find(
    v => v.color === defaultColor && v.size === defaultSize
  )?.quantity ?? product.stock ?? 0;
  
  const hasStock = defaultVariantStock > 0;
  
  // Check if ALL variants are out of stock
  const allVariantsOutOfStock = product.sizeDetails?.length > 0 
    ? !product.sizeDetails?.some(v => v.quantity > 0)
    : !hasStock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E9E5E5] hover:shadow-[0_18px_50px_-20px_rgba(128,0,0,0.25)] hover:-translate-y-1 transition-all duration-500"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden zoom-wrap bg-[#FAF6F4]">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="zoom-img absolute inset-0 w-full h-full object-cover"
        />
        <img
          src={secondaryImage}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.newArrival && (
            <span className="bg-[#D4AF37] text-white text-[8px] sm:text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded-full">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-white text-[#800000] border border-[#800000]/20 text-[8px] sm:text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded-full">
              Top Selling
            </span>
          )}
          {allVariantsOutOfStock && (
            <span className="bg-[#DC2626] text-white text-[8px] sm:text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <XCircle size={10} /> Out of Stock
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            if (!isLoggedIn) {
              openLoginModal();
              return;
            }
            toggle(product);
          }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            size={16}
            className={liked ? "fill-[#800000] text-[#800000]" : "text-[#800000]"}
          />
        </button>
        {/* Quick actions */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:flex flex-row gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isLoggedIn) {
                openLoginModal();
                return;
              }
              if (hasStock) {
                addToCart(product, product.sizes[0], product.colors[0]?.name || "", 1);
              }
            }}
            disabled={!hasStock}
            className={`flex-1 h-9 rounded-full text-white text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition ${
              hasStock ? "bg-[#800000] hover:bg-[#5c0000]" : "bg-neutral-300 cursor-not-allowed"
            }`}
          >
<ShoppingCart size={14} /> {hasStock ? "Add to cart" : "Out of Stock"}
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="h-9 w-9 rounded-full bg-white text-[#800000] flex items-center justify-center hover:bg-[#FFF8F8] transition self-center"
              aria-label="Quick view"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{product.category}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-display text-base sm:text-lg text-[#1c1c1c] leading-snug line-clamp-1 hover:text-[#800000] transition">
            {product.name}
          </h3>
        </Link>
        {/* Rating temporarily hidden - replace with comment to restore: 
        <div className="mt-1.5">
          <Rating value={product.rating} size={12} showValue />
        </div>
        */}
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
              <div className="flex items-center gap-1 min-w-0">
                {(product.colors || []).slice(0, 3).map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="w-3 h-3 rounded-full border border-[#E9E5E5]"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {(product.colors || []).length > 3 && (
                  <span className="text-[10px] text-neutral-500">+{(product.colors || []).length - 3}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  openLoginModal();
                  return;
                }
                if (hasStock) {
                  addToCart(product, product.sizes[0], product.colors[0]?.name || "", 1);
                }
              }}
              disabled={!hasStock}
              className={`w-full h-10 rounded-full text-white text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition sm:hidden ${
                hasStock ? "bg-[#800000] hover:bg-[#5c0000]" : "bg-neutral-300 cursor-not-allowed"
              }`}
            >
<ShoppingCart size={14} /> {hasStock ? "Add to cart" : "Out of Stock"}
            </button>
          </div>
        </div>
    </motion.div>
  );
}