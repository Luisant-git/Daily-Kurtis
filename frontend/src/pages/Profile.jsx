import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, MapPin, Package, Heart, Edit2, Plus, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import Breadcrumb from "../components/ui/Breadcrumb";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import { authApi } from "../api/auth";

const TABS = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "address", label: "Addresses", Icon: MapPin },
  { id: "orders", label: "Orders", Icon: Package },
  { id: "wishlist", label: "Wishlist", Icon: Heart },
];

const ADDRESSES = [];

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const { items: wishlist } = useWishlist();
  const { user, fetchProfile, updateProfile, loading, logout } = useAuth();
  const [editProfileForm, setEditProfileForm] = useState({ open: false, values: { name: "", email: "" } });
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [addressForm, setAddressForm] = useState({ open: false, index: null, values: {} });

  // Fetch profile data when user is available
  useEffect(() => {
    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.shippingAddress) {
      setAddresses([user.shippingAddress]);
    }
  }, [user?.shippingAddress]);

  // Initialize form values when user data is available
  useEffect(() => {
    if (user) {
      setEditProfileForm({ open: false, values: { name: user.name || "", email: user.email || "" } });
    }
  }, [user]);

  const openEditProfile = () => setEditProfileForm({ open: true, values: { name: user?.name || "", email: user?.email || "" } });
  const closeEditProfile = () => setEditProfileForm({ open: false, values: { name: user?.name || "", email: user?.email || "" } });

  const saveProfile = async () => {
    const { name, email } = editProfileForm.values;
    await updateProfile(name, email);
    closeEditProfile();
  };

  const openAddressForm = (index = null) => {
    if (index === null) {
      setAddressForm({ open: true, index: null, values: { type: "Home", name: "", line: "", city: "", phone: "" } });
    } else {
      setAddressForm({ open: true, index, values: { ...addresses[index] } });
    }
  };

  const saveAddress = async () => {
    const { index, values } = addressForm;
    
    try {
      await authApi.updateAddress(user?.token, values);
      
      if (index === null) setAddresses((s) => [values, ...s]);
      else setAddresses((s) => s.map((a, i) => (i === index ? values : a)));
      setAddressForm({ open: false, index: null, values: {} });
      toast.success(index === null ? "New address added" : "Address updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save address");
    }
  };

  const closeAddressForm = () => setAddressForm({ open: false, index: null, values: {} });

  // Handle logout with redirect to login
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 ? `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}` : phone;
  };

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Account" }]} />
          <h1 className="font-display text-3xl sm:text-4xl mt-3">My Account</h1>
          <p className="text-sm text-neutral-600 mt-2">Welcome back, {user?.name || "User"} ✨</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-white border border-[#E9E5E5] rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-3 pb-5 border-b border-[#E9E5E5]">

            <div>
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-neutral-500">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            </div>
          </div>
          <nav className="mt-3 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === "orders") return navigate("/orders");
                  setTab(t.id);
                }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  tab === t.id ? "bg-[#FFF8F8] text-[#800000] font-medium" : "text-neutral-600 hover:bg-[#FAF6F4]"
                }`}
              >
                <t.Icon size={15} /> {t.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:bg-[#FAF6F4] mt-3 border-t border-[#E9E5E5] pt-4">
              <LogOut size={15} /> Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          {tab === "profile" && (
            <div className="bg-white border border-[#E9E5E5] rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl">Personal Information</h2>
              {loading ? (
                <div className="mt-6 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000] mx-auto"></div>
                  <p className="text-sm text-neutral-500 mt-2">Loading profile...</p>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid sm:grid-cols-2 gap-5">
                    <Info label="Full Name" value={user?.name || "Not set"} />
                    <Info label="Phone" value={formatPhone(user?.mobile) || "Not set"} />
                    <Info label="Email" value={user?.email || "Not set"} />
                  </div>
                  <button onClick={openEditProfile} className="mt-6 inline-flex items-center gap-2 text-sm text-[#800000] font-medium hover:underline">
                    <Edit2 size={14} /> Edit Profile
                  </button>
                </>
              )}

              {editProfileForm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
                  <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="font-display text-xl">Edit Profile</h3>
                        <p className="text-sm text-neutral-500">Update your account details.</p>
                      </div>
                      <button onClick={closeEditProfile} className="text-neutral-500 hover:text-[#800000]">Cancel</button>
                    </div>
                    <div className="grid sm:grid-cols-1 gap-3">
                      <input
                        className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                        placeholder="Full name"
                        value={editProfileForm.values.name}
                        onChange={(e) => setEditProfileForm((s) => ({ ...s, values: { ...s.values, name: e.target.value } }))}
                      />
                      <input
                        className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                        placeholder="Email"
                        value={editProfileForm.values.email}
                        onChange={(e) => setEditProfileForm((s) => ({ ...s, values: { ...s.values, email: e.target.value } }))}
                      />
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                      <button onClick={closeEditProfile} className="px-4 py-2 border rounded">Cancel</button>
                      <button onClick={saveProfile} className="px-4 py-2 bg-[#800000] text-white rounded">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "address" && (
            <div className="space-y-4">
              {addresses.map((a, i) => (
                <div key={i} className="bg-white border border-[#E9E5E5] rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-[#FFF8F8] text-[#800000]">{a.type}</span>
                      <p className="font-medium mt-2">{a.name}</p>
                      <p className="text-sm text-neutral-600">{a.line}</p>
                      <p className="text-sm text-neutral-600">{a.city}</p>
                      <p className="text-sm text-neutral-500 mt-1">{a.phone}</p>
                    </div>
                    <button onClick={() => openAddressForm(i)} className="text-sm text-[#800000] flex items-center gap-1.5"><Edit2 size={13} /> Edit</button>
                  </div>
                </div>
              ))}
              <button onClick={() => openAddressForm(null)} className="w-full bg-white border-2 border-dashed border-[#E9E5E5] rounded-2xl py-6 text-sm text-[#800000] inline-flex items-center justify-center gap-2 hover:border-[#800000]">
                <Plus size={16} /> Add New Address
              </button>

              {addressForm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h3 className="font-medium mb-3">{addressForm.index === null ? "Add Address" : "Edit Address"}</h3>
                    <div className="space-y-2">
                      <input className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]" placeholder="Type (Home/Office)" value={addressForm.values.type} onChange={(e) => setAddressForm((s) => ({ ...s, values: { ...s.values, type: e.target.value } }))} />
                      <input className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]" placeholder="Name" value={addressForm.values.name} onChange={(e) => setAddressForm((s) => ({ ...s, values: { ...s.values, name: e.target.value } }))} />
                      <input className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]" placeholder="Street / Line" value={addressForm.values.line} onChange={(e) => setAddressForm((s) => ({ ...s, values: { ...s.values, line: e.target.value } }))} />
                      <input className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]" placeholder="City, State PIN" value={addressForm.values.city} onChange={(e) => setAddressForm((s) => ({ ...s, values: { ...s.values, city: e.target.value } }))} />
                      <input className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]" placeholder="Phone" value={addressForm.values.phone} onChange={(e) => setAddressForm((s) => ({ ...s, values: { ...s.values, phone: e.target.value } }))} />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={closeAddressForm} className="px-4 py-2 border rounded">Cancel</button>
                      <button onClick={saveAddress} className="px-4 py-2 bg-[#800000] text-white rounded">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="bg-white border border-[#E9E5E5] rounded-2xl p-6">
              <p className="text-sm text-neutral-600">Redirecting to your orders page...</p>
              <Link to="/orders" className="inline-block mt-4 text-sm text-[#800000] font-medium underline">Go to My Orders →</Link>
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              {wishlist.length === 0 ? (
                <div className="bg-white border border-[#E9E5E5] rounded-2xl p-10 text-center">
                  <p className="text-neutral-500">No items in wishlist yet.</p>
                    <Link to="/shop?filter=bestseller" className="inline-block mt-4 text-sm text-[#800000] underline">Start shopping</Link>
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