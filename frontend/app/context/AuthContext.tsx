"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { store } from "../store";
import { clearUserSessionData } from "../store/slices/prescriptionSlice";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | string;
  picture?: string;
  title?: string;
  bmdc_number?: string;
  email_verified?: boolean;
  created_at?: string;
  last_login_at?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  isDemoUser: boolean;
  isGoogleUser: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  loginWithGoogle: (
    credential: string,
    role?: string,
    bmdc?: string
  ) => Promise<{ success: boolean; is_new_user?: boolean; message?: string }>;
  loginAsDemoUser: (
    role?: "patient" | "doctor"
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserRole: (role: "patient" | "doctor", bmdc?: string, title?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Validate stored session with backend on initial load
  const verifySession = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("medbangla_token");
      const storedUser = localStorage.getItem("medbangla_user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse error
          }
        }

        // Fetch fresh profile from backend DB
        try {
          const { data } = await api.getCurrentUser();
          if (data?.user) {
            setCurrentUser(data.user);
            localStorage.setItem("medbangla_user", JSON.stringify(data.user));
            if (typeof document !== "undefined") {
              document.cookie = `medbangla_token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
            }
          }
        } catch (apiErr) {
          console.warn("Backend token check:", apiErr);
          if (storedToken.startsWith("demo-")) {
            // Keep demo user session active!
            return;
          }
          // Token invalid -> clear session
          localStorage.removeItem("medbangla_token");
          localStorage.removeItem("medbangla_user");
          if (typeof document !== "undefined") {
            document.cookie = "medbangla_token=; path=/; max-age=0; SameSite=Lax";
          }
          setCurrentUser(null);
          setToken(null);
        }
      } else if (storedUser) {
        // Legacy mock user cleanup
        localStorage.removeItem("medbangla_user");
        if (typeof document !== "undefined") {
          document.cookie = "medbangla_token=; path=/; max-age=0; SameSite=Lax";
        }
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Auth initialization error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // If redirected with ?auth=login, auto-prompt auth modal
  useEffect(() => {
    if (typeof window !== "undefined" && !currentUser && !isLoading) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("auth") === "login") {
        setIsAuthModalOpen(true);
      }
    }
  }, [currentUser, isLoading]);

  const loginWithGoogle = async (
    credential: string,
    role = "patient",
    bmdc?: string
  ): Promise<{ success: boolean; is_new_user?: boolean; message?: string }> => {
    try {
      store.dispatch(clearUserSessionData());
      const { data } = await api.loginWithGoogle(credential, role, bmdc);
      if (data?.access_token && data?.user) {
        setToken(data.access_token);
        setCurrentUser(data.user);

        localStorage.setItem("medbangla_token", data.access_token);
        localStorage.setItem("medbangla_user", JSON.stringify(data.user));
        if (typeof document !== "undefined") {
          document.cookie = `medbangla_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        }

        setIsAuthModalOpen(false);
        return {
          success: true,
          is_new_user: data.is_new_user,
          message: data.message,
        };
      }
      return { success: false, message: "Invalid response from server" };
    } catch (err: any) {
      console.error("Google authentication error:", err);
      return {
        success: false,
        message: err.message || "Google authentication failed",
      };
    }
  };

  const logout = () => {
    store.dispatch(clearUserSessionData());
    setCurrentUser(null);
    setToken(null);
    try {
      localStorage.removeItem("medbangla_token");
      localStorage.removeItem("medbangla_user");
      if (typeof document !== "undefined") {
        document.cookie = "medbangla_token=; path=/; max-age=0; SameSite=Lax";
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.getCurrentUser();
      if (data?.user) {
        setCurrentUser(data.user);
        localStorage.setItem("medbangla_user", JSON.stringify(data.user));
      }
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
  };

  const updateUserRole = async (
    role: "patient" | "doctor",
    bmdc?: string,
    title?: string
  ): Promise<boolean> => {
    try {
      const { data } = await api.updateProfile({
        role,
        bmdc_number: bmdc,
        title,
      });
      if (data?.user) {
        setCurrentUser(data.user);
        localStorage.setItem("medbangla_user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to update role:", e);
      return false;
    }
  };

  const loginAsDemoUser = async (
    role: "patient" | "doctor" = "patient"
  ): Promise<{ success: boolean; message?: string }> => {
    store.dispatch(clearUserSessionData());
    setIsLoading(true);
    try {
      try {
        const { data } = await api.demoLogin(role);
        if (data?.access_token && data?.user) {
          setToken(data.access_token);
          setCurrentUser(data.user);
          localStorage.setItem("medbangla_token", data.access_token);
          localStorage.setItem("medbangla_user", JSON.stringify(data.user));
          if (typeof document !== "undefined") {
            document.cookie = `medbangla_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
          }
          setIsAuthModalOpen(false);
          return { success: true, message: data.message };
        }
      } catch (err) {
        console.warn("Backend demo login fallback to local session:", err);
      }

      // Offline / Client-Side Demo Session Fallback
      const isDoc = role === "doctor";
      const demoUser: AuthUser = {
        id: isDoc ? "demo-user-doctor-01" : "demo-user-patient-01",
        name: isDoc ? "Prof. Dr. Md. Fazlul Hoque" : "Mahdi Hasan (Demo Patient)",
        email: isDoc ? "dr.fazlul.hoque@gmail.com" : "mahdi.hasan@gmail.com",
        role: isDoc ? "doctor" : "patient",
        bmdc_number: isDoc ? "BMDC-A-42190" : undefined,
        title: isDoc ? "Nephrology & Medicine Specialist" : undefined,
        email_verified: true,
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mahdi",
      };
      const demoToken = isDoc ? "demo-doctor-token" : "demo-patient-token";
      setToken(demoToken);
      setCurrentUser(demoUser);
      localStorage.setItem("medbangla_token", demoToken);
      localStorage.setItem("medbangla_user", JSON.stringify(demoUser));
      if (typeof document !== "undefined") {
        document.cookie = `medbangla_token=${demoToken}; path=/; max-age=86400; SameSite=Lax`;
      }
      setIsAuthModalOpen(false);
      return { success: true, message: "ডেমো জিমেইল অ্যাকাউন্টে সফলভাবে প্রবেশ করেছেন!" };
    } finally {
      setIsLoading(false);
    }
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isDemoUser = Boolean(
    (token && token.startsWith("demo-")) ||
    (currentUser?.id && currentUser.id.startsWith("demo-")) ||
    (currentUser?.email && currentUser.email.toLowerCase().includes("demo")) ||
    (currentUser?.name && currentUser.name.toLowerCase().includes("demo")) ||
    (currentUser?.name && currentUser.name.includes("Mahdi Hasan")) ||
    (currentUser?.email === "mahdi.hasan@gmail.com")
  );
  const isGoogleUser = Boolean(currentUser && !isDemoUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isDemoUser,
        isGoogleUser,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginAsDemoUser,
        logout,
        refreshUser,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
