import { useState } from "react";
import { Link } from "react-router-dom";
import { User, MapPin, Package, Heart, Edit2, Plus, LogOut } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";

const TABS = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "address", label: "Addresses", Icon: MapPin },
  { id: "orders", label: "Orders", Icon: Package },
  { id: "wishlist", label: "Wishlist", Icon: Heart },
];

const ADDRESSES = [
  { type: "Home", name: "Anaya Sharma", line: "301, Heritage Towers, Linking Road", city: "Mumbai, MH 400052", phone: "+91 98765 43210" },
  { type: "Office", name: "Anaya Sharma", line: "12B, Connaught Place, Block A", city: "New Delhi, DL 110001", phone: "+91 98765 43210" },
];

export default function Profile() {
  const [tab, setTab] = useState("profile");
  const { items: wishlist } = useWishlist();

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Account" }]} />
          <h1 className="font-display text-3xl sm:text-4xl mt-3">My Account</h1>
          <p className="text-sm text-neutral-600 mt-2">Welcome back, Anaya ✨</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-white border border-[#E9E5E5] rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-3 pb-5 border-b border-[#E9E5E5]">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" className="w-12 h-12 rounded-full object-cover" alt="" />
            <div>
              <p className="font-medium">Anaya Sharma</p>
              <p className="text-xs text-neutral-500">Member since 2024</p>
            </div>
          </div>
          <nav className="mt-3 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  tab === t.id ? "bg-[#FFF8F8] text-[#800000] font-medium" : "text-neutral-600 hover:bg-[#FAF6F4]"
                }`}
              >
                <t.Icon size={15} /> {t.label}
              </button>
            ))}
            <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:bg-[#FAF6F4] mt-3 border-t border-[#E9E5E5] pt-4">
              <LogOut size={15} /> Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          {tab === "profile" && (
            <div className="bg-white border border-[#E9E5E5] rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl">Personal Information</h2>
              <div className="mt-6 grid sm:grid-cols-2 gap-5">
                <Info label="Full Name" value="Anaya Sharma" />
                <Info label="Email" value="anaya@example.com" />
                <Info label="Phone" value="+91 98765 43210" />
                <Info label="Date of Birth" value="14 Aug 1995" />
                <Info label="Gender" value="Female" />
                <Info label="Default Currency" value="₹ INR" />
              </div>
              <button className="mt-6 inline-flex items-center gap-2 text-sm text-[#800000] font-medium hover:underline">
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>
          )}

          {tab === "address" && (
            <div className="space-y-4">
              {ADDRESSES.map((a, i) => (
                <div key={i} className="bg-white border border-[#E9E5E5] rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-[#FFF8F8] text-[#800000]">{a.type}</span>
                      <p className="font-medium mt-2">{a.name}</p>
                      <p className="text-sm text-neutral-600">{a.line}</p>
                      <p className="text-sm text-neutral-600">{a.city}</p>
                      <p className="text-sm text-neutral-500 mt-1">{a.phone}</p>
                    </div>
                    <button className="text-sm text-[#800000] flex items-center gap-1.5"><Edit2 size={13} /> Edit</button>
                  </div>
                </div>
              ))}
              <button className="w-full bg-white border-2 border-dashed border-[#E9E5E5] rounded-2xl py-6 text-sm text-[#800000] inline-flex items-center justify-center gap-2 hover:border-[#800000]">
                <Plus size={16} /> Add New Address
              </button>
            </div>
          )}

          {tab === "orders" && (
            <div className="bg-white border border-[#E9E5E5] rounded-2xl p-6">
              <p className="text-sm text-neutral-600">View your complete order history.</p>
              <Link to="/orders" className="inline-block mt-4 text-sm text-[#800000] font-medium underline">Go to My Orders →</Link>
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              {wishlist.length === 0 ? (
                <div className="bg-white border border-[#E9E5E5] rounded-2xl p-10 text-center">
                  <p className="text-neutral-500">No items in wishlist yet.</p>
                  <Link to="/shop" className="inline-block mt-4 text-sm text-[#800000] underline">Start shopping</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}
