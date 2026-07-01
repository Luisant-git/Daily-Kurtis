export const formatINR = (n) =>
  "₹" + n.toLocaleString("en-IN");

export default function Price({
  price,
  discountPrice,
  size = "md",
}) {
  const cls =
    size === "lg"
      ? { now: "text-2xl", was: "text-base" }
      : size === "sm"
      ? { now: "text-sm", was: "text-xs" }
      : { now: "text-base", was: "text-sm" };
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-semibold text-[#800000] ${cls.now}`}>
        {formatINR(discountPrice)}
      </span>
      {discountPrice < price && (
        <span className={`text-neutral-400 line-through ${cls.was}`}>
          {formatINR(price)}
        </span>
      )}
    </div>
  );
}
