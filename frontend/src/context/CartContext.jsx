import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { cartApi } from "../api/cart";
import { mapApiProduct } from "../utils/productUtils";

const Ctx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isLoggedIn, openLoginModal } = useAuth();

  const fetchCart = async () => {
    if (!user?.token) return;
    try {
      const data = await cartApi.getCart(user.token);
      const mapped = data.map(item => {
        const mappedProduct = item.product ? mapApiProduct(item.product) : {
          id: item.productId,
          name: item.name,
          discountPrice: parseFloat(item.price),
          price: parseFloat(item.price),
          images: [item.imageUrl],
          thumbnail: item.imageUrl,
          slug: item.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + item.productId,
          category: ""
        };

        return {
          id: item.id,
          productId: item.productId,
          imageUrl: item.imageUrl,
          name: item.name,
          price: item.price,
          product: mappedProduct,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        };
      });
      setItems(mapped);
    } catch (e) {
      console.error("Failed to fetch cart:", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.token) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [isLoggedIn, user?.token]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const addToCart = async (p, size, color, qty = 1, options = {}) => {
    const { showToast = true } = options;
    const toastId = "cart-toast";

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    try {
      const itemData = {
        id: p.id,
        name: p.name,
        price: String(p.discountPrice || p.price || 0),
        imageUrl: p.images?.[0] || p.thumbnail || "",
        size,
        color,
        quantity: qty
      };
      
      await cartApi.addToCart(user.token, itemData);
      await fetchCart();

      if (showToast) {
        toast.dismiss(toastId);
        toast.success(`${p.name} added to bag`, { id: toastId, duration: 1800 });
      }

      if (options.openDrawer !== false) {
        openDrawer();
      }
    } catch (e) {
      toast.error(e.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (id, size, color) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    const item = items.find(i => i.product.id === id && i.size === size && i.color === color);
    if (!item) return;

    try {
      setItems(prev => prev.filter(i => i.id !== item.id));
      await cartApi.removeFromCart(user.token, item.id);
      toast.dismiss("cart-toast");
      toast("Removed from bag", { id: "cart-toast", icon: "🗑️" });
    } catch (e) {
      console.error("Failed to remove item:", e);
      fetchCart();
    }
  };

  const updateQty = async (id, size, color, qty) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    const item = items.find(i => i.product.id === id && i.size === size && i.color === color);
    if (!item) return;

    const newQty = Math.max(1, qty);

    try {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
      await cartApi.updateQuantity(user.token, item.id, newQty);
    } catch (e) {
      toast.error(e.message || "Failed to update quantity");
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    try {
      setItems([]);
      await cartApi.clearCart(user.token);
    } catch (e) {
      console.error("Failed to clear cart:", e);
      fetchCart();
    }
  };

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.product?.discountPrice || 0) * i.quantity, 0),
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
