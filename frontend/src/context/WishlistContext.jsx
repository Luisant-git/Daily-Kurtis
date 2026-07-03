import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const WishlistCtx = createContext(null);
const KEY = "dk_wishlist_v1";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const { isLoggedIn, openLoginModal } = useAuth();

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (p, options = {}) => {
    const { showToast = true } = options;
    const toastId = "wishlist-toast";

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    const exists = items.some((x) => x.id === p.id);
    const nextItems = exists ? items.filter((x) => x.id !== p.id) : [...items, p];

    setItems(nextItems);

    if (!showToast) return;

    toast.dismiss(toastId);
    if (exists) {
      toast("Removed from wishlist", { id: toastId, icon: "💔" });
    } else {
      toast.success("Saved to wishlist", { id: toastId });
    }
  };

  const has = (id) => items.some((x) => x.id === id);
  const remove = (id) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setItems((p) => p.filter((x) => x.id !== id));
  };
  const clear = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setItems([]);
  };

  return (
    <WishlistCtx.Provider value={{ items, toggle, has, remove, clear }}>
      {children}
    </WishlistCtx.Provider>
  );
}

export const useWishlist = () => {
  const v = useContext(WishlistCtx);
  if (!v) throw new Error("useWishlist must be inside WishlistProvider");
  return v;
};
