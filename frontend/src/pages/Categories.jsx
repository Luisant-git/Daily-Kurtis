import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import SectionHeading from "../components/ui/SectionHeading";
import { CATEGORY_LIST, PRODUCTS } from "../data/products.js";

const CAT_IMAGES = {
  "Cotton Kurthis": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  "Printed Kurthis": "https://images.unsplash.com/photo-1631233859262-0d7f6c895a3c?auto=format&fit=crop&w=900&q=80",
  "Casual Wear": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
  "Office Wear": "https://images.unsplash.com/photo-1623625434462-e5e42318ae49?auto=format&fit=crop&w=900&q=80",
  "Party Wear": "https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=900&q=80",
  "Festival Collection": "https://images.unsplash.com/photo-1614252369475-531eba835be6?auto=format&fit=crop&w=900&q=80",
  "Straight Cut": "https://images.unsplash.com/photo-1596993100471-c3905dafa78e?auto=format&fit=crop&w=900&q=80",
  "A-Line": "https://images.unsplash.com/photo-1592301933927-35b597393c0a?auto=format&fit=crop&w=900&q=80",
  "Anarkali": "https://images.unsplash.com/photo-1610189025609-bb6b3b3a9e7d?auto=format&fit=crop&w=900&q=80",
  "Plus Size": "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=900&q=80",
};

export default function Categories() {
  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Categories" }]} />
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#1c1c1c] mt-4">All Categories</h1>
          <p className="text-sm text-neutral-600 mt-2 max-w-xl">
            Find your perfect silhouette — from everyday cottons to festive anarkalis.
          </p>
        </div>
      </div>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {CATEGORY_LIST.map((cat, i) => {
              const count = PRODUCTS.filter((p) => p.category === cat).length;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    className="group relative block aspect-[4/5] rounded-2xl overflow-hidden zoom-wrap"
                  >
                    <img src={CAT_IMAGES[cat]} alt={cat} className="zoom-img absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">{count} pieces</p>
                      <h3 className="font-display text-2xl sm:text-3xl mt-1">{cat}</h3>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-wider opacity-90 group-hover:gap-3 transition-all">
                        Shop now <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FAF6F4]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <SectionHeading
            eyebrow="Need help?"
            title={<>Can't find what you're <span className="italic">looking for</span>?</>}
            subtitle="Reach out to our personal style team for curated recommendations."
          />
          <Link to="/contact" className="inline-block mt-7">
            <span className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-[#800000] text-white text-sm uppercase tracking-wider hover:bg-[#5c0000] transition">
              Talk to a Stylist <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
