import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronRight, Phone, Mail, Shield } from "lucide-react";
import { toast } from "react-toastify";
import Logo from "../ui/Logo";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { settingsApi } from "../../api/settings";
import { categoryApi } from "../../api/category";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/categories", label: "Categories" },
  { to: "/shop?filter=new", label: "New Arrivals" },
  { to: "/shop?filter=bestseller", label: "Top Selling" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [catHover, setCatHover] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const catTimer = useRef(null);

  const { totalQuantity } = useCart();
  const { items: wish } = useWishlist();
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSettings();
        if (data?.announcement) setAnnouncement(data.announcement);
      } catch (err) {
        // ignore
      }
    };
    fetchSettings();
  }, []);

  // Fetch categories from API for navbar dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getCategories();
        if (data && data.length > 0) {
          setDynamicCategories(data.map(c => c.name));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Split announcement by newlines and filter out empty lines
  const announcementParts = announcement.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const solid = true;
  const navTextColor = solid ? "text-[#333]" : "text-white";
  const headerBg = solid
    ? "bg-white/95 backdrop-blur border-b border-[#E9E5E5] shadow-sm"
    : "bg-transparent";

  const isLinkActive = (link) => {
    const pathname = location.pathname;
    const search = location.search;
    if (link.to === "/") return pathname === "/";
    if (link.to.startsWith("/shop")) {
      if (search.includes("filter=new")) return link.to.includes("filter=new");
      if (search.includes("filter=bestseller")) return link.to.includes("filter=bestseller");
      return pathname === "/shop";
    }
    return pathname === link.to;
  };

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
      {announcementParts.length > 0 && (
        <div className="bg-[#800000] text-white text-[11px] sm:text-xs tracking-wider py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap inline-flex items-center">
            {announcementParts.map((part, index) => (
              <span key={index} className="opacity-90">
                {index > 0 && <span className="mx-4">✦</span>}
                {part}
              </span>
            ))}
            <span className="opacity-90 mx-8">✦</span>
            {announcementParts.map((part, index) => (
              <span key={`dup-${index}`} className="opacity-90">
                {index > 0 && <span className="mx-4">✦</span>}
                {part}
              </span>
            ))}
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-40 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
            <button
              className={`lg:hidden p-2 -ml-2 ${navTextColor}`}
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

            <div className={`${solid ? "" : "[&_*]:text-white"}`}>
              <Logo variant={solid ? "dark" : "light"} />
            </div>

            <nav className="hidden lg:flex items-center gap-7">
              {LINKS.map((l) => {
                const isCat = l.label === "Categories";
                return (
                  <div
                    key={l.to}
                    className="relative"
                    onMouseEnter={() => {
                      if (isCat) {
                        clearTimeout(catTimer.current);
                        setCatHover(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isCat) {
                        catTimer.current = setTimeout(() => setCatHover(false), 80);
                      }
                    }}
                  >
                    <NavLink
                      to={l.to}
                      end={false}
                      className={() =>
                        `relative text-[13px] tracking-wide font-medium transition-colors ${
                          isLinkActive(l) ? "text-[#D4AF37]" : navTextColor + " hover:text-[#D4AF37]"
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>

                    {isCat && (
                      <AnimatePresence>
                        {catHover && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border border-[#E9E5E5] rounded-2xl shadow-xl z-50"
                            onMouseEnter={() => {
                              clearTimeout(catTimer.current);
                              setCatHover(true);
                            }}
                            onMouseLeave={() => {
                              catTimer.current = setTimeout(() => setCatHover(false), 80);
                            }}
                          >
                            <div className="p-2">
                              {dynamicCategories.length > 0 ? (
                                dynamicCategories.map((cat) => (
                                  <Link
                                    key={cat}
                                    to={`/shop?category=${encodeURIComponent(cat)}`}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[#1c1c1c] hover:bg-[#FAF6F4]"
                                  >
                                    <span>{cat}</span>
                                    <ChevronRight size={14} className="text-neutral-400" />
                                  </Link>
                                ))
                              ) : (
                                <p className="px-3 py-2 text-sm text-neutral-400">Loading categories...</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>

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
              {isLoggedIn ? (
                <Link to="/profile" state={{ from: location }} className="p-2 hover:text-[#D4AF37] transition hidden sm:inline-flex" aria-label="Profile">
                  <User size={19} />
                </Link>
              ) : (
                <Link to="/login" state={{ from: location }} className="p-2 hover:text-[#D4AF37] transition hidden sm:inline-flex" aria-label="Login">
                  <User size={19} />
                </Link>
              )}
            </div>
          </div>

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
                    aria-label="Close search"
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
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                    <ChevronRight size={16} className="text-neutral-400" />
                  </Link>
                ))}
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]" onClick={() => setOpen(false)}>
                      Profile <ChevronRight size={16} className="text-neutral-400" />
                    </Link>
                    <button onClick={logout} className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC] w-full text-left">
                      Logout <ChevronRight size={16} className="text-neutral-400" />
                    </button>
                  </>
                ) : (
                  <Link to="/login" state={{ from: location }} onClick={() => setOpen(false)} className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC] w-full text-left">
                    Login <ChevronRight size={16} className="text-neutral-400" />
                  </Link>
                )}
                <Link to="/wishlist" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]" onClick={() => setOpen(false)}>
                  Wishlist <ChevronRight size={16} className="text-neutral-400" />
                </Link>
                <Link to="/orders" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]" onClick={() => setOpen(false)}>
                  My Orders <ChevronRight size={16} className="text-neutral-400" />
                </Link>
                <Link to="/contact" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]" onClick={() => setOpen(false)}>
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