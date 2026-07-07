import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle2, ChevronDown, MapPin, CreditCard, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Breadcrumb from "../components/ui/Breadcrumb";
import { formatINR } from "../components/ui/Price";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/order";

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

function OrderTrackingPipeline({ order }) {
  let steps = [];
  
  if (order.status === "Cancelled") {
    steps = [
      {
        title: "Order Placed",
        desc: "We received your order.",
        active: true,
        completed: true,
        date: formatOrderDate(order.createdAt)
      },
      {
        title: "Cancelled",
        desc: order.cancelRemarks ? `Reason: ${order.cancelRemarks}` : "Your order has been cancelled.",
        active: true,
        completed: true,
        isAlert: true,
        date: formatOrderDate(order.updatedAt)
      }
    ];
  } else if (order.status === "CODReturn") {
    steps = [
      {
        title: "Order Placed",
        desc: "We received your order.",
        active: true,
        completed: true,
        date: formatOrderDate(order.createdAt)
      },
      {
        title: "Order Accepted & Processing",
        desc: "Your order was accepted and packed.",
        active: true,
        completed: true
      },
      {
        title: "Shipped",
        desc: order.trackingId ? `Shipped via ${order.courierName || 'Courier'}. ID: ${order.trackingId}` : "Order was shipped.",
        active: true,
        completed: true
      },
      {
        title: "Returned to Origin (COD Return)",
        desc: order.codReturnRemarks ? `Reason: ${order.codReturnRemarks}` : "Delivery failed; package returned.",
        active: true,
        completed: true,
        isAlert: true,
        date: formatOrderDate(order.updatedAt)
      }
    ];
  } else {
    steps = [
      {
        title: "Order Placed",
        desc: "We have received your order.",
        active: true,
        completed: ["Processing", "Accepted", "Shipped", "Delivered"].includes(order.status),
        date: formatOrderDate(order.createdAt)
      },
      {
        title: "Order Accepted & Processing",
        desc: "Your order is being packed and prepared.",
        active: ["Processing", "Accepted", "Shipped", "Delivered"].includes(order.status),
        completed: ["Shipped", "Delivered"].includes(order.status),
        date: (["Processing", "Accepted", "Shipped", "Delivered"].includes(order.status) && order.status !== "Placed" && order.status !== "Pending") ? formatOrderDate(order.updatedAt) : null
      },
      {
        title: "Shipped",
        desc: order.trackingId 
          ? `Dispatched via ${order.courierName || 'Courier Partner'}. Tracking ID: ${order.trackingId}` 
          : "Your order has been handed over to courier.",
        active: ["Shipped", "Delivered"].includes(order.status),
        completed: order.status === "Delivered",
        date: ["Shipped", "Delivered"].includes(order.status) ? formatOrderDate(order.updatedAt) : null,
        link: order.trackingLink
      },
      {
        title: "Delivered",
        desc: "Your package has been delivered successfully.",
        active: order.status === "Delivered",
        completed: order.status === "Delivered",
        date: order.status === "Delivered" ? formatOrderDate(order.updatedAt) : null
      }
    ];
  }

  return (
    <div className="bg-white border border-[#E9E5E5] rounded-2xl p-5 sm:p-6 mb-6">
      <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-6 font-semibold flex items-center gap-2">
        <Truck size={14} className="text-[#800000]" />
        Track Shipment
      </h4>
      <div className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          let dotColor = "#D1D5DB";
          let dotBorder = "#D1D5DB";
          let lineColor = "#E5E7EB";
          let textColor = "text-neutral-400";

          if (step.completed && !step.isAlert) {
            dotColor = "#16A34A";
            dotBorder = "#16A34A";
            lineColor = "#16A34A";
            textColor = "text-neutral-900";
          } else if (step.active && step.isAlert) {
            dotColor = "#DC2626";
            dotBorder = "#DC2626";
            lineColor = "#DC2626";
            textColor = "text-neutral-900";
          } else if (step.active) {
            dotColor = "#16A34A";
            dotBorder = "#16A34A";
            lineColor = "#16A34A";
            textColor = "text-neutral-900";
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative flex gap-5 pb-8 last:pb-0"
            >
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute left-[15px] top-[34px] bottom-0 w-[2px] bg-[#E5E7EB]" />
              )}
              {!isLast && (step.completed || (step.active && steps[index + 1]?.active)) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="absolute left-[15px] top-[34px] bottom-0 w-[2px] z-10"
                  style={{ backgroundColor: lineColor }}
                />
              )}

              {/* Dot */}
              <div className="relative z-20 shrink-0 mt-1">
                {step.completed && !step.isAlert ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: index * 0.1 }}
                    className="w-[30px] h-[30px] rounded-full bg-[#16A34A] flex items-center justify-center"
                  >
                    <CheckCircle2 size={16} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: index * 0.1 }}
                    className={`w-[30px] h-[30px] rounded-full border-[2.5px] flex items-center justify-center ${step.active ? 'shadow-md' : ''}`}
                    style={{ borderColor: dotBorder, backgroundColor: step.active ? '#fff' : '#F9FAFB' }}
                  >
                    {step.active && !step.completed && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-[10px] h-[10px] rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${textColor}`}>{step.title}</p>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{step.desc}</p>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#800000] hover:underline mt-2 font-medium"
                      >
                        Track Package <span className="text-[10px]">↗</span>
                      </a>
                    )}
                  </div>
                  {step.date && (
                    <span className="text-[10px] text-neutral-400 font-medium shrink-0 whitespace-nowrap">{step.date}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

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
        const response = await orderApi.fetchOrders(user.token);
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
                      <div className="border-t border-[#E9E5E5] p-5 sm:p-6">
                        <OrderTrackingPipeline order={o} />
                        <div className="grid lg:grid-cols-2 gap-8 mt-6">
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

                            {/* Payment Details */}
                            <div className="mt-5 pt-4 border-t border-[#E9E5E5]">
                              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5"><CreditCard size={12} /> Payment Details</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  {o.paymentMethod === 'cod' ? (
                                    <Banknote size={15} className="text-[#16A34A]" />
                                  ) : (
                                    <CreditCard size={15} className="text-[#D4AF37]" />
                                  )}
                                  <span className="text-neutral-700 capitalize font-medium">
                                    {o.paymentMethod === 'cod' ? 'Cash on Delivery' : o.paymentMethod === 'upi' ? 'UPI' : o.paymentMethod === 'card' ? 'Card' : o.paymentMethod || 'Online'}
                                  </span>
                                </div>
                                {o.paymentMethod !== 'cod' && o.razorpayPaymentId && (
                                  <p className="text-xs text-neutral-400 ml-6">
                                    Payment ID: {o.razorpayPaymentId}
                                  </p>
                                )}
                                {o.paymentMethod === 'cod' && Number(o.codFee || 0) > 0 && (
                                  <p className="text-xs text-neutral-400 ml-6">
                                    COD Fee: {formatINR(Number(o.codFee))}
                                  </p>
                                )}
                              </div>
                            </div>
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