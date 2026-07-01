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
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 m-auto w-32 h-32 sm:w-44 sm:h-44 text-[#D4AF37]"
          >
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M60 70 Q100 30 140 70 L140 160 Q100 180 60 160 Z" />
              <path d="M100 50 Q90 60 90 70 Q100 80 110 70 Q110 60 100 50 Z" />
              <path d="M75 90 Q100 80 125 90" />
              <path d="M75 110 Q100 100 125 110" />
              <path d="M75 130 Q100 120 125 130" />
            </g>
          </svg>
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl mt-4">This kurthi is missing</h1>
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
