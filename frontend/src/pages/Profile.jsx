import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, MapPin, Package, Heart, Edit2, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import Breadcrumb from "../components/ui/Breadcrumb";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import { authApi } from "../api/auth";

const TABS = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "orders", label: "Orders", Icon: Package },
  { id: "wishlist", label: "Wishlist", Icon: Heart },
];

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const getInitialShippingForm = (user) => ({
  fullName: String(user?.shippingAddress?.name || user?.name || ""),
  addressLine: String(user?.shippingAddress?.addressLine || user?.shippingAddress?.addressLine1 || ""),
  landmark: String(user?.shippingAddress?.landmark || ""),
  city: String(user?.shippingAddress?.city || ""),
  state: String(user?.shippingAddress?.state || ""),
  pincode: String(user?.shippingAddress?.pincode || ""),
  mobile: String(user?.shippingAddress?.mobile || user?.mobile || ""),
});

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const { items: wishlist } = useWishlist();
  const { user, fetchProfile, updateProfile, updateShippingAddress, loading, logout } = useAuth();
  const [editProfileForm, setEditProfileForm] = useState({ open: false, values: { name: "", email: "" } });
  const [shippingForm, setShippingForm] = useState(getInitialShippingForm(null));
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token, fetchProfile]);

  useEffect(() => {
    if (user) {
      setEditProfileForm({ open: false, values: { name: user.name || "", email: user.email || "" } });
      setShippingForm(getInitialShippingForm(user));
    }
  }, [user]);

  const openEditProfile = () => setEditProfileForm({ open: true, values: { name: user?.name || "", email: user?.email || "" } });
  const closeEditProfile = () => setEditProfileForm({ open: false, values: { name: user?.name || "", email: user?.email || "" } });

  const saveProfile = async () => {
    const { name, email } = editProfileForm.values;
    await updateProfile(name, email);
    closeEditProfile();
  };

  const saveShippingAddress = async () => {
    if (!user?.token) {
      toast.error("Please log in to save your shipping address");
      return;
    }

    // Ensure all values are strings and properly trimmed
    const name = String(shippingForm.fullName || "").trim();
    const addressLine = String(shippingForm.addressLine || "").trim();
    const city = String(shippingForm.city || "").trim();
    const state = String(shippingForm.state || "").trim();
    const pincode = String(shippingForm.pincode || "").trim();
    const mobile = String(shippingForm.mobile || user?.mobile || "").trim();
    const landmark = String(shippingForm.landmark || "").trim();

    // Validate required fields
    if (!name || !addressLine || !city || !state || !pincode) {
      toast.error("Please fill in all required shipping address fields");
      return;
    }

    // Additional validation for pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    // Additional validation for mobile (10 digits)
    if (mobile && !/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setSavingAddress(true);
      const shippingAddress = {
        name,
        addressLine,
        landmark,
        city,
        state,
        pincode,
        mobile,
      };
      const updatedUser = await authApi.updateShippingAddress(user.token, shippingAddress);
      const savedAddress = updatedUser?.shippingAddress || shippingAddress;
      updateShippingAddress(savedAddress);
      await fetchProfile();
      toast.success("Shipping address saved");
    } catch (e) {
      console.error(e);
      const apiMessage =
        (e?.response?.message && Array.isArray(e.response.message))
          ? e.response.message.join(", ")
          : e?.response?.message || e?.message;
      toast.error(String(apiMessage || "Failed to save shipping address"));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
                    <div className="grid gap-3">
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
              {/* Shipping address embedded inside Profile tab */}
              <div className="mt-6 border-t border-[#E9E5E5] pt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg">Shipping Address</h3>
                    <p className="text-sm text-neutral-600 mt-1">Use this as your default delivery address.</p>
                  </div>
                  {user?.shippingAddress ? (
                    <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFF8F8] text-[#800000]">Saved address</span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-neutral-700">
                    <span className="mb-2 block">Full Name</span>
                    <input
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm((s) => ({ ...s, fullName: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </label>

                  <label className="text-sm text-neutral-700">
                    <span className="mb-2 block">Registered Mobile</span>
                    <input
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.mobile || user?.mobile || ""}
                      readOnly
                      placeholder="Registered mobile"
                      type="tel"
                    />
                  </label>

                  <label className="text-sm text-neutral-700 md:col-span-2">
                    <span className="mb-2 block">Address Line</span>
                    <input
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.addressLine}
                      onChange={(e) => setShippingForm((s) => ({ ...s, addressLine: e.target.value }))}
                      placeholder="House / Flat / Building"
                    />
                  </label>

                  <label className="text-sm text-neutral-700 md:col-span-2">
                    <span className="mb-2 block">Landmark</span>
                    <input
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.landmark}
                      onChange={(e) => setShippingForm((s) => ({ ...s, landmark: e.target.value }))}
                      placeholder="Nearby landmark"
                    />
                  </label>

                  <label className="text-sm text-neutral-700">
                    <span className="mb-2 block">City</span>
                    <input
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm((s) => ({ ...s, city: e.target.value }))}
                      placeholder="City"
                    />
                  </label>

                  <label className="text-sm text-neutral-700">
                    <span className="mb-2 block">State</span>
                    <select
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm((s) => ({ ...s, state: e.target.value }))}
                    >
                      <option value="">Select state</option>
                      {STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-neutral-700">
                    <span className="mb-2 block">Pincode</span>
                    <input
                      className="w-full h-11 px-4 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
                      value={shippingForm.pincode}
                      onChange={(e) => setShippingForm((s) => ({ ...s, pincode: e.target.value }))}
                      placeholder="Pincode"
                      type="text"
                      maxLength="6"
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button onClick={saveShippingAddress} disabled={savingAddress} className="px-5 py-2.5 bg-[#800000] text-white rounded-full text-sm font-medium disabled:opacity-70">
                    {savingAddress ? "Saving..." : "Save Shipping Address"}
                  </button>
                  <p className="text-sm text-neutral-500">Your registered mobile number will be used for delivery updates.</p>
                </div>
              </div>
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