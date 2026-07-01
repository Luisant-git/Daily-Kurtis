import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img src="/logo.png" alt="Daily Kurtis" className="h-28 sm:h-36 w-64 sm:w-80 object-contain" />
    </Link>
  );
}