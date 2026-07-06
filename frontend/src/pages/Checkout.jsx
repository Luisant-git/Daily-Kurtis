import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CreditCard, Truck, Wallet, ShieldCheck, ChevronLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { shippingApi } from "../api/shipping";
import { orderApi } from "../api/order";
import { useEffect } from "react";
import Button from "../components/ui/Button";
import { formatINR } from "../components/ui/Price";
import Empty from "../components/ui/Empty";
import { toast } from "react-toastify";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, updateShippingAddress } = useAuth();
  const nav = useNavigate();
  const [payment, setPayment] = useState("upi");
  const [placed, setPlaced] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.shippingAddress?.name || user?.name || '',
      mobile: user?.shippingAddress?.mobile || user?.mobile || '',
      addressLine: user?.shippingAddress?.addressLine || '',
      landmark: user?.shippingAddress?.landmark || '',
      city: user?.shippingAddress?.city || '',
      state: user?.shippingAddress?.state || '',
      pincode: user?.shippingAddress?.pincode || '',
    }
  });

  const [shippingRules, setShippingRules] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  
  const currentState = watch("state");

  useEffect(() => {
    shippingApi.fetchShippingRules().then(setShippingRules).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentState && shippingRules.length > 0) {
      const normalizedState = currentState.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_');
      const rule = shippingRules.find(r => r.state === normalizedState);
      setShippingFee(rule ? rule.flatShippingRate : 0);
    }
  }, [currentState, shippingRules]);

  const total = subtotal + shippingFee;

  if (items.length === 0 && !placed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Empty title="Your cart is empty" subtitle="Add some items to checkout." cta="Shop now" />
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto">
          <Check size={36} />
        </motion.div>
        <h1 className="font-display text-4xl mt-6">Order Confirmed!</h1>
        <p className="text-neutral-600 mt-3">
          Thank you for choosing Daily Kurtis. Your order <span className="font-medium text-[#800000]">#{placedOrderId || "Confirmed"}</span> has been placed successfully.
        </p>
        <p className="text-sm text-neutral-500 mt-2">A confirmation has been sent to your email.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => nav("/orders")}>View Orders</Button>
          <Button variant="outline" onClick={() => nav("/shop")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      if (user?.token) {
        await updateShippingAddress(user.token, {
          name: data.fullName,
          addressLine: data.addressLine,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          mobile: data.mobile,
        });
      }

      const orderData = {
        subtotal: String(subtotal),
        deliveryFee: String(shippingFee),
        total: String(total),
        paymentMethod: payment,
        shippingAddress: {
          fullName: data.fullName,
          addressLine1: data.addressLine,
          landmark: data.landmark || '',
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          mobile: data.mobile,
        },
        deliveryOption: { name: "Standard Delivery", fee: shippingFee }
      };

      const res = await orderApi.createOrder(user.token, orderData);
      
      clearCart();
      setPlacedOrderId(res.id);
      setPlaced(true);
      toast.success("Order placed successfully!");
    } catch (e) {
      toast.error(e.message || "Failed to place order");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => nav(-1)} className="text-sm text-neutral-500 inline-flex items-center gap-1.5 hover:text-[#800000]">
        <ChevronLeft size={14} /> Back to bag
      </button>

      <div className="mt-6 grid lg:grid-cols-[1fr_400px] gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Step 1 - Shipping */}
          <Step n="01" title="Shipping Address" sub="Where should we deliver your order?">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.fullName?.message}>
                <input className="input" {...register("fullName", { required: "Required" })} placeholder="Enter full name" />
              </Field>
              <Field label="Registered Mobile" error={errors.mobile?.message}>
                <input className="input" {...register("mobile", { required: "Required" })} placeholder="Registered mobile" type="tel" />
              </Field>
              <Field label="Address Line" full error={errors.addressLine?.message}>
                <input className="input" {...register("addressLine", { required: "Required" })} placeholder="House/Flat No., Building Name, Street" />
              </Field>
              <Field label="Landmark (Optional)" error={errors.landmark?.message}>
                <input className="input" {...register("landmark")} placeholder="Near hospital/school etc." />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <input className="input" {...register("city", { required: "Required" })} />
              </Field>
              <Field label="State" error={errors.state?.message}>
                <input className="input" {...register("state", { required: "Required" })} />
              </Field>
              <Field label="Pincode" error={errors.pincode?.message}>
                <input className="input" {...register("pincode", { required: "Required" })} />
              </Field>
            </div>
          </Step>

          {/* Step 2 - Payment */}
          <Step n="02" title="Payment Method" sub="Select your preferred way to pay.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "upi", label: "UPI / Netbanking", Icon: Wallet },
                { id: "cod", label: "Cash on Delivery", Icon: Truck },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={`p-5 rounded-xl border text-left transition ${
                    payment === p.id ? "border-[#D4AF37] bg-[#FFF8F8]" : "border-[#E9E5E5] hover:border-[#800000]"
                  }`}
                >
                  <p.Icon size={20} className={payment === p.id ? "text-[#D4AF37]" : "text-neutral-500"} />
                  <p className="text-sm font-medium mt-3 uppercase tracking-wider">{p.label}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2 text-xs text-neutral-600 bg-[#FFF8F8] p-4 rounded-xl">
              <ShieldCheck size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <p>Your data is encrypted using industry-standard SSL. We never store your payment details.</p>
            </div>
          </Step>

          <Button size="lg" type="submit" className="w-full">
            Place Order — {formatINR(total)} <ArrowRight size={14} />
          </Button>
        </form>

        {/* Summary */}
        <aside className="bg-white border border-[#E9E5E5] rounded-2xl p-6 h-fit sticky top-28">
          <h3 className="font-display text-xl">Order Summary</h3>
          <p className="text-xs text-neutral-500">{items.length} items</p>

          <div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-2">
            {items.map((i) => (
              <div key={`${i.product?.id || i.productId || i.id}-${i.size}-${i.color}`} className="flex gap-3">
                <img src={i.product?.images?.[0] || i.product?.thumbnail || i.imageUrl || ""} className="w-16 aspect-[4/5] rounded-lg object-cover" alt={i.product?.name || i.name || ""} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{i.product?.name || i.name}</p>
                  <p className="text-xs text-neutral-500">{i.size} · {i.color} · Qty {i.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[#800000]">{formatINR((i.product?.discountPrice || parseFloat(i.price) || 0) * i.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E9E5E5] mt-5 pt-5 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className={shippingFee === 0 ? "text-[#16A34A]" : ""}>{shippingFee === 0 ? "Free" : formatINR(shippingFee)}</span></div>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-[#E9E5E5]">
            <span className="uppercase text-xs tracking-wider">Total</span>
            <span className="font-display text-2xl text-[#800000]">{formatINR(total)}</span>
          </div>
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background: #fff;
          border: 1px solid #E9E5E5;
          border-radius: 9999px;
          font-size: 14px;
          outline: none;
        }
        .input:focus { border-color: #800000; }
      `}</style>
    </div>
  );
}

function Step({ n, title, sub, children }) {
  return (
    <section className="bg-white rounded-2xl border border-[#E9E5E5] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="w-10 h-10 rounded-full bg-[#FFF8F8] border border-[#E9E5E5] text-[#D4AF37] flex items-center justify-center font-display">{n}</span>
        <div className="flex-1">
          <h3 className="font-display text-xl">{title}</h3>
          <p className="text-xs text-neutral-500 mt-1">{sub}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, children, full, error }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs uppercase tracking-wider text-neutral-500 block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}