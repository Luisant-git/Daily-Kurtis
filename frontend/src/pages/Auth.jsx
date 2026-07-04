import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";


export default function Auth() {
  const [loginStep, setLoginStep] = useState("mobile"); // "mobile", "register", "otp"
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const otpRefs = useRef([]);

  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const checkAndProceed = async (e) => {
    if (e) e.preventDefault();
    if (mobile.length !== 10) return;
    setIsLoading(true);
    try {
      const res = await authApi.requestOtp(mobile);
      setOtpSent(true);
      setResendTimer(180);
      toast.success("OTP sent to +91 " + mobile);
      if (res.isNewUser) {
        setIsNewUser(true);
        setLoginStep("register");
      } else {
        setIsNewUser(false);
        setLoginStep("otp");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = () => {
    setLoginStep("otp");
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
    if (e.key === "Enter") {
      verifyOtp();
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
      const response = await authApi.verifyOtp(mobile, code, regName.trim(), regEmail.trim());
      const userName = regName.trim() || response.user?.name || "";
      const userEmail = regEmail.trim() || response.user?.email || "";
      
      await login(mobile, userName, userEmail);
      
      navigate("/profile", { replace: true });
    } catch (error) {
      toast.error(error.message || "Invalid OTP. Please try again");
      setOtp(["", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex bg-[#FAF6F4]">


      {/* Auth Form */}
      <div className="w-full flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1c1c1c] tracking-tight">
              {loginStep === "mobile" ? "Welcome" : loginStep === "register" ? "Complete Profile" : "Verify Your Number"}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {loginStep === "mobile" 
                ? "Enter your mobile number to sign in or create an account" 
                : loginStep === "register"
                ? "Just a few more details to set up your account"
                : `We've sent a 4-digit code to +91 ${mobile}`}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-[#800000]/5 border border-[#E9E5E5]/50 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {loginStep === "mobile" ? (
                <motion.form
                  key="mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={checkAndProceed}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-2 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-[#D4AF37] font-bold text-sm select-none">
                        +91
                      </div>
                      <div className="absolute left-[3.25rem] top-1/2 -translate-y-1/2 w-px h-5 bg-neutral-200"></div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        placeholder="98765 43210"
                        autoFocus
                        className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={mobile.length < 10 || isLoading}
                    className="group relative w-full h-12 rounded-xl bg-[#800000] text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#6c0000] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#800000]/20 hover:shadow-[#800000]/30 flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Continuing...
                        </>
                      ) : (
                        "Continue Securely"
                      )}
                    </span>
                  </button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium pt-2">
                    <ShieldCheck size={14} className="text-green-600" />
                    Secure login powered by DailyKurtis
                  </div>
                </motion.form>
              ) : loginStep === "register" ? (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-2 uppercase tracking-wider">
                        Full Name (optional)
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Aditi Sharma"
                        className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-2 uppercase tracking-wider">
                        Email Address (optional)
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="aditi@example.com"
                        className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="w-full h-12 rounded-xl bg-[#800000] text-white font-semibold text-sm hover:bg-[#6c0000] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#800000]/20 mt-2"
                  >
                    Proceed to Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("mobile");
                      setOtp(["", "", "", ""]);
                      setResendTimer(0);
                    }}
                    className="w-full h-10 rounded-xl text-neutral-500 font-medium text-sm hover:text-[#800000] transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-4 text-center uppercase tracking-wider">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="tel"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          autoFocus={i === 0}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-neutral-200 bg-neutral-50/50 text-center text-xl sm:text-2xl font-bold text-neutral-900 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 focus:bg-white transition-all duration-300 shadow-sm"
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-center text-neutral-400 mt-6 bg-neutral-100/50 py-2 rounded-lg border border-neutral-100 w-fit mx-auto px-4">
                      Demo Mode: Use code <span className="font-mono font-bold text-[#800000] text-xs">1234</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={otp.join("").length < 4 || isLoading}
                    onClick={verifyOtp}
                    className="group relative w-full h-12 rounded-xl bg-[#D4AF37] text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#b8932c] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        "Verify & Sign In"
                      )}
                    </span>
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep("mobile");
                        setOtp(["", "", "", ""]);
                        setResendTimer(0);
                      }}
                      className="text-xs font-semibold text-neutral-500 hover:text-[#800000] transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft size={12} /> Change Number
                    </button>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isLoading}
                      onClick={resendOtp}
                      className="text-xs font-bold text-[#800000] disabled:text-neutral-400 disabled:cursor-not-allowed hover:text-[#6c0000] transition-colors"
                    >
                      {resendTimer > 0 ? (
                        <span className="flex items-center gap-1 font-medium text-neutral-500">
                          Resend in <span className="font-bold text-neutral-700">{formatTime(resendTimer)}</span>
                        </span>
                      ) : (
                        "Resend Code"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <p className="text-center text-[11px] text-neutral-400 max-w-xs mx-auto">
            By continuing, you agree to DailyKurtis's <Link to="/terms" className="text-neutral-600 hover:text-[#800000] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-neutral-600 hover:text-[#800000] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
