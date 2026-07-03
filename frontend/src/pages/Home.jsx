import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Gift, Star, Camera } from "lucide-react";
import { PRODUCTS } from "../data/products.js";
import { FEATURED_CATEGORIES, REVIEWS, INSTAGRAM, OCCASIONS_HOME } from "../data/site.js";
import ProductCard from "../components/product/ProductCard";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import Rating from "../components/ui/Rating";

const HERO_SLIDES = [
  "https://zola.in/cdn/shop/articles/CLassssssKS.jpg?v=1689671595",
  "https://zola.in/cdn/shop/articles/marron_kurta_banner.jpg?v=1686203627",
  "https://zola.in/cdn/shop/articles/MLSS.jpg?v=1688119716",
];
export default function Home() {
  const [current, setCurrent] = useState(0);
  const newArrivals = PRODUCTS.filter((p) => p.newArrival).slice(0, 4);
  const bestSellers = [
    ...PRODUCTS.filter((p) => p.name === "Naina Office Essential"),
    ...PRODUCTS.filter((p) => p.bestSeller && p.name !== "Naina Office Essential"),
    ...PRODUCTS.filter((p) => p.featured && !p.bestSeller && p.name !== "Naina Office Essential"),
  ].slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* HERO CAROUSEL */}
      <section className="relative h-[55vh] sm:h-[60vh] md:h-[70vh] lg:h-[88vh] min-h-[320px] sm:min-h-[420px] lg:min-h-[500px] overflow-hidden">
        {HERO_SLIDES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Daily Kurtis ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />

        {/* Carousel dots - bottom right */}
        <div className="absolute bottom-6 right-4 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <span
              key={i}
              className={`rounded-full shadow-md transition-all duration-300 ${
                i === current
                  ? "w-2.5 h-2.5 bg-white"
                  : "w-2 h-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* USP STRIP */}
      <section className="border-b border-[#E9E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6">
          {[
            { Icon: Truck, t: "Free Shipping", s: "On orders over ₹1,499" },
            { Icon: RefreshCcw, t: "Easy 15-Day Returns", s: "No questions asked" },
            { Icon: ShieldCheck, t: "Secure Payments", s: "100% SSL encrypted" },
            { Icon: Gift, t: "Premium Packaging", s: "Gift-ready always" },
          ].map(({ Icon, t, s }) => (
            <div key={t} className="flex items-start gap-3 px-4 py-4 rounded-3xl border border-[#F1ECEC] shadow-sm bg-white">
              <Icon className="text-[#800000] mt-1" size={22} strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-[#1c1c1c]">{t}</p>
                <p className="text-xs text-neutral-500">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-20 lg:py-28 bg-[#FAF6F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Curated"
            title={<>Shop by <span className="italic">Category</span></>}
            subtitle="Explore our most-loved silhouettes, designed for every mood and moment of your day."
          />
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-6 gap-5">
            {FEATURED_CATEGORIES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="group block text-center"
                >
                  <div className="relative aspect-square overflow-hidden rounded-full ring-1 ring-[#E9E5E5] group-hover:ring-[#D4AF37] transition zoom-wrap mx-auto bg-white">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="zoom-img w-full h-full object-cover object-top"
                    />
                  </div>
                  <h3 className="font-display text-lg mt-4 text-[#1c1c1c] group-hover:text-[#800000] transition">
                    {c.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mt-0.5">
                    {c.tag}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <SectionHeading
              align="left"
              eyebrow="Trending Now"
              title={<>The <span className="italic">Top Selling</span> List</>}
              subtitle="Hand-picked by our style team — pieces that define this season's mood."
            />
            <Link
              to="/shop?filter=popular"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-[#800000] hover:text-[#5c0000] font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* OFFER BANNER */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800000] via-[#5c0000] to-[#3a0000] text-white p-8 sm:p-14 grid md:grid-cols-2 gap-8 items-center">
            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 bg-[#D4AF37] text-white text-[11px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full">
                Limited Time
              </span>
              <h3 className="font-display text-3xl sm:text-5xl mt-5 leading-tight">
                Festive Sale —<br />
                <span className="gold-text">Flat 30% Off</span>
              </h3>
              <p className="mt-4 text-white/80 max-w-md text-sm sm:text-base">
                Refresh your festive wardrobe with our hand-picked sale edit.
                Use code <span className="font-semibold text-[#D4AF37]">DAILY30</span> at checkout.
              </p>
              <Link to="/shop?filter=bestseller" className="inline-block mt-7">
                <Button variant="gold">View the Sale</Button>
              </Link>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://www.aachho.com/cdn/shop/files/8_1dc18193-4971-46cb-9f07-421e5ebd85d0_540x.jpg?v=1768904018"
                className="rounded-2xl object-cover aspect-[4/5] w-full max-w-sm mx-auto shadow-2xl"
                alt={FEATURED_CATEGORIES[2]?.name || "Offer"}
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="py-20 lg:py-24 bg-[#FAF6F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Just In"
            title={<>New <span className="italic">Arrivals</span></>}
            subtitle="The latest additions to our collection — fresh prints, premium fabrics."
          />
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop?filter=new">
              <Button variant="outline">Explore All</Button>
            </Link>
          </div>
        </div>
      </section>

      
      {/* SHOP BY OCCASION
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Dressed for the moment"
            title={<>Shop by <span className="italic">Occasion</span></>}
          />
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {OCCASIONS_HOME.map((o, i) => (
              <motion.div
                key={o.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link
                  to={`/shop?occasion=${encodeURIComponent(o.name)}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-2xl zoom-wrap"
                >
                  <img src={FEATURED_CATEGORIES[i % FEATURED_CATEGORIES.length]?.image || o.img} alt={o.name} className="zoom-img w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">For</p>
                    <h3 className="font-display text-2xl mt-1">{o.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* WHY CHOOSE US */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img
                src="https://www.libas.in/cdn/shop/files/51109A_6MainLibasArtYellowWovenDesignSilkBlendAnarkaliSuitSetWithDupatta.jpg?v=1761399107&width=360"
                alt="Why Daily Kurtis"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 sm:-right-8 bg-white rounded-2xl p-5 shadow-xl border border-[#E9E5E5] max-w-[230px]">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-[#D4AF37] text-[#D4AF37]" />
                <span className="font-display text-xl">4.9</span>
                <span className="text-xs text-neutral-500">/ 5.0</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Loved by 50,000+ women across India & abroad.
              </p>
            </div>
          </motion.div>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Why Daily Kurtis"
              title={<>Crafted with <span className="italic">love</span>, designed for <span className="italic">you</span>.</>}
              subtitle="From the looms of Varanasi to the printing tables of Jaipur, every piece carries a story — and our promise of quality."
            />
            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {[
                { t: "Artisan-Crafted", s: "Handwork by 500+ skilled artisans across India." },
                { t: "Premium Fabrics", s: "Pure cottons, silks, chanderis — breathable & lasting." },
                { t: "True Sizing", s: "Size XS to 4XL with honest measurements." },
                { t: "Carbon-Neutral Shipping", s: "Eco-friendly packaging & offset delivery." },
              ].map((f) => (
                <div key={f.t} className="rounded-xl border border-[#E9E5E5] p-5 hover:border-[#D4AF37] transition">
                  <p className="font-medium text-[#800000] flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    {f.t}
                  </p>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{f.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-20 lg:py-28 bg-[#FAF6F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Kind Words"
            title={<>Loved by <span className="italic">Women Everywhere</span></>}
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REVIEWS.map((r) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-[#E9E5E5] rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition"
              >
                <Rating value={r.rating} />
                <p className="mt-4 text-sm text-neutral-700 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#E9E5E5]">
                  <img src={r.image} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-[#1c1c1c]">{r.name}</p>
                    <p className="text-xs text-neutral-500">{r.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="@dailykurtis"
            title={<>From our <span className="italic">Community</span></>}
            subtitle="Tag #DailyKurtis to be featured."
          />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {INSTAGRAM.map((src, i) => (
              <a
                href="#"
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl zoom-wrap"
              >
                <img src={src} alt="instagram" className="zoom-img w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                  <Camera className="text-white opacity-0 group-hover:opacity-100 transition" size={26} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}