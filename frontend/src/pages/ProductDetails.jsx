import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Truck, ShieldCheck, RefreshCcw, Share2, Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { productApi } from "../api/product.js";
import Breadcrumb from "../components/ui/Breadcrumb";
import Rating from "../components/ui/Rating";
import Price from "../components/ui/Price";
import Button from "../components/ui/Button";
import Empty from "../components/ui/Empty";
import ProductCard from "../components/product/ProductCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useRecent } from "../context/RecentContext";
import { useAuth } from "../context/AuthContext";
import { REVIEWS } from "../data/site.js";

export default function ProductDetails() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findProduct = async () => {
      setLoading(true);
      // Try to extract ID from slug (format: product-name-id)
      const parts = slug.split("-");
      const lastPart = parts[parts.length - 1];
      const id = parseInt(lastPart);
      
      if (!isNaN(id)) {
        try {
          const apiProduct = await productApi.getProductById(id);
          if (apiProduct) {
            const firstColor = apiProduct.colors?.[0] || {};
            const firstSize = firstColor?.sizes?.[0] || {};
            const firstGallery = apiProduct.gallery?.[0] || {};
            const basePrice = parseFloat(firstSize?.price || apiProduct.basePrice || 0);
            const mrpValue = apiProduct.mrp ? parseFloat(apiProduct.mrp) : basePrice;
            const discountPercent = mrpValue > basePrice ? Math.round(((mrpValue - basePrice) / mrpValue) * 100) : 0;
            setProduct({
              id: apiProduct.id,
              name: apiProduct.name,
              slug: slug,
              description: apiProduct.description || "",
              category: apiProduct.category?.name || "",
              fabric: apiProduct.fabric || "",
              occasion: apiProduct.occasion || "",
              price: mrpValue,
              discountPrice: basePrice,
              discount: discountPercent,
              rating: 4.5,
              reviews: 0,
              sizes: firstColor?.sizes?.map((s) => s.size) || [],
              colors: (apiProduct.colors || []).map((c) => ({
                name: c.name,
                hex: c.code,
                image: c.image || "",
                sizes: (c.sizes || []).map((s) => ({ size: s.size, price: s.price, quantity: s.quantity })),
              })) || [],
              stock: parseInt(firstSize?.quantity || 0),
              featured: false,
              bestSeller: false,
              newArrival: apiProduct.newArrivals || false,
              images: apiProduct.gallery?.map((g) => g.url) || (firstColor?.image ? [firstColor.image] : []),
              thumbnail: firstColor?.image || firstGallery?.url || "",
              rawColors: apiProduct.colors || [],
            });
          }
        } catch (error) {
          console.error("Failed to fetch product from API:", error);
        }
      }
      
      setLoading(false);
    };
    
    findProduct();
  }, [slug]);
  const { addToCart } = useCart();
  const { toggle, has } = useWishlist();
  const { push } = useRecent();
  const { isLoggedIn, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState("desc");
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    if (product) {
      const firstColor = product.rawColors?.[0] || product.colors?.[0] || {};
      const firstSize = firstColor.sizes?.[1]?.size || firstColor.sizes?.[0]?.size || product.sizes[0];
      setSize(firstSize);
      setColor(product.colors[0]?.name || "");
      setActiveImg(0);
      push(product);
    }
  }, [product?.id]);

  // Reset size when color changes if current size isn't available in new color
  useEffect(() => {
    if (!product || !color) return;
    const selectedColorData = product.rawColors?.find(c => c.name === color) || product.rawColors?.[0] || {};
    const selectedSizes = selectedColorData.sizes?.map(s => s.size) || product.sizes || [];
    if (selectedSizes.length > 0 && !selectedSizes.includes(size)) {
      setSize(selectedSizes[0]);
    }
  }, [color, product, size]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <p className="text-neutral-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Empty title="Product not found" subtitle="The product you're looking for doesn't exist." cta="Go Shopping" />
      </div>
    );
  }

  const related = [];
  const liked = has(product.id);
  
  // Get the selected color's data
  const selectedColorData = product.rawColors?.find(c => c.name === color) || product.rawColors?.[0] || {};
  const selectedSizes = selectedColorData.sizes?.map(s => s.size) || product.sizes || [];
  const selectedBasePrice = parseFloat(selectedColorData.sizes?.[0]?.price || 0) || product.discountPrice;
  const selectedMrp = product.price > selectedBasePrice ? product.price : selectedBasePrice;
  const selectedDiscount = selectedMrp > selectedBasePrice ? Math.round(((selectedMrp - selectedBasePrice) / selectedMrp) * 100) : 0;
  const selectedColorImage = selectedColorData.image || "";
  
  const galleryImages = selectedColorImage 
    ? [selectedColorImage, ...(product.images?.filter(img => img !== selectedColorImage) || [])]
    : (product.images?.length ? product.images : [product.thumbnail || ""]);
  const activeImage = galleryImages[activeImg] || galleryImages[0];

  const handleAdd = ({ showToast = true, goToCheckout = false } = {}) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (!size || !color) return;
    addToCart(product, size, color, qty, { showToast, openDrawer: !goToCheckout });
    if (goToCheckout) navigate("/checkout");
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Shop", to: "/shop" },
            { label: product.category, to: `/shop?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">
          <div className="lg:w-20 flex lg:flex-col gap-3 overflow-x-auto no-scrollbar">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition ${
                  i === activeImg ? "border-[#800000]" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div
            className="relative flex-1 aspect-[4/5] overflow-hidden rounded-2xl bg-[#FAF6F4] cursor-zoom-in"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                transform: zoom.active ? "scale(1.8)" : "scale(1)",
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              }}
            />
            {product.bestSeller && (
              <span className="absolute top-4 right-4 bg-[#D4AF37] text-white text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
                Top Selling
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-medium">
            {product.category}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1c1c1c] mt-2 leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <Rating value={product.rating} />
            <span className="text-xs text-neutral-500">({product.reviews} reviews)</span>
            <span className="text-xs text-[#16A34A] flex items-center gap-1">
              <Check size={12} /> In Stock
            </span>
          </div>

          <div className="mt-5">
            <Price price={selectedMrp} discountPrice={selectedBasePrice} size="lg" />
            {selectedDiscount > 0 && (
              <p className="text-xs text-green-600 mt-1">You save ₹{(selectedMrp - selectedBasePrice).toLocaleString("en-IN")}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">Inclusive of all taxes</p>
          </div>

          <p className="mt-6 text-sm text-neutral-700 leading-relaxed">{product.description}</p>

          {/* Color */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1c1c1c]">Color: <span className="text-neutral-500 font-normal">{color}</span></p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  className={`w-9 h-9 rounded-full border-2 transition ${
                    color === c.name ? "border-[#800000] scale-110" : "border-[#E9E5E5]"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1c1c1c]">Select Size</p>
              <button className="text-xs text-[#800000] underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 min-w-11 px-4 rounded-full text-sm transition ${
                    size === s ? "bg-[#800000] text-white border-[#800000]" : "bg-white border border-[#E9E5E5] hover:border-[#800000]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-7 flex items-center gap-4">
            <p className="text-sm font-medium text-[#1c1c1c]">Quantity</p>
            <div className="inline-flex items-center border border-[#E9E5E5] rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 flex items-center justify-center text-[#800000]"><Minus size={14} /></button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 flex items-center justify-center text-[#800000]"><Plus size={14} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => handleAdd({ showToast: true })} className="w-full sm:flex-1">Add to Bag</Button>
              <Button size="lg" variant="gold" onClick={() => handleAdd({ showToast: false, goToCheckout: true })} className="w-full sm:flex-1">Buy Now</Button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    openLoginModal();
                    return;
                  }
                  toggle(product);
                }}
                className="h-14 flex-1 rounded-full border border-[#E9E5E5] flex items-center justify-center hover:border-[#800000] transition"
                aria-label="Wishlist"
              >
                <Heart size={18} className={liked ? "fill-[#800000] text-[#800000]" : "text-[#800000]"} />
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}
                className="h-14 flex-1 rounded-full border border-[#E9E5E5] flex items-center justify-center hover:border-[#800000] transition"
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* USPs */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-[#E9E5E5] py-5">
            {[
              { Icon: Truck, t: "Free Shipping", s: "Over ₹1,499" },
              { Icon: RefreshCcw, t: "15-Day Returns", s: "Easy & free" },
              { Icon: ShieldCheck, t: "100% Authentic", s: "Quality assured" },
            ].map(({ Icon, t, s }) => (
              <div key={t} className="text-center">
                <Icon size={20} className="mx-auto text-[#D4AF37]" strokeWidth={1.5} />
                <p className="text-[11px] font-medium mt-1.5 uppercase tracking-wider">{t}</p>
                <p className="text-[10px] text-neutral-500">{s}</p>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div className="mt-6 space-y-2">
            {[
              { id: "desc", title: "Product Details", body: (
                <ul className="text-sm text-neutral-700 space-y-1.5">
                  <li>• Fabric: <span className="font-medium">{product.fabric}</span></li>
                  <li>• Occasion: <span className="font-medium">{product.occasion}</span></li>
                  <li>• Pattern: Hand-block / Embroidered</li>
                  <li>• Length: Knee Length (Approx. 42")</li>
                  <li>• Country of Origin: India</li>
                </ul>
              )},
              { id: "fabric", title: "Fabric & Care", body: (
                <ul className="text-sm text-neutral-700 space-y-1.5">
                  <li>• {product.fabric} — soft, breathable & long-lasting</li>
                  <li>• Gentle hand wash recommended for first wash</li>
                  <li>• Dry in shade to retain colour brilliance</li>
                  <li>• Iron on medium heat, do not bleach</li>
                </ul>
              )},
              { id: "ship", title: "Shipping & Returns", body: (
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Orders are dispatched within 24 hours. Standard delivery in 3–5 business days. We offer free 15-day returns on unworn items.
                </p>
              )},
            ].map((a) => (
              <div key={a.id} className="border border-[#E9E5E5] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenAccordion(openAccordion === a.id ? null : a.id)}
                >
                  <span className="font-display text-base">{a.title}</span>
                  <ChevronDown size={16} className={`transition ${openAccordion === a.id ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === a.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5">
                    {a.body}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="bg-[#FAF6F4] border-y border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[280px_1fr] gap-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37]">Customer Reviews</p>
              <h3 className="font-display text-3xl mt-3">What our customers say</h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-display text-5xl text-[#800000]">{product.rating.toFixed(1)}</span>
                <div>
                  <Rating value={product.rating} />
                  <p className="text-xs text-neutral-500 mt-1">{product.reviews} reviews</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {REVIEWS.slice(0, 3).map((r) => (
                <div key={r.name} className="bg-white border border-[#E9E5E5] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={r.image} className="w-10 h-10 rounded-full object-cover" alt={r.name} />
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <Rating value={r.rating} size={11} />
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Similar */}
      {related.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3 mb-8">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37]">Complete the Look</p>
                <h3 className="font-display text-3xl mt-2">You May Also Like</h3>
              </div>
              <Link to="/shop" className="text-sm text-[#800000]">View all</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
