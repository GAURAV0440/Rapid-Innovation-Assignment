import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/axios";

type Role = "user" | "admin" | null;

type AuthContextType = {
  token: string | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ace_token");
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<Role>(() => {
    try {
      return (localStorage.getItem("ace_role") as Role) || null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string; role: "user" | "admin" }>("/auth/login", {
      email,
      password
    });
    setToken(data.access_token);
    setRole(data.role);
    localStorage.setItem("ace_token", data.access_token);
    localStorage.setItem("ace_role", data.role);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("ace_token");
      localStorage.removeItem("ace_role");
    } catch {}
    setToken(null);
    setRole(null);
  }, []);

  // Keep state in sync with storage changes across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ace_token") {
        setToken(e.newValue);
      }
      if (e.key === "ace_role") {
        setRole((e.newValue as Role) || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ token, role, isAuthenticated, login, logout }),
    [token, role, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
