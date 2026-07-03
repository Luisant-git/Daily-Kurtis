import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isLoggedIn, openLoginModal } = useAuth();

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const addToCart = (p, size, color, qty = 1, options = {}) => {
    const { showToast = true } = options;
    const toastId = "cart-toast";

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

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

    if (showToast) {
      toast.dismiss(toastId);
      toast.success(`${p.name} added to bag`, { id: toastId, duration: 1800 });
    }

    if (options.openDrawer !== false) {
      openDrawer();
    }
  };

  const removeFromCart = (id, size, color) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === id && i.size === size && i.color === color))
    );
    toast.dismiss("cart-toast");
    toast("Removed from bag", { id: "cart-toast", icon: "🗑️" });
  };

  const updateQty = (id, size, color, qty) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === id && i.size === size && i.color === color
            ? { ...i, quantity: Math.max(1, qty) }
            : i
        )
    );
  };

  const clearCart = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setItems([]);
  };

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
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        subtotal,
        totalQuantity,
        drawerOpen,
        openDrawer,
        closeDrawer,
      }}
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
