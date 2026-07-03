import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "../api/auth";
import API_BASE_URL from "../api/config";

const AuthCtx = createContext(null);
const KEY = "dk_auth_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEY);
    }
  }, [user]);

  const login = (mobile, name = "", email = "") => {
    // User data is already verified by Navbar's verifyOtp function
    // This function just sets the user state
    const userData = {
      mobile,
      name,
      email,
      loggedInAt: Date.now(),
    };
    
    setUser(userData);
    toast.success(`Welcome ${name || ""}! ✨`);
  };

  const logout = () => {
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (name, email) => {
    try {
      // Call backend API to update profile
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setUser((prev) => ({ ...prev, name, email }));
      toast.success("Profile updated");
    } catch (error) {
      console.error("Profile update error:", error);
      // Fallback to local update if API fails
      setUser((prev) => ({ ...prev, name, email }));
      toast.success("Profile updated locally");
    }
  };

  const isLoggedIn = !!user;

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  return (
    <AuthCtx.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        updateProfile,
        profileOpen,
        setProfileOpen,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
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
