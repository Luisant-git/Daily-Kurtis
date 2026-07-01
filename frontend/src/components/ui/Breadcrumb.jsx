import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className="hover:text-[#800000]">{item.label}</Link>
          ) : (
            <span className="text-[#1c1c1c] font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={12} />}
        </span>
      ))}
    </nav>
  );
}
