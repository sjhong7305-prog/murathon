"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

export interface SessionArtist {
  id: string;
  name: string;
  slug: string;
}

interface SessionResponse {
  isLoggedIn: boolean;
  userId?: string;
  nickname?: string;
  email?: string;
  artists?: SessionArtist[];
  activeArtistId?: string | null;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  loading: boolean;
  userId: string | null;
  nickname: string | null;
  email: string | null;
  artists: SessionArtist[];
  activeArtistId: string | null;
  activeArtist: SessionArtist | null;
  logout: () => void;
  switchToFan: () => Promise<void>;
  switchToArtist: (artistId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [artists, setArtists] = useState<SessionArtist[]>([]);
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (data: SessionResponse) => {
    setIsLoggedIn(data.isLoggedIn);
    setUserId(data.userId ?? null);
    setNickname(data.nickname ?? null);
    setEmail(data.email ?? null);
    setArtists(data.artists ?? []);
    setActiveArtistId(data.activeArtistId ?? null);
  };

  useEffect(() => {
    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : { isLoggedIn: false }))
      .then(applySession)
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
    // Re-checks on every navigation so header/mode state stays correct after actions
    // (signup, login, creating an artist profile, switching mode) that redirect client-side.
  }, [pathname]);

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setNickname(null);
    setEmail(null);
    setArtists([]);
    setActiveArtistId(null);
    fetch("/api/logout", { method: "POST" }).catch(() => {});
  };

  const switchToFan = async () => {
    await fetch("/api/session/active-artist", { method: "DELETE" }).catch(() => {});
    setActiveArtistId(null);
  };

  const switchToArtist = async (artistId: string) => {
    const res = await fetch("/api/session/active-artist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistId }),
    });
    if (res.ok) setActiveArtistId(artistId);
  };

  const activeArtist = artists.find((a) => a.id === activeArtistId) ?? null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        userId,
        nickname,
        email,
        artists,
        activeArtistId,
        activeArtist,
        logout,
        switchToFan,
        switchToArtist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
