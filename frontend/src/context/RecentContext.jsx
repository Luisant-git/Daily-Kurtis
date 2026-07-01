import { createContext, useContext, useEffect, useState } from "react";

const C = createContext(null);
const KEY = "dk_recent_v1";

export function RecentProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const push = (p) => {
    setItems((prev) => [p, ...prev.filter((x) => x.id !== p.id)].slice(0, 8));
  };
  return <C.Provider value={{ items, push }}>{children}</C.Provider>;
}

export const useRecent = () => {
  const v = useContext(C);
  if (!v) throw new Error("useRecent must be inside RecentProvider");
  return v;
};