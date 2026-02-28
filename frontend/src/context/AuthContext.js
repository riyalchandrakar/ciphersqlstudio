import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("css_token");
    localStorage.removeItem("css_user");
    setUser(null);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("css_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.me();
        setUser(data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [logout]);

  // Listen for global logout events (e.g., 401 from interceptor)
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("css_token", data.token);
    localStorage.setItem("css_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await authAPI.register({ username, email, password });
    localStorage.setItem("css_token", data.token);
    localStorage.setItem("css_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
