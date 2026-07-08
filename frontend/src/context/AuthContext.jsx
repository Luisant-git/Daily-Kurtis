import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

const AuthCtx = createContext(null);
const KEY = "dk_auth_v1";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // If user has a token, don't trust cached name/email — fetch from backend
        if (parsed?.token) {
          return { mobile: parsed.mobile, token: parsed.token, name: "", email: "", loggedInAt: parsed.loggedInAt };
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [profileOpen, setProfileOpen] = useState(false);
  // Loading should be true if user has token but profile not loaded yet (no createdAt)
  const [loading, setLoading] = useState(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If user has a token, we need to fetch profile — loading is true
      return !!parsed?.token;
    }
    return false;
  });

  // Ref to always have access to the latest user state
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Fetch profile automatically when user logs in
  useEffect(() => {
    if (user?.token && !user?.createdAt) {
      fetchProfile();
    }
  }, [user?.token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEY);
    }
  }, [user]);

  const login = (mobile, name = "", email = "", token = "") => {
    // Store all provided data - name and email may come from registration
    const userData = {
      mobile,
      name: name || "",
      email: email || "",
      token,
      loggedInAt: Date.now(),
    };
    
    setUser(userData);
    // Set loading to true only if we have a token and no name/email
    setLoading(!!token && !(name || email));
    toast.success(`Welcome! ✨`);
  };

  const logout = () => {
    setUser(null);
    toast.success("Logged out successfully");
  };

  const openLoginModal = () => {
    toast.error("Please login to continue");
    navigate("/login");
  };

  const fetchProfile = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser?.mobile || !currentUser?.token) return;
    
    setLoading(true);
    try {
      const response = await authApi.fetchProfile(currentUser.token);
      if (response) {
        const normalizedShippingAddress =
          response?.shippingAddress && typeof response.shippingAddress === "object" && !Array.isArray(response.shippingAddress) && Object.keys(response.shippingAddress).length > 0
            ? response.shippingAddress
            : undefined;

        setUser((prev) => ({ 
          ...prev, 
          name: response.name || prev?.name || "",
          email: response.email || prev?.email || "",
          mobile: response.phone || prev?.mobile,
          createdAt: response.createdAt || prev?.createdAt,
          shippingAddress: normalizedShippingAddress || prev?.shippingAddress,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If token is invalid/expired (401), log the user out
      if (error.message?.toLowerCase().includes('unauthorized') || error.message?.toLowerCase().includes('401')) {
        setUser(null);
        toast.error("Session expired. Please login again.");
      } else {
        // If backend is down, clear name/email so profile shows "Not set"
        setUser((prev) => ({ 
          ...prev, 
          name: "",
          email: "",
          createdAt: Date.now(), // mark as "loaded" so we don't keep retrying
        }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (name, email) => {
    try {
      // Only send defined non-empty values to avoid validation issues
      const payload = {};
      if (name !== undefined && name !== "") {
        payload.name = name;
      }
      if (email !== undefined && email !== "") {
        payload.email = email;
      }
      
      // Call backend API to update profile
      await authApi.updateProfile(userRef.current?.token, payload);
      
      setUser((prev) => ({ ...prev, name, email }));
      toast.success("Profile updated");
    } catch (error) {
      console.error("Profile update error:", error);
      // Fallback to local update if API fails
      setUser((prev) => ({ ...prev, name, email }));
      toast.success("Profile updated locally");
    }
  };

  const updateShippingAddress = (address) => {
    setUser((prev) => ({ ...prev, shippingAddress: address }));
  };

  const isLoggedIn = !!user;

  return (
    <AuthCtx.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        openLoginModal,
        fetchProfile,
        updateProfile,
        updateShippingAddress,
        profileOpen,
        setProfileOpen,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
};