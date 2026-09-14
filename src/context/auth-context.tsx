"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SessionType = "artist" | "follower" | null;

const STORAGE_KEY = "muraton-session";

interface AuthContextValue {
  session: SessionType;
  login: (type: "artist" | "follower") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionType>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "artist" || raw === "follower") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate session from localStorage post-mount to avoid SSR mismatch
        setSession(raw);
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, session);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [session, hydrated]);

  const login = (type: "artist" | "follower") => setSession(type);
  const logout = () => setSession(null);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
