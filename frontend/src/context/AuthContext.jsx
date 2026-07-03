import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

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
    setUser({ mobile, name, email, loggedInAt: Date.now() });
    toast.success(`Welcome ${name ? name : ""}! ✨`);
  };

  const logout = () => {
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = (name, email) => {
    setUser((prev) => ({ ...prev, name, email }));
    toast.success("Profile updated");
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
