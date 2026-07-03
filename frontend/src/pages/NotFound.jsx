import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-block"
        >
          <span className="font-display text-[140px] sm:text-[200px] leading-none text-[#800000]/10 select-none">
            404
          </span>
          
        </motion.div>
       
        <p className="text-neutral-600 mt-3">
          The page you're looking for doesn't exist or has moved. Let's get you back to the good stuff.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#800000] text-white text-sm uppercase tracking-wider hover:bg-[#5c0000] transition">
            <Home size={14} /> Back to Home
          </Link>
          <Link to="/shop" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-[#800000] text-[#800000] text-sm uppercase tracking-wider hover:bg-[#800000] hover:text-white transition">
            <ArrowLeft size={14} /> Shop Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
