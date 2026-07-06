import { Star } from "lucide-react";

export default function Rating({
  value,
  size = 14,
  showValue = false,
  className = "",
}) {
  // Handle null/undefined values gracefully
  const safeValue = value ?? 0;
  const roundedValue = Math.round(safeValue);
  
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= roundedValue;
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
      {showValue && typeof safeValue === 'number' && (
        <span className="text-xs text-neutral-500 ml-1">{safeValue.toFixed(1)}</span>
      )}
    </div>
  );
}