import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Truck, Wallet, ShieldCheck, ChevronLeft, ArrowRight, Check, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { shippingApi } from "../api/shipping";
import { orderApi } from "../api/order";
import { couponApi } from "../api/coupon";
import Button from "../components/ui/Button";
import { formatINR } from "../components/ui/Price";
import Empty from "../components/ui/Empty";
import { toast } from "react-toastify";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, updateShippingAddress, loading: authLoading } = useAuth();
  const nav = useNavigate();
  
  const [payment, setPayment] = useState("upi");
  const [placed, setPlaced] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [coupon, setCoupon] = useState("");
  const [validating, setValidating] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingRules, setShippingRules] = useState([]);
  const [shippingFee, setShippingFee] = useState(null);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [savingBilling, setSavingBilling] = useState(false);
  const [billingEdited, setBillingEdited] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      // Shipping Address
      shippingFullName: '',
      shippingMobile: '',
      shippingAddressLine: '',
      shippingLandmark: '',
      shippingCity: '',
      shippingState: '',
      shippingPincode: '',
      // Billing Address
      billingFullName: '',
      billingMobile: '',
      billingAddressLine: '',
      billingLandmark: '',
      billingCity: '',
      billingState: '',
      billingPincode: '',
    }
  });

  // Load user's saved address into form when user data is available
  useEffect(() => {
    // Only set values after auth finishes loading to ensure user data is complete
    if (authLoading) return;
    
    if (user?.shippingAddress) {
      const addr = user.shippingAddress;
      const mobile = user?.mobile || addr?.mobile || '';
      setValue('shippingFullName', addr.name || user?.name || '');
      setValue('shippingMobile', mobile);
      setValue('shippingAddressLine', addr.addressLine || '');
      setValue('shippingLandmark', addr.landmark || '');
      setValue('shippingCity', addr.city || '');
      setValue('shippingState', addr.state || '');
      setValue('shippingPincode', addr.pincode || '');
      
      // Initialize billing address same as shipping (only if sameAsShipping is true)
      if (sameAsShipping) {
        setValue('billingFullName', addr.name || user?.name || '');
        setValue('billingMobile', mobile);
        setValue('billingAddressLine', addr.addressLine || '');
        setValue('billingLandmark', addr.landmark || '');
        setValue('billingCity', addr.city || '');
        setValue('billingState', addr.state || '');
        setValue('billingPincode', addr.pincode || '');
      }
    } else if (user?.mobile) {
      // If no shipping address but user has mobile, set it
      const mobile = user.mobile;
      setValue('shippingMobile', mobile);
      setValue('shippingFullName', user?.name || '');
      if (sameAsShipping) {
        setValue('billingMobile', mobile);
        setValue('billingFullName', user?.name || '');
      }
    }
  }, [user, setValue, authLoading, sameAsShipping]);

  // Load saved coupon and sameAsShipping state from sessionStorage
  useEffect(() => {
    if (authLoading) return;
    
    const savedCoupon = sessionStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        const currentSubtotal = subtotal;
        // Only clear if subtotal is significantly different
        if (parsed.subtotal && Math.abs(parsed.subtotal - currentSubtotal) > 100) {
          sessionStorage.removeItem('appliedCoupon');
          setDiscount(0);
          setAppliedCode("");
        } else {
          setDiscount(parsed.discount || 0);
          setAppliedCode(parsed.code || "");
        }
      } catch (e) {
        console.error("Failed to parse saved coupon:", e);
      }
    }
    
    const savedSameAsShipping = sessionStorage.getItem('checkoutSameAsShipping');
    if (savedSameAsShipping !== null) {
      setSameAsShipping(savedSameAsShipping === 'true');
    }
  }, [subtotal, authLoading]);

  // Calculate shipping fee based on state
  useEffect(() => {
    shippingApi.fetchShippingRules().then(setShippingRules).catch(console.error);
  }, []);

  const shippingState = watch("shippingState");
  useEffect(() => {
    if (shippingState && shippingRules.length > 0 && !authLoading) {
      const normalizedState = shippingState.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_');
      const rule = shippingRules.find(r => r.state === normalizedState);
      setShippingFee(rule ? rule.flatShippingRate : 0);
    }
  }, [shippingState, shippingRules, authLoading]);

  // Track billing address changes to show save button
  const billingFullName = watch("billingFullName");
  const billingMobile = watch("billingMobile");
  const billingAddressLine = watch("billingAddressLine");
  const billingLandmark = watch("billingLandmark");
  const billingCity = watch("billingCity");
  const billingState = watch("billingState");
  const billingPincode = watch("billingPincode");

  useEffect(() => {
    // Only track if billing address section is open (not same as shipping)
    if (!sameAsShipping) {
      // Check if any billing field has a value (indicating edits)
      const hasBillingValues = billingFullName || billingMobile || billingAddressLine || billingLandmark || billingCity || billingState || billingPincode;
      if (hasBillingValues) {
        setBillingEdited(true);
      }
    }
  }, [billingFullName, billingMobile, billingAddressLine, billingLandmark, billingCity, billingState, billingPincode, sameAsShipping]);

  const total = Math.max(0, subtotal - discount + (shippingFee || 0));

  // Scroll to top when order is placed
  useEffect(() => {
    if (placed) {
      window.scrollTo(0, 0);
    }
  }, [placed]);

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
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto shadow-lg shadow-[#16A34A]/20"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Check size={36} strokeWidth={3} />
          </motion.div>
        </motion.div>
        <h1 className="font-display text-4xl mt-6">Order Confirmed!</h1>
        <p className="text-neutral-600 mt-3">
          Thank you for choosing Daily Kurtis. Your order <span className="font-medium text-[#800000]">#{placedOrderId || "Confirmed"}</span> has been placed successfully.
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => nav("/orders")}>View Orders</Button>
          <Button variant="outline" onClick={() => nav("/shop")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const applyCoupon = async () => {
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
      const result = await couponApi.validateCoupon(user.token, coupon, subtotal, shippingFee, 0, cartItems);
      const d = Math.round(result.discount);
      setDiscount(d);
      setAppliedCode(result.coupon.code);
      sessionStorage.setItem('appliedCoupon', JSON.stringify({
        code: result.coupon.code,
        discount: d,
        subtotal: subtotal,
        shipping: shippingFee
      }));
      toast.success(`Coupon applied! You saved ${formatINR(d)}`);
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      sessionStorage.removeItem('appliedCoupon');
      const errorMsg = err?.message || "Invalid coupon";
      if (errorMsg.toLowerCase().includes('expired')) {
        toast.error("Coupon has expired");
      } else if (errorMsg.toLowerCase().includes('used') || errorMsg.toLowerCase().includes('already')) {
        toast.error("Coupon already used");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    sessionStorage.setItem('checkoutSameAsShipping', String(checked));
    
    if (checked) {
      // Copy shipping address to billing
      setValue('billingFullName', watch('shippingFullName') || '');
      setValue('billingMobile', watch('shippingMobile') || '');
      setValue('billingAddressLine', watch('shippingAddressLine') || '');
      setValue('billingLandmark', watch('shippingLandmark') || '');
      setValue('billingCity', watch('shippingCity') || '');
      setValue('billingState', watch('shippingState') || '');
      setValue('billingPincode', watch('shippingPincode') || '');
    } else {
      // Reset edited state when switching to manual billing
      setBillingEdited(false);
    }
  };

  const saveBillingAddress = async () => {
    // The billing address is saved locally for this order only
    // Since there's no separate billing address API, we don't persist it to the backend
    setBillingEdited(false);
    toast.success("Billing address updated for this order");
  };

  const onSubmit = async (data) => {
    try {
      // Validate pincode (6 digits)
      if (!/^\d{6}$/.test(data.shippingPincode)) {
        toast.error("Please enter a valid 6-digit pincode");
        return;
      }

      // Validate mobile (10 digits)
      if (data.shippingMobile && !/^\d{10}$/.test(data.shippingMobile)) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }

      if (user?.token) {
        // Save shipping address
        const shippingAddr = {
          name: data.shippingFullName,
          addressLine: data.shippingAddressLine,
          landmark: data.shippingLandmark,
          city: data.shippingCity,
          state: data.shippingState,
          pincode: data.shippingPincode,
          mobile: data.shippingMobile,
        };
        await updateShippingAddress(user.token, shippingAddr);
      }

      const orderData = {
        subtotal: String(subtotal),
        deliveryFee: String(shippingFee),
        discount: String(discount),
        total: String(total),
        paymentMethod: payment,
        shippingAddress: {
          fullName: data.shippingFullName,
          addressLine1: data.shippingAddressLine,
          landmark: data.shippingLandmark || '',
          city: data.shippingCity,
          state: data.shippingState,
          pincode: data.shippingPincode,
          mobile: data.shippingMobile,
        },
        billingAddress: sameAsShipping ? null : {
          fullName: data.billingFullName,
          addressLine1: data.billingAddressLine,
          landmark: data.billingLandmark || '',
          city: data.billingCity,
          state: data.billingState,
          pincode: data.billingPincode,
          mobile: data.billingMobile,
        },
        deliveryOption: { name: "Standard Delivery", fee: shippingFee }
      };

      const res = await orderApi.createOrder(user.token, orderData);
      
      sessionStorage.removeItem('appliedCoupon');
      sessionStorage.removeItem('checkoutSameAsShipping');
      clearCart();
      setPlacedOrderId(res.id);
      setPlaced(true);
      toast.success("Order placed successfully!");
    } catch (e) {
      const errorMsg = e?.response?.message || e?.message || "Failed to place order";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => nav(-1)} className="text-sm text-neutral-500 inline-flex items-center gap-1.5 hover:text-[#800000]">
        <ChevronLeft size={14} /> Back to Cart
      </button>

      <div className="mt-6 grid lg:grid-cols-[1fr_400px] gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Step 1 - Shipping Address */}
          <Step n="01" title="Shipping Address" sub="Where should we deliver your order?">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.shippingFullName?.message}>
                <input className="input" {...register("shippingFullName", { required: "Required" })} placeholder="Enter full name" />
              </Field>
              <Field label="Mobile">
                <input 
                  className="input" 
                  {...register("shippingMobile")} 
                  placeholder="Mobile number" 
                  type="tel"
                  readOnly
                />
              </Field>
              <Field label="Address Line" full error={errors.shippingAddressLine?.message}>
                <input className="input" {...register("shippingAddressLine", { required: "Required" })} placeholder="House/Flat No., Building Name, Street" />
              </Field>
              <Field label="Landmark (Optional)" error={errors.shippingLandmark?.message}>
                <input className="input" {...register("shippingLandmark")} placeholder="Near hospital/school etc." />
              </Field>
              <Field label="City" error={errors.shippingCity?.message}>
                <input className="input" {...register("shippingCity", { required: "Required" })} />
              </Field>
              <Field label="State" error={errors.shippingState?.message}>
                <select 
                  className="input"
                  {...register("shippingState", { required: "Required" })}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </Field>
              <Field label="Pincode" error={errors.shippingPincode?.message}>
                <input className="input" {...register("shippingPincode", { required: "Required" })} placeholder="Pincode" maxLength="6" />
              </Field>
            </div>
          </Step>

          {/* Step 2 - Billing Address */}
          <Step n="02" title="Billing Address" sub="Billing address for this order">
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                  className="w-4 h-4 text-[#800000] border-[#E9E5E5] rounded focus:ring-[#800000]"
                />
                <span className="text-sm text-neutral-700">Billing Address is the same as Shipping Address</span>
              </label>
            </div>

            {sameAsShipping ? (
              <div className="p-4 bg-[#FAF6F4] rounded-xl border border-[#E9E5E5]">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Shipping Address (used as billing)</p>
                <p className="text-sm font-medium text-[#1c1c1c]">
                  {watch("shippingFullName") || "Not set"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {watch("shippingAddressLine") || ""}<br />
                  {watch("shippingCity") || ""}, {watch("shippingState") || ""} - {watch("shippingPincode") || ""}
                </p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" error={errors.billingFullName?.message}>
                    <input className="input" {...register("billingFullName", { required: "Required" })} placeholder="Enter full name" />
                  </Field>
                  <Field label="Mobile" error={errors.billingMobile?.message}>
                    <input className="input" {...register("billingMobile")} placeholder="Mobile number" type="tel" />
                  </Field>
                  <Field label="Address Line" full error={errors.billingAddressLine?.message}>
                    <input className="input" {...register("billingAddressLine", { required: "Required" })} placeholder="House/Flat No., Building Name, Street" />
                  </Field>
                  <Field label="Landmark (Optional)" error={errors.billingLandmark?.message}>
                    <input className="input" {...register("billingLandmark")} placeholder="Near hospital/school etc." />
                  </Field>
                  <Field label="City" error={errors.billingCity?.message}>
                    <input className="input" {...register("billingCity", { required: "Required" })} />
                  </Field>
                  <Field label="State" error={errors.billingState?.message}>
                    <select 
                      className="input"
                      {...register("billingState", { required: "Required" })}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Pincode" error={errors.billingPincode?.message}>
                    <input className="input" {...register("billingPincode", { required: "Required" })} placeholder="Pincode" maxLength="6" />
                  </Field>
                </div>
                {billingEdited && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={saveBillingAddress}
                      disabled={savingBilling}
                      className="px-5 py-2.5 bg-[#800000] text-white rounded-full text-sm font-medium disabled:opacity-70 hover:bg-[#600000] transition"
                    >
                      {savingBilling ? "Saving..." : "Save Billing Address"}
                    </button>
                  </div>
                )}
              </>
            )}
          </Step>

          {/* Step 3 - Payment */}
          <Step n="03" title="Payment Method" sub="Select your preferred way to pay.">
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

          {!appliedCode && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Promo Code</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full h-10 pl-9 pr-3 rounded-full border border-[#E9E5E5] text-sm outline-none focus:border-[#800000] uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={validating || !coupon.trim()}
                  className="h-10 px-4 rounded-full bg-[#FFF8F8] border border-[#E9E5E5] text-sm font-medium text-[#800000] hover:bg-[#f5e7e7] disabled:opacity-50"
                >
                  {validating ? "..." : "Apply"}
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-[#E9E5E5] mt-5 pt-5 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span>Coupon ({appliedCode})</span><span className="text-[#16A34A] font-medium">- {formatINR(discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span className={shippingFee === 0 ? "text-[#16A34A]" : ""}>{shippingFee === null ? "Loading..." : (shippingFee === 0 ? "Free" : formatINR(shippingFee))}</span></div>
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