import Button from "./Button";
import { Link } from "react-router-dom";

export default function Empty({
  icon,
  title,
  subtitle,
  cta,
  ctaTo = "/shop",
}) {
  return (
    <div className="text-center py-20 px-6">
      {icon && (
        <div className="mx-auto w-20 h-20 rounded-full bg-[#FFF8F8] text-[#800000] flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h2 className="font-display text-2xl sm:text-3xl text-[#1c1c1c]">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">{subtitle}</p>}
      {cta && (
        <Link to={ctaTo} className="inline-block mt-7">
          <Button>{cta}</Button>
        </Link>
      )}
    </div>
  );
}
