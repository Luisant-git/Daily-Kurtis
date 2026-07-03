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

  const [loginStep, setLoginStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const otpRefs = useRef([]);

  const isMobileRegistered = () => {
    try {
      const registered = JSON.parse(localStorage.getItem("dk_registered_users") || "[]");
      return registered.includes(mobile);
    } catch {
      return false;
    }
  };

  const { totalQuantity } = useCart();
  const { items: wish } = useWishlist();
  const { isLoggedIn, user, login, logout, loginModalOpen, openLoginModal, closeLoginModal } = useAuth();
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
    setIsNewUser(false);
    setRegName("");
    setRegEmail("");
  };

  const closeLogin = () => {
    closeLoginModal();
    resetLogin();
  };

  const sendOtp = async () => {
    if (mobile.length !== 10) return;
    setIsLoading(true);
    try {
      // Call backend API to request OTP
      await authApi.requestOtp(mobile);
      if (!isMobileRegistered()) {
        setIsNewUser(true);
      }
      setOtpSent(true);
      setLoginStep("otp");
      setResendTimer(180);
      toast.success("OTP sent to +91 " + mobile);
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    try {
      // Call backend API to verify OTP and save user to database
      const response = await authApi.verifyOtp(mobile, code, regName.trim(), regEmail.trim());
      
      // Extract user data from response
      const userName = regName.trim() || response.user?.name || "";
      const userEmail = regEmail.trim() || response.user?.email || "";
      
      // Login with the returned token and user data
      await login(mobile, userName, userEmail);
      
      // Save to registered users list
      if (isNewUser) {
        toast.success("Account created successfully! ✨");
        try {
          const registered = JSON.parse(localStorage.getItem("dk_registered_users") || "[]");
          registered.push(mobile);
          localStorage.setItem("dk_registered_users", JSON.stringify(registered));
        } catch {
          // ignore
        }
      } else {
        toast.success("Welcome back! ✨");
      }
      
      closeLogin();
      navigate("/profile");
    } catch (error) {
      toast.error(error.message || "Invalid OTP. Please try again");
      setOtp(["", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-600">Hi, {user?.name || user?.mobile}</span>
                  <button onClick={handleLogout} className="text-xs text-[#800000] hover:underline">Logout</button>
                </div>
              ) : (
                <button onClick={openLoginModal} className="p-2 hover:text-[#D4AF37] transition hidden sm:inline-flex" aria-label="Login">
                  <User size={19} />
                </button>
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
                  >
                    {l.label}
                    <ChevronRight size={16} className="text-neutral-400" />
                  </Link>
                ))}
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                      Profile <ChevronRight size={16} className="text-neutral-400" />
                    </Link>
                    <button onClick={handleLogout} className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC] w-full text-left">
                      Logout <ChevronRight size={16} className="text-neutral-400" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setOpen(false); openLoginModal(); }} className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC] w-full text-left">
                    Login <ChevronRight size={16} className="text-neutral-400" />
                  </button>
                )}
                <Link to="/wishlist" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                  Wishlist <ChevronRight size={16} className="text-neutral-400" />
                </Link>
                <Link to="/orders" className="flex items-center justify-between px-5 py-4 text-[15px] border-b border-[#F1ECEC]">
                  My Orders <ChevronRight size={16} className="text-neutral-400" />
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

      {/* Auth Modal */}
      <AnimatePresence>
        {loginModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={closeLogin}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E9E5E5]">
                {/* Close button */}
                <button
                  onClick={closeLogin}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-neutral-500 hover:text-[#800000] transition-colors shadow-sm"
                >
                  <X size={18} />
                </button>

                {/* Modern gradient header */}
                <div className="relative bg-gradient-to-br from-[#800000] via-[#9B1B1B] to-[#5c0000] px-7 pt-9 pb-7 text-white overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  </div>
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Shield size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {loginStep === "mobile" ? (isNewUser ? "Create Account" : "Welcome Back") : "Verify OTP"}
                      </h3>
                      <p className="text-xs text-white/75 mt-0.5 font-medium">
                        {loginStep === "mobile"
                          ? isNewUser
                            ? "Register with your mobile number"
                            : "Sign in to your account"
                          : `Code sent to +91 ${mobile}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-7 py-7">
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
                        {/* Name and Email for new users */}
                        {!isMobileRegistered() && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="grid grid-cols-2 gap-3"
                          >
                            <div>
                              <label className="text-[11px] font-semibold text-gray-700 block mb-1.5 uppercase tracking-wider">
                                Name (optional)
                              </label>
                              <input
                                type="text"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-gray-700 block mb-1.5 uppercase tracking-wider">
                                Email (optional)
                              </label>
                              <input
                                type="email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400"
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Mobile Input */}
                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-1.5 uppercase tracking-wider">
                            Mobile Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <span className="text-[#D4AF37] font-bold text-sm">+91</span>
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
                              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                            <Phone size={11} />
                            {isMobileRegistered()
                              ? "Enter your registered mobile number"
                              : "We'll send a 4-digit OTP for verification"}
                          </p>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          disabled={mobile.length < 10 || isLoading}
                          onClick={sendOtp}
                          className="relative w-full h-11 rounded-lg bg-[#800000] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5c0000] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </span>
                          ) : isMobileRegistered() ? (
                            "Get OTP"
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
                        {/* OTP Input */}
                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-3 text-center uppercase tracking-wider">
                            Enter verification code
                          </label>
                          <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
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
                                  className="w-14 h-14 rounded-lg border-2 border-gray-200 bg-gray-50/50 text-center text-lg font-bold text-gray-900 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 focus:bg-white transition-all duration-200"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-center text-gray-400 mt-5">
                            Demo OTP: <span className="font-mono font-bold text-[#800000] text-xs">1234</span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginStep("mobile");
                              setOtp(["", "", "", ""]);
                              setResendTimer(0);
                            }}
                            className="text-xs font-medium text-gray-500 hover:text-[#800000] transition-colors"
                          >
                            ← Change number
                          </button>
                          <button
                            type="button"
                            disabled={resendTimer > 0 || isLoading}
                            onClick={resendOtp}
                            className="text-xs font-semibold text-[#D4AF37] disabled:text-gray-400 disabled:cursor-not-allowed hover:text-[#b8932c] transition-colors"
                          >
                            {resendTimer > 0 ? (
                              <span className="flex items-center gap-1 text-gray-500">
                                <svg className="animate-spin h-3.5 w-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {formatTime(resendTimer)}
                              </span>
                            ) : (
                              "Resend OTP"
                            )}
                          </button>
                        </div>

                        {/* Verify Button */}
                        <button
                          type="button"
                          disabled={otp.join("").length < 4 || isLoading}
                          onClick={verifyOtp}
                          className="relative w-full h-11 rounded-lg bg-[#D4AF37] text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b8932c] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg mt-4"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </span>
                          ) : (
                            "Verify & Continue"
                          )}
                        </button>
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