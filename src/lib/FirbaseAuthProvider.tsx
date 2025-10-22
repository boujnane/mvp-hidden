// lib/FirebaseAuthProvider.tsx
"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebaseConfig";

interface SessionContextType {
  user: FirebaseUser | null;
  logout: () => void;
  initializing: boolean; // <-- nouveau
}

const AuthContext = createContext<SessionContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [initializing, setInitializing] = useState(true); // <-- nouveau

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false); // Firebase a terminé la vérification
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside FirebaseAuthProvider");
  return context;
};
