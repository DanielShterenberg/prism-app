"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

const COOKIE_NAME = "prism-auth-token";

function setAuthCookie(token: string | null) {
  if (token) {
    // Expires in 1 hour — matches Firebase ID token lifetime
    const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${token}; path=/; expires=${expires}; SameSite=Strict`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { onIdTokenChanged } = require("firebase/auth");
    // onIdTokenChanged fires on login, logout, and every token refresh (~1h)
    const unsubscribe = onIdTokenChanged(
      getClientAuth(),
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          setUser(firebaseUser);
          setToken(idToken);
          setAuthCookie(idToken);
        } else {
          setUser(null);
          setToken(null);
          setAuthCookie(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
