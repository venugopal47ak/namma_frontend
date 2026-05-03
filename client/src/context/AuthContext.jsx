import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/http";

const AuthContext = createContext(null);

const normalizeSession = (data) => ({
  token: data?.token || localStorage.getItem("nammaserve_token"),
  user: data?.user || null
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem("nammaserve_token"),
    user: null
  }));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("nammaserve_token")));

  useEffect(() => {
    const bootstrap = async () => {
      if (!session.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setSession((current) => ({
          ...current,
          user: data.user
        }));
      } catch (error) {
        localStorage.removeItem("nammaserve_token");
        setSession({ token: null, user: null });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [session.token]);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("nammaserve_token", data.token);
    const normalized = normalizeSession(data);
    setSession(normalized);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("nammaserve_token", data.token);
    const normalized = normalizeSession(data);
    setSession(normalized);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("nammaserve_token");
    setSession({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      ...session,
      loading,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      register,
      logout,
      setSession,
      setUser: (user) => setSession(prev => ({ ...prev, user }))
    }),

    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

