import { useState } from "react";
import { Package, Truck, CheckCircle2, ChevronDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import { PRODUCTS } from "../data/products.js";
import { formatINR } from "../components/ui/Price";

const DUMMY_ORDERS = [
  {
    id: "DK24891",
    date: "12 Mar 2026",
    status: "Delivered",
    total: 4250,
    items: [PRODUCTS[0], PRODUCTS[5]],
    address: "Linking Road, Mumbai 400052",
    timeline: [
      { label: "Order Placed", date: "08 Mar", done: true },
      { label: "Shipped", date: "09 Mar", done: true },
      { label: "Out for Delivery", date: "11 Mar", done: true },
      { label: "Delivered", date: "12 Mar", done: true },
    ],
  },
  {
    id: "DK24710",
    date: "28 Feb 2026",
    status: "Shipped",
    total: 1899,
    items: [PRODUCTS[2]],
    address: "Park Street, Kolkata 700016",
    timeline: [
      { label: "Order Placed", date: "26 Feb", done: true },
      { label: "Shipped", date: "27 Feb", done: true },
      { label: "Out for Delivery", date: "—", done: false },
      { label: "Delivered", date: "—", done: false },
    ],
  },
  {
    id: "DK24502",
    date: "12 Feb 2026",
    status: "Processing",
    total: 3199,
    items: [PRODUCTS[10], PRODUCTS[12]],
    address: "Whitefield, Bengaluru 560066",
    timeline: [
      { label: "Order Placed", date: "12 Feb", done: true },
      { label: "Shipped", date: "—", done: false },
      { label: "Out for Delivery", date: "—", done: false },
      { label: "Delivered", date: "—", done: false },
    ],
  },
];

const STATUS_COLORS = {
  Delivered: "bg-[#16A34A]/10 text-[#16A34A]",
  Shipped: "bg-[#D4AF37]/15 text-[#b8932c]",
  Processing: "bg-[#800000]/10 text-[#800000]",
};

const STATUS_ICONS = {
  Delivered: CheckCircle2,
  Shipped: Truck,
  Processing: Package,
};

export default function Orders() {
  const [open, setOpen] = useState(DUMMY_ORDERS[0].id);

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
        {DUMMY_ORDERS.map((o) => {
          const Icon = STATUS_ICONS[o.status];
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
                      src={p?.images?.[0] || p?.thumbnail || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white"
                      alt=""
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base sm:text-lg">Order #{o.id}</p>
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${STATUS_COLORS[o.status]}`}>
                      <Icon size={11} /> {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{items.length} items · {o.date}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-[#800000]">{formatINR(o.total)}</p>
                  <p className="text-[11px] text-neutral-500">Total paid</p>
                </div>
                <ChevronDown size={18} className={`transition ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-[#E9E5E5] p-5 sm:p-6 grid lg:grid-cols-2 gap-8">
                      {/* Items */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Items</p>
                        <div className="space-y-3">
                          {items.map((i) => (
                            <div key={i.id || i.name} className="flex gap-3">
                              <img
                                src={i?.images?.[0] || i?.thumbnail || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"}
                                className="w-14 aspect-[4/5] object-cover rounded-lg"
                                alt=""
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{i?.name || "Product"}</p>
                                <p className="text-xs text-neutral-500">{i?.category || "Curated item"}</p>
                              </div>
                              <p className="text-sm font-semibold text-[#800000]">{formatINR(i?.discountPrice || 0)}</p>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs uppercase tracking-wider text-neutral-500 mt-6 mb-2 flex items-center gap-1.5"><MapPin size={12} /> Shipping Address</p>
                        <p className="text-sm text-neutral-700">{o.address}</p>
                      </div>

                      {/* Timeline */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-4">Order Timeline</p>
                        <div className="relative pl-5">
                          <div className="absolute left-2 top-2 bottom-2 w-px bg-[#E9E5E5]" />
                          {o.timeline.map((t, idx) => (
                            <div key={idx} className="relative pb-5 last:pb-0">
                              <span className={`absolute -left-[14px] top-1 w-3 h-3 rounded-full ${t.done ? "bg-[#16A34A]" : "bg-[#E9E5E5]"} ring-4 ring-white`} />
                              <p className={`text-sm ${t.done ? "text-[#1c1c1c] font-medium" : "text-neutral-500"}`}>{t.label}</p>
                              <p className="text-xs text-neutral-500">{t.date}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
