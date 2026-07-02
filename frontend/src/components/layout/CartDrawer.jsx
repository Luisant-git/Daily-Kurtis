import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Price from "../ui/Price";

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, closeDrawer, updateQty, removeFromCart } = useCart();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 min-w-[260px] w-[55vw] md:w-[45vw] lg:w-[35vw] max-w-md bg-white shadow-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#E9E5E5]">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500">Added to bag</p>
                <h2 className="text-xl sm:text-2xl font-display text-[#1c1c1c]">Your Cart</h2>
              </div>
              <button onClick={closeDrawer} className="p-1.5 sm:p-2 rounded-full text-neutral-600 hover:bg-[#FAF6F4]">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 sm:p-5 space-y-2 sm:space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <p className="text-lg font-medium">Your bag is empty</p>
                  <p className="text-sm mt-2">Add something nice to see it here.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="border border-[#E9E5E5] rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="flex flex-row gap-2 sm:gap-3 p-3 sm:p-4 items-start">
                      <img src={item.product.images?.[0] || item.product.thumbnail} alt={item.product.name} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-24 rounded-xl sm:rounded-2xl md:rounded-3xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                        <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-[0.2em]">{item.product.category}</p>
                        <h3 className="font-medium text-xs sm:text-sm text-[#1c1c1c] mt-0.5 line-clamp-2">{item.product.name}</h3>
                        <div className="mt-1.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500">
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-[#FAF6F4]">Size: {item.size}</span>
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-[#FAF6F4]">Color: {item.color}</span>
                        </div>
                        <div className="mt-2 sm:mt-4 flex items-center justify-between gap-2 sm:gap-3">
                          <div className="flex items-center rounded-full border border-[#E9E5E5] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQty(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="h-7 w-7 sm:h-9 sm:w-9 flex items-center justify-center text-neutral-600 hover:bg-[#FAF6F4]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="h-7 w-7 sm:h-9 sm:min-w-[36px] flex items-center justify-center text-xs sm:text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="h-7 w-7 sm:h-9 sm:w-9 flex items-center justify-center text-neutral-600 hover:bg-[#FAF6F4]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                            className="inline-flex items-center gap-1 text-[10px] sm:text-xs sm:text-sm text-neutral-500 hover:text-[#800000]"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[#E9E5E5] px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-neutral-500">Total</p>
                      <p className="font-semibold text-xs sm:text-sm text-[#1c1c1c]">₹{(item.product.discountPrice * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-3 sm:p-5 border-t border-[#E9E5E5] bg-[#FAF6F4]">
                <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1c1c1c]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
                  <Link to="/cart" className="block text-center rounded-full bg-[#800000] text-white py-2 sm:py-3 text-xs sm:text-sm font-medium">
                    View Bag
                  </Link>
                  <Link to="/checkout" className="block text-center rounded-full border border-[#800000] text-[#800000] py-2 sm:py-3 text-xs sm:text-sm font-medium">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
