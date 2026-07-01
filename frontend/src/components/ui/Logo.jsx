import { Link } from "react-router-dom";

export default function Logo({ variant = "dark" }) {
  const text = variant === "light" ? "text-white" : "text-[#800000]";
  const sub = variant === "light" ? "text-white/70" : "text-neutral-500";
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="relative inline-flex items-center justify-center w-10 h-10">
        <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
          <rect
            x="6"
            y="6"
            width="36"
            height="36"
            rx="6"
            transform="rotate(45 24 24)"
            stroke="currentColor"
            strokeWidth="2.2"
            className={variant === "light" ? "text-white" : "text-[#800000]"}
          />
          <path
            d="M18 24h12M24 18v12M19 19l10 10M29 19L19 29"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className={variant === "light" ? "text-white" : "text-[#D4AF37]"}
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-xl sm:text-2xl tracking-tight ${text}`}>
          Daily Kurtis
        </span>
        <span className={`text-[10px] sm:text-[11px] uppercase tracking-[0.2em] ${sub} mt-0.5`}>
          Ethnic · Elegant
        </span>
      </span>
    </Link>
  );
}
