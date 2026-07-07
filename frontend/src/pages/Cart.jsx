import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import Breadcrumb from "../components/ui/Breadcrumb";
import Empty from "../components/ui/Empty";
import Button from "../components/ui/Button";
import { formatINR } from "../components/ui/Price";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { shippingApi } from "../api/shipping";
import { couponApi } from "../api/coupon";

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [validating, setValidating] = useState(false);

  const apply = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!user?.token) {
      toast.error("Please login to apply coupons");
      return;
    }
    setValidating(true);
    try {
      const cartItems = items.map(item => ({
        productId: item.product?.id || item.productId,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity,
      }));
      const result = await couponApi.validateCoupon(user.token, coupon, subtotal, shipping, 0, cartItems);
      const d = Math.round(result.discount);
      setDiscount(d);
      setAppliedCode(result.coupon.code);
      sessionStorage.setItem('appliedCoupon', JSON.stringify({
        code: result.coupon.code,
        discount: d,
        subtotal: subtotal,
        shipping: shipping
      }));
      toast.success(`Coupon applied! You saved ${formatINR(d)}`);
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      sessionStorage.removeItem('appliedCoupon');
      toast.error("Invalid coupon");
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    const loadShipping = async () => {
      try {
        const rules = await shippingApi.fetchShippingRules();
        const state = user?.shippingAddress?.state;
        if (state && rules.length > 0) {
          const normalizedState = state.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_');
          const rule = rules.find(r => r.state === normalizedState);
          setShipping(rule ? parseFloat(rule.flatShippingRate) : 0);
        } else {
          setShipping(0);
        }
      } catch (e) {
        console.error("Failed to load shipping rules:", e);
        setShipping(0);
      }
    };

    loadShipping();
  }, [user?.shippingAddress?.state]);

  const total = Math.max(0, subtotal - discount + shipping);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
        <Empty icon={<ShoppingBag size={28} />} title="Your bag is empty" subtitle="Looks like you haven't added anything yet — let's fix that!" cta="Shop Now" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shopping Bag" }]} />
          <h1 className="font-display text-3xl sm:text-4xl mt-3">Shopping Bag</h1>
          <p className="text-sm text-neutral-600 mt-2">{items.length} item{items.length > 1 ? "s" : ""} in your bag</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product?.id || item.productId || item.id}-${item.size}-${item.color}`}
              className="bg-white border border-[#E9E5E5] rounded-2xl p-4 sm:p-5 flex gap-4"
            >
              <Link to={`/product/${item.product?.slug || "undefined"}`} className="shrink-0">
                <img src={item.product?.images?.[0] || item.product?.thumbnail || item.imageUrl || ""} alt={item.product?.name || item.name || ""} className="w-24 sm:w-32 aspect-[4/5] object-cover rounded-xl" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{item.product?.category || "Category"}</p>
                    <Link to={`/product/${item.product?.slug || "undefined"}`} className="font-display text-base sm:text-lg text-[#1c1c1c] hover:text-[#800000]">
                      {item.product?.name || item.name}
                    </Link>
                    <p className="text-xs text-neutral-500 mt-1">Size: {item.size} · Color: {item.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#800000]">{formatINR((item.product?.discountPrice || parseFloat(item.price) || 0) * item.quantity)}</p>
                    <p className="text-xs text-neutral-400 line-through">{formatINR((item.product?.price || parseFloat(item.price) || 0) * item.quantity)}</p>
                  </div>
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-[#E9E5E5] rounded-full">
                    <button onClick={() => updateQty(item.product?.id || item.productId, item.size, item.color, item.quantity - 1)} className="h-9 w-9 flex items-center justify-center text-[#800000]"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product?.id || item.productId, item.size, item.color, item.quantity + 1)} className="h-9 w-9 flex items-center justify-center text-[#800000]"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product?.id || item.productId, item.size, item.color)} className="text-xs text-neutral-500 hover:text-[#DC2626] inline-flex items-center gap-1.5">
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="bg-white border border-[#E9E5E5] rounded-2xl p-6 h-fit sticky top-28">
          <h3 className="font-display text-xl">Order Summary</h3>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Promo Code</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value.toUpperCase());
                    if (appliedCode) {
                      setDiscount(0);
                      setAppliedCode("");
                    }
                  }}
                  placeholder="Enter code"
                  className="w-full h-10 pl-9 pr-3 rounded-full border border-[#E9E5E5] text-sm outline-none focus:border-[#800000] uppercase"
                />
              </div>
              <button onClick={apply} disabled={validating || !coupon.trim()} className="h-10 px-4 rounded-full bg-[#FFF8F8] border border-[#E9E5E5] text-sm font-medium text-[#800000] hover:bg-[#f5e7e7] disabled:opacity-50">
                {validating ? "..." : "Apply"}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2.5 text-sm">
            <Row k="Subtotal" v={formatINR(subtotal)} />
            {discount > 0 && <Row k="Discount" v={`- ${formatINR(discount)}`} highlight />}
            <Row k="Shipping" v={shipping === 0 ? "Free" : formatINR(shipping)} />
          </div>

          <div className="border-t border-[#E9E5E5] mt-5 pt-5 flex items-center justify-between">
            <span className="text-sm uppercase tracking-wider text-neutral-500">Total Payable</span>
            <span className="font-display text-2xl text-[#800000]">{formatINR(total)}</span>
          </div>

          <Button onClick={() => nav("/checkout")} className="w-full mt-5">Checkout <ArrowRight size={14} /></Button>

          <p className="text-[11px] text-center text-neutral-500 mt-4">Secure checkout · Free 15-day returns</p>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, muted, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-neutral-500" : "text-neutral-700"}>{k}</span>
      <span className={highlight ? "text-[#16A34A] font-medium" : "text-[#1c1c1c] font-medium"}>{v}</span>
    </div>
  );
}
