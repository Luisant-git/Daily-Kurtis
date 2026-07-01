import { motion } from "framer-motion";
import { Sparkles, Heart, Award, Users } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import SectionHeading from "../components/ui/SectionHeading";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />
          <h1 className="font-display text-4xl sm:text-6xl mt-4">Our Story</h1>
          <p className="mt-4 text-white/85 max-w-xl">
            Crafting timeless ethnic elegance for the modern Indian woman — one kurthi at a time.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-4xl mx-auto px-4">
        <SectionHeading
          align="left"
          eyebrow="Est. 2018"
          title={<>From a small <span className="italic">studio</span> in Mumbai, to thousands of <span className="italic">homes</span>.</>}
        />
        <div className="mt-8 prose prose-neutral max-w-none text-neutral-700 text-[15px] leading-[1.85]">
          <p>
            Daily Kurtis began with a simple thought — that a woman's everyday wardrobe deserves
            the same artistry and intention as her festive one. Founded by two sisters, Meera and
            Anjali, the brand started in a small studio above a tailor shop in Bandra, with a
            single sewing machine and a love for handloom fabrics.
          </p>
          <p>
            Today, we partner with over 500 master artisans across Varanasi, Jaipur, Lucknow and
            Kolkata, bringing you kurthis that carry the soul of India's craftsmanship — without
            losing the comfort and ease the modern woman wants.
          </p>
          <p>
            We believe ethnic wear should never feel like an occasion. It should feel like home.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#FAF6F4] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            eyebrow="What we believe in"
            title={<>The values that <span className="italic">stitch us together</span></>}
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Heart, t: "Made with Love", s: "Every piece tells a story of the hands that made it." },
              { Icon: Sparkles, t: "Premium Quality", s: "We obsess over fabric, fit and finish." },
              { Icon: Users, t: "Artisan First", s: "Fair wages and lasting partnerships with our craftspeople." },
              { Icon: Award, t: "Sustainability", s: "Eco-friendly dyes, packaging, and offset shipping." },
            ].map((v) => (
              <motion.div
                key={v.t}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-[#E9E5E5] hover:-translate-y-1 hover:shadow-lg transition"
              >
                <v.Icon className="text-[#D4AF37]" size={28} strokeWidth={1.5} />
                <h4 className="font-display text-lg mt-4">{v.t}</h4>
                <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{v.s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { n: "50k+", l: "Happy Customers" },
            { n: "500+", l: "Artisan Partners" },
            { n: "8 yrs", l: "of Craftsmanship" },
            { n: "30+", l: "Countries Shipped" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-4xl sm:text-5xl text-[#800000]">{s.n}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
