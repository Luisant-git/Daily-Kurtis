import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const variants = {
  primary:
    "bg-[#800000] text-white hover:bg-[#5c0000] shadow-[0_8px_24px_-12px_rgba(128,0,0,0.6)]",
  secondary:
    "bg-[#FFF8F8] text-[#800000] hover:bg-[#f5e7e7] border border-[#E9E5E5]",
  outline:
    "bg-transparent text-[#800000] border border-[#800000] hover:bg-[#800000] hover:text-white",
  ghost:
    "bg-transparent text-[#333] hover:bg-[#FAF6F4]",
  gold:
    "bg-[#D4AF37] text-white hover:bg-[#b8932c] shadow-[0_8px_24px_-12px_rgba(212,175,55,0.7)]",
};

const sizes = {
  sm: "h-9 px-4 text-xs tracking-wider uppercase",
  md: "h-11 px-6 text-sm tracking-wider uppercase",
  lg: "h-14 px-8 text-sm tracking-[0.2em] uppercase",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
