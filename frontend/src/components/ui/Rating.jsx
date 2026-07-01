import { Star } from "lucide-react";

export default function Rating({
  value,
  size = 14,
  showValue = false,
  className = "",
}) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              strokeWidth={1.6}
              className={filled ? "fill-[#D4AF37] text-[#D4AF37]" : "text-neutral-300"}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-neutral-500 ml-1">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
