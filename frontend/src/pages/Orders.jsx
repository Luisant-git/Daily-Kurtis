import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle2, ChevronDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Breadcrumb from "../components/ui/Breadcrumb";
import { formatINR } from "../components/ui/Price";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

const STATUS_COLORS = {
  Delivered: "bg-[#16A34A]/10 text-[#16A34A]",
  Shipped: "bg-[#D4AF37]/15 text-[#b8932c]",
  Processing: "bg-[#800000]/10 text-[#800000]",
  Pending: "bg-[#800000]/10 text-[#800000]",
  Placed: "bg-[#800000]/10 text-[#800000]",
  Cancelled: "bg-[#991B1B]/10 text-[#991B1B]",
};

const STATUS_ICONS = {
  Delivered: CheckCircle2,
  Shipped: Truck,
  Processing: Package,
  Pending: Package,
  Placed: Package,
  Cancelled: Package,
};

const formatOrderDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatAddress = (address) => {
  if (!address) return "No shipping address saved.";
  const lines = [
    address.fullName || address.name,
    address.addressLine1 || address.addressLine,
    address.landmark,
    [address.city, address.state].filter(Boolean).join(", "),
    address.pincode,
  ];
  return lines.filter(Boolean).join(" · ");
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await authApi.fetchOrders(user.token);
        setOrders(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error(error);
        toast.error("Could not load your orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.token]);

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Orders" }]} />
          <h1 className="font-display text-3xl sm:text-4xl mt-3">My Orders</h1>
          <p className="text-sm text-neutral-600 mt-2">Track and review your past orders.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        {loading ? (
          <div className="bg-white border border-[#E9E5E5] rounded-2xl p-8 text-center text-sm text-neutral-500">Loading your orders...</div>
        ) : !user?.token ? (
          <div className="bg-white border border-[#E9E5E5] rounded-2xl p-8 text-center text-sm text-neutral-500">Please log in to view your orders.</div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#E9E5E5] rounded-2xl p-8 text-center text-sm text-neutral-500">You do not have any orders yet.</div>
        ) : (
          orders.map((o) => {
            const Icon = STATUS_ICONS[o.status] || Package;
            const isOpen = open === o.id;
            const items = (o.items || []).filter(Boolean);
            const displayItems = items.slice(0, 2);
            return (
              <div key={o.id} className="bg-white border border-[#E9E5E5] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  className="w-full p-5 sm:p-6 flex items-center gap-4 text-left hover:bg-[#FAF6F4] transition"
                >
                  <div className="flex -space-x-3">
                    {displayItems.map((p) => (
                      <img
                        key={p.id || p.name}
                        src={p?.imageUrl || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white"
                        alt=""
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base sm:text-lg">Order #{o.id}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${STATUS_COLORS[o.status] || STATUS_COLORS.Placed}`}>
                        <Icon size={11} /> {o.status || "Placed"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{items.length} items · {formatOrderDate(o.createdAt)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="font-semibold text-[#800000]">{formatINR(Number(o.total || 0))}</p>
                    <p className="text-[11px] text-neutral-500">Total paid</p>
                  </div>
                  <ChevronDown size={18} className={`transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-[#E9E5E5] p-5 sm:p-6 grid lg:grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Items</p>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.id || item.name} className="flex gap-3">
                                <img
                                  src={item?.imageUrl || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"}
                                  className="w-14 aspect-[4/5] object-cover rounded-lg"
                                  alt=""
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item?.name || "Product"}</p>
                                  <p className="text-xs text-neutral-500">Qty {item?.quantity || 1}</p>
                                </div>
                                <p className="text-sm font-semibold text-[#800000]">{formatINR(Number(item?.price || 0))}</p>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs uppercase tracking-wider text-neutral-500 mt-6 mb-2 flex items-center gap-1.5"><MapPin size={12} /> Shipping Address</p>
                          <p className="text-sm text-neutral-700">{formatAddress(o.shippingAddress)}</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-4">Order Summary</p>
                          <div className="space-y-2 text-sm text-neutral-700">
                            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(Number(o.subtotal || 0))}</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span><span>{formatINR(Number(o.deliveryFee || 0))}</span></div>
                            <div className="flex justify-between"><span>Discount</span><span>- {formatINR(Number(o.discount || 0))}</span></div>
                            <div className="flex justify-between font-semibold text-[#800000]"><span>Total</span><span>{formatINR(Number(o.total || 0))}</span></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
