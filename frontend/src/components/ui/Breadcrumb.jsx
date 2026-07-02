import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items, variant = "dark" }) {
  const baseText = variant === "light" ? "text-white/70" : "text-neutral-500";
  const linkText = variant === "light" ? "hover:text-white" : "hover:text-[#800000]";
  const activeText = variant === "light" ? "text-white font-medium" : "text-[#1c1c1c] font-medium";

  return (
    <nav className={`flex items-center flex-wrap gap-1.5 text-xs ${baseText}`}>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className={linkText}>{item.label}</Link>
          ) : (
            <span className={activeText}>{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={12} />}
        </span>
      ))}
    </nav>
  );
}
