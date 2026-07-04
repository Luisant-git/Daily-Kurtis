import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { wishlistApi } from "../api/wishlist";

const WishlistCtx = createContext(null);
const KEY = "dk_wishlist_v1";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn, openLoginModal } = useAuth();
  
  useEffect(() => {
    if (isLoggedIn && user?.token) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [isLoggedIn, user?.token]);

  const fetchWishlist = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const data = await wishlistApi.getWishlist(user.token);
      // Backend returns [{ id, userId, productId, product: { ... } }]
      setItems(data.map(w => w.product || w));
    } catch (e) {
      console.error('Failed to fetch wishlist', e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (p, options = {}) => {
    const { showToast = true } = options;
    const toastId = "wishlist-toast";

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    const exists = items.some((x) => x.id === p.id);
    const nextItems = exists ? items.filter((x) => x.id !== p.id) : [...items, p];
    
    // Optimistic update
    setItems(nextItems);

    try {
      if (exists) {
        await wishlistApi.removeFromWishlist(user.token, p.id);
      } else {
        await wishlistApi.addToWishlist(user.token, p.id);
      }
    } catch (e) {
      console.error("Failed to sync wishlist", e);
      // Rollback on error
      setItems(items);
    }

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
