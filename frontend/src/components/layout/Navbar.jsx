import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronRight, Phone, Mail, Shield, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import Logo from "../ui/Logo";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { CATEGORY_LIST } from "../../data/products";

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
  const catTimer = useRef(null);

  // Login modal state
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginStep, setLoginStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);

  const { totalQuantity } = useCart();
  const { items: wish } = useWishlist();
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
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

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

  const resetLogin = () => {
    setLoginStep("mobile");
    setMobile("");
    setOtp(["", "", "", ""]);
    setOtpSent(false);
    setResendTimer(0);
    setIsLoading(false);
  };

  const closeLogin = () => {
    setLoginOpen(false);
    resetLogin();
  };

  const sendOtp = async () => {
    if (mobile.length !== 10) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setOtpSent(true);
    setLoginStep("otp");
    setResendTimer(180);
    toast.success("OTP sent to +91 " + mobile);
    setIsLoading(false);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtp(["", "", "", ""]);
    setResendTimer(180);
    toast.success("OTP resent to +91 " + mobile);
    setIsLoading(false);
    otpRefs.current[0]?.focus();
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < 4) next.push("");
    setOtp(next);
    const lastIndex = Math.min(pasted.length, 4) - 1;
    otpRefs.current[lastIndex >= 0 ? lastIndex : 0]?.focus();
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 4) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (code === "1234") {
      toast.success("Welcome back! ✨");
      closeLogin();
      navigate("/profile");
    } else {
      toast.error("Invalid OTP. Please try again");
      setOtp(["", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#800000] text-white text-[11px] sm:text-xs tracking-wider uppercase py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="opacity-90">Free shipping on orders over ₹1,499 · Use code </span>
          <span className="font-semibold text-[#D4AF37]">DAILY10</span>
          <span className="opacity-90"> for 10% off your first order</span>
          <span className="opacity-30 mx-4">✦</span>
          <span className="opacity-90">Free shipping on orders over ₹1,499 · Use code </span>
          <span className="font-semibold text-[#D4AF37]">DAILY10</span>
          <span className="opacity-90"> for 10% off your first order</span>
          <span className="opacity-30 mx-4">✦</span>
          <span className="opacity-90">Free shipping on orders over ₹1,499 · Use code </span>
          <span className="font-semibold text-[#D4AF37]">DAILY10</span>
          <span className="opacity-90"> for 10% off your first order</span>
        </div>
      </div>

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
                              {CATEGORY_LIST.map((cat) => (
                                <Link
                                  key={cat}
                                  to={`/shop?category=${encodeURIComponent(cat)}`}
                                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[#1c1c1c] hover:bg-[#FAF6F4]"
                                >
                                  <span>{cat}</span>
                                  <ChevronRight size={14} className="text-neutral-400" />
                                </Link>
                              ))}
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
              <button onClick={() => setLoginOpen(true)} className="p-2 hover:text-[#D4AF37] transition hidden sm:inline-flex" aria-label="Login">
                <User size={19} />
              </button>
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
                  >
                    {l.label}
                    <ChevronRight size={16} className="text-neutral-400" />
                  </Link>
                ))}
                <button onClick={() => { setOpen(false); setLoginOpen(true); }} className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC] w-full text-left">
                  Login <ChevronRight size={16} className="text-neutral-400" />
                </button>
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

      {/* Modern Premium Login Modal */}
      <AnimatePresence>
        {loginOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={closeLogin}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative bg-[#FAF6F4] px-8 pt-8 pb-6">
                  <button
                    onClick={closeLogin}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-[#F1ECEC] flex items-center justify-center text-neutral-500 hover:text-[#800000] transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E9E5E5] flex items-center justify-center">
                      <User size={20} className="text-[#800000]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1c1c1c]">
                        {loginStep === "mobile" ? "Welcome Back" : "Verify OTP"}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {loginStep === "mobile"
                          ? "Sign in to your account"
                          : `Code sent to +91 ${mobile}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6">
                  <AnimatePresence mode="wait">
                    {loginStep === "mobile" ? (
                      <motion.div
                        key="mobile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Mobile Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-[#D4AF37] font-medium text-sm">+91</span>
                            </div>
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              value={mobile}
                              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                              placeholder="98765 43210"
                              autoFocus
                              className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5">
                            We'll send a 4-digit OTP for verification
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={mobile.length < 10 || isLoading}
                          onClick={sendOtp}
                          className="relative w-full h-12 rounded-xl bg-[#D4AF37] text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b8932c] active:scale-[0.98] transition-all duration-300"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            "Continue"
                          )}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="otp"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-3 text-center">
                            Enter verification code
                          </label>
                          <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                              <div key={i} className="relative">
                                <input
                                  ref={(el) => (otpRefs.current[i] = el)}
                                  type="tel"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(i, e.target.value)}
                                  onKeyDown={(e) => {
                                    handleOtpKeyDown(i, e);
                                    if (e.key === "Enter") verifyOtp();
                                  }}
                                  autoFocus={i === 0}
                                  className="w-14 h-14 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-center text-xl font-semibold text-gray-900 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 focus:bg-white transition-all duration-300"
                                />
                                <Mail size={14} className="absolute -top-1 -right-1 text-[#D4AF37] bg-white rounded-full" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginStep("mobile");
                              setOtp(["", "", "", ""]);
                              setResendTimer(0);
                            }}
                            className="text-sm text-gray-500 hover:text-[#800000] transition-colors"
                          >
                            ← Change number
                          </button>
                          <button
                            type="button"
                            disabled={resendTimer > 0 || isLoading}
                            onClick={resendOtp}
                            className="text-sm font-medium text-[#D4AF37] disabled:text-gray-400 disabled:cursor-not-allowed hover:text-[#b8932c] transition-colors"
                          >
                            {resendTimer > 0 ? (
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <svg className="animate-spin h-3.5 w-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resend OTP in {formatTime(resendTimer)}
                              </span>
                            ) : (
                              "Resend OTP"
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={otp.join("").length < 4 || isLoading}
                          onClick={verifyOtp}
                          className="relative w-full h-12 rounded-xl bg-[#D4AF37] text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b8932c] active:scale-[0.98] transition-all duration-300"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </span>
                          ) : (
                            "Verify & Continue"
                          )}
                        </button>

                        <p className="text-xs text-center text-gray-400">
                          Demo OTP: <span className="font-mono font-semibold text-[#800000]">1234</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom accent */}
                <div className="h-0.5 bg-gradient-to-r from-[#E9E5E5] via-[#D4AF37] to-[#E9E5E5]" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}