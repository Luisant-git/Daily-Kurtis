import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const Ctx = createContext(null);

const KEY = "dk_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (p, size, color, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product.id === p.id && i.size === size && i.color === color
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product: p, size, color, quantity: qty }];
    });
    toast.success(`${p.name} added to bag`);
  };

  const removeFromCart = (id, size, color) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === id && i.size === size && i.color === color))
    );
    toast("Removed from bag", { icon: "🗑️" });
  };

  const updateQty = (id, size, color, qty) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === id && i.size === size && i.color === color
            ? { ...i, quantity: Math.max(1, qty) }
            : i
        )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.product.discountPrice * i.quantity, 0),
    [items]
  );
  const totalQuantity = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  return (
    <Ctx.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal, totalQuantity }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
};
