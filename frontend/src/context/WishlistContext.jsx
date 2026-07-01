import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

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

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (p) => {
    setItems((prev) => {
      if (prev.find((x) => x.id === p.id)) {
        toast("Removed from wishlist", { icon: "💔" });
        return prev.filter((x) => x.id !== p.id);
      }
      toast.success("Saved to wishlist");
      return [...prev, p];
    });
  };

  const has = (id) => items.some((x) => x.id === id);
  const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const clear = () => setItems([]);

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
