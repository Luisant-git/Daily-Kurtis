import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const SocialIcon = ({ d, label }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-label={label}>
    <path d={d} />
  </svg>
);

const SOCIALS = [
  { label: "Instagram", d: "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.26.07 1.64.07 4.83s0 3.58-.07 4.83c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.26.06-1.64.07-4.83.07s-3.58 0-4.83-.07c-1.17-.05-1.8-.25-2.22-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.05-.41-2.22C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.83c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-1.07.05-1.65.23-2.04.38-.52.2-.88.44-1.27.83-.39.39-.63.75-.83 1.27-.15.39-.33.97-.38 2.04C2.67 8.5 2.67 8.85 2.67 12s0 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.52.44.88.83 1.27.39.39.75.63 1.27.83.39.15.97.33 2.04.38 1.24.07 1.59.07 4.74.07s3.5 0 4.74-.07c1.07-.05 1.65-.23 2.04-.38.52-.2.88-.44 1.27-.83.39-.39.63-.75.83-1.27.15-.39.33-.97.38-2.04.07-1.24.07-1.59.07-4.74s0-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04-.2-.52-.44-.88-.83-1.27-.39-.39-.75-.63-1.27-.83-.39-.15-.97-.33-2.04-.38C15.5 4 15.15 4 12 4zm0 3.06A4.94 4.94 0 1 1 7.06 12 4.94 4.94 0 0 1 12 7.06zm0 8.14A3.2 3.2 0 1 0 8.8 12 3.2 3.2 0 0 0 12 15.2zm5.13-8.34a1.15 1.15 0 1 1-1.15-1.15 1.15 1.15 0 0 1 1.15 1.15z" },
  { label: "Facebook", d: "M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.78 8.43-4.94 8.43-9.94z" },
  { label: "Twitter", d: "M22 5.8c-.74.33-1.53.55-2.36.65a4.1 4.1 0 0 0 1.8-2.27 8.27 8.27 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.65 11.65 0 0 1 3.4 4.5a4.1 4.1 0 0 0 1.27 5.47 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.13a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.67v-.53A8.36 8.36 0 0 0 22 5.8z" },
  { label: "Youtube", d: "M21.58 7.19a2.78 2.78 0 0 0-1.96-1.97C17.88 4.75 12 4.75 12 4.75s-5.88 0-7.62.47A2.78 2.78 0 0 0 2.42 7.2C1.95 8.93 1.95 12 1.95 12s0 3.07.47 4.81a2.78 2.78 0 0 0 1.96 1.97c1.74.47 7.62.47 7.62.47s5.88 0 7.62-.47a2.78 2.78 0 0 0 1.96-1.97c.47-1.74.47-4.81.47-4.81s0-3.07-.47-4.81zM10.05 15.27V8.73L15.6 12z" },
];
import Logo from "../ui/Logo";
import { SITE } from "../../data/site.js";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#1c1010] text-neutral-300 mt-20">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37]">Newsletter</p>
            <h3 className="font-display text-2xl sm:text-3xl text-white mt-2">
              Join the Daily Kurtis Circle
            </h3>
            <p className="text-sm text-neutral-400 mt-2 max-w-md">
              Be the first to know about new collections, styling tips and member-only offers.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                toast.success("You're in! Welcome to the circle ✨");
                setEmail("");
              }
            }}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12 px-5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#D4AF37]/60 w-full sm:flex-1 sm:min-w-0"
              />
              <button className="h-12 px-7 rounded-full bg-[#D4AF37] hover:bg-[#b8932c] text-white text-sm uppercase tracking-wider transition w-full sm:w-auto sm:min-w-[140px]">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - Logo Section with top padding to align with others */}
          <div className="pt-[5px]">
            <div className="[&_*]:text-white">
              <Logo variant="light" />
            </div>
            <p className="text-sm text-neutral-400 mt-5 leading-relaxed">
              Crafting timeless ethnic elegance for the modern woman. Discover our
              handpicked collection of kurthis, anarkalis and festive sets.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIALS.map((s) => (
                <a
                  href="#"
                  key={s.label}
                  aria-label={s.label}
                  className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition"
                >
                  <SocialIcon d={s.d} label={s.label} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <FooterCol
              title="Shop"
              items={[
                { l: "All Kurthis", to: "/shop" },
                { l: "Anarkali", to: "/categories" },
                { l: "Cotton Kurthis", to: "/categories" },
                { l: "Festive", to: "/categories" },
                { l: "Plus Size", to: "/categories" },
              ]}
            />
          </div>

          {/* Column 3 */}
          <div>
            <FooterCol
              title="Customer Service"
              items={[
                { l: "Contact Us", to: "/contact" },
                { l: "FAQs", to: "/faq" },
                { l: "Shipping Policy", to: "/shipping-policy" },
                { l: "Returns & Refunds", to: "/returns" },
                { l: "Size Guide", to: "/faq" },
              ]}
            />
          </div>

          {/* Column 4 */}
          <div>
            <FooterCol
              title="Company"
              items={[
                { l: "About Us", to: "/about" },
                { l: "Privacy Policy", to: "/privacy" },
                { l: "Terms & Conditions", to: "/terms" },
                { l: "My Orders", to: "/orders" },
                { l: "Wishlist", to: "/wishlist" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Contact strip */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <Phone size={16} className="text-[#D4AF37] mt-0.5" />
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wider">Call us</p>
              <p className="text-white">{SITE.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-[#D4AF37] mt-0.5" />
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wider">Email</p>
              <p className="text-white">{SITE.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-[#D4AF37] mt-0.5" />
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wider">Visit</p>
              <p className="text-white">{SITE.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-neutral-500">
          <p className="max-w-full">© {new Date().getFullYear()} Daily Kurtis. All rights reserved. Crafted with love in India.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/shipping-policy" className="hover:text-white">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <>
      <h4 className="text-white text-sm uppercase tracking-wider font-medium mb-4">{title}</h4>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.l}>
            <Link to={i.to} className="text-sm text-neutral-400 hover:text-[#D4AF37] transition">
              {i.l}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}