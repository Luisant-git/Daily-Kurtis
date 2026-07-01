import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) {
  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col gap-3 ${alignCls} ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-[#D4AF37] font-medium">
          <span className="block w-6 h-px bg-[#D4AF37]/60" />
          {eyebrow}
          <span className="block w-6 h-px bg-[#D4AF37]/60" />
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1c1c1c] font-medium leading-tight max-w-3xl text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
