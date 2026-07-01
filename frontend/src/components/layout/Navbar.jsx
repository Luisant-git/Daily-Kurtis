import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronRight } from "lucide-react";
import Logo from "../ui/Logo";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/shop?filter=new", label: "New Arrivals" },
  { to: "/shop?filter=bestseller", label: "Best Sellers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalQuantity } = useCart();
  const { items: wish } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const solid = !isHome || scrolled;

  const navTextColor = solid ? "text-[#333]" : "text-white";
  const headerBg = solid
    ? "bg-white/95 backdrop-blur border-b border-[#E9E5E5] shadow-sm"
    : "bg-transparent";

  const submit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#800000] text-white text-[11px] sm:text-xs tracking-wider uppercase py-2 text-center">
        <span className="opacity-90">Free shipping on orders over ₹1,499 · Use code </span>
        <span className="font-semibold text-[#D4AF37]">DAILY10</span>
        <span className="opacity-90"> for 10% off your first order</span>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Mobile menu */}
            <button
              className={`lg:hidden p-2 -ml-2 ${navTextColor}`}
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo - left on mobile, left on desktop */}
            <div className={`${solid ? "" : "[&_*]:text-white"}`}>
              <Logo variant={solid ? "dark" : "light"} />
            </div>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-7">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `relative text-[13px] tracking-wide font-medium transition-colors ${
                      isActive ? "text-[#D4AF37]" : navTextColor + " hover:text-[#D4AF37]"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Icons */}
            <div className={`flex items-center gap-1 sm:gap-2 ${navTextColor}`}>
              <button
                aria-label="Search"
                className="p-2 hover:text-[#D4AF37] transition"
                onClick={() => setSearchOpen((s) => !s)}
              >
                <Search size={19} />
              </button>
              <Link to="/wishlist" className="p-2 hover:text-[#D4AF37] transition relative" aria-label="Wishlist">
                <Heart size={19} />
                {wish.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-white text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {wish.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 hover:text-[#D4AF37] transition relative" aria-label="Bag">
                <ShoppingBag size={19} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#800000] text-white text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="p-2 hover:text-[#D4AF37] transition hidden sm:inline-flex" aria-label="Profile">
                <User size={19} />
              </Link>
            </div>
          </div>

          {/* Inline search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={submit}
                className="overflow-hidden"
              >
                <div className="py-3 border-t border-[#E9E5E5]/60 flex items-center gap-3">
                  <Search size={18} className={solid ? "text-[#800000]" : "text-white"} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search kurthis, anarkalis, fabrics…"
                    className={`flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400 ${
                      solid ? "text-[#1c1c1c]" : "text-white placeholder:text-white/60"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className={solid ? "text-[#800000]" : "text-white"}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[84%] max-w-sm bg-white z-50 flex flex-col lg:hidden"
            >
              <div className="p-5 border-b border-[#E9E5E5] flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X size={22} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {LINKS.map((l) => (
                  <Link
                    to={l.to}
                    key={l.to}
                    className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC] hover:bg-[#FFF8F8]"
                  >
                    {l.label}
                    <ChevronRight size={16} className="text-neutral-400" />
                  </Link>
                ))}
                <Link to="/wishlist" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                  Wishlist <ChevronRight size={16} className="text-neutral-400" />
                </Link>
                <Link to="/orders" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                  My Orders <ChevronRight size={16} className="text-neutral-400" />
                </Link>
                <Link to="/profile" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                  Profile <ChevronRight size={16} className="text-neutral-400" />
                </Link>
                <Link to="/contact" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                  Contact <ChevronRight size={16} className="text-neutral-400" />
                </Link>
              </nav>
              <div className="p-5 border-t border-[#E9E5E5] text-xs text-neutral-500">
                Need help? <a href="mailto:care@dailykurtis.com" className="text-[#800000] font-medium">care@dailykurtis.com</a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
