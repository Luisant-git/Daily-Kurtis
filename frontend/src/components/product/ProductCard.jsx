import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import Rating from "../ui/Rating";
import Price from "../ui/Price";

export default function ProductCard({ product, onQuickView }) {
  const { toggle, has } = useWishlist();
  const { addToCart } = useCart();
  const liked = has(product.id);
  const primaryImage = product.images?.[0] || product.thumbnail || "";
  const secondaryImage = product.images?.[1] || primaryImage;

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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-[#800000] text-white text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              {product.discount}% Off
            </span>
          )}
          {product.newArrival && (
            <span className="bg-[#D4AF37] text-white text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-white text-[#800000] border border-[#800000]/20 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              Top Selling
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
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
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, product.sizes[0], product.colors[0].name, 1);
            }}
            className="flex-1 h-10 rounded-full bg-[#800000] text-white text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#5c0000] transition"
          >
            <ShoppingBag size={14} /> Add
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="h-10 w-10 rounded-full bg-white text-[#800000] flex items-center justify-center hover:bg-[#FFF8F8] transition"
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
        <div className="mt-1.5">
          <Rating value={product.rating} size={12} showValue />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="w-3 h-3 rounded-full border border-[#E9E5E5]"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
