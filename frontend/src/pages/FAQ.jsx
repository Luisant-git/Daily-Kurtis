import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import { FAQS } from "../data/site.js";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "FAQ" }]} />
          <div className="mt-4 flex items-center gap-3">
            <HelpCircle className="text-[#D4AF37]" />
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Frequently Asked</p>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2">How can we help?</h1>
          <p className="text-sm text-neutral-600 mt-3 max-w-xl">
            Find quick answers to common questions. Still need help? <a href="/contact" className="text-[#800000] underline">Reach us</a>.
          </p>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="bg-white border border-[#E9E5E5] rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#FAF6F4] transition"
            >
              <span className="font-display text-base sm:text-lg">{f.q}</span>
              <ChevronDown className={`shrink-0 transition ${open === i ? "rotate-180 text-[#800000]" : "text-neutral-400"}`} size={18} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm text-neutral-700 leading-relaxed">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>
    </div>
  );
}
