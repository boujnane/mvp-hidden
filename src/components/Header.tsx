"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <header className="w-full bg-white/90 sm:bg-white/80 backdrop-blur-none sm:backdrop-blur-sm border-b border-gray-100 py-3 sm:py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 bg-blue-500 sm:bg-gradient-to-br sm:from-blue-500 sm:to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-lg">H</span>
          </div>
          <span className="font-bold text-gray-800 text-sm sm:text-lg">HIDDEN</span>
        </Link>

        {/* Auth + Status + Avatar */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Déconnexion
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-blue-500 sm:bg-blue-600 rounded-lg hover:bg-blue-600 sm:hover:bg-blue-700 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Status + Avatar */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-1 text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs sm:text-sm">En ligne</span>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 sm:bg-gradient-to-br sm:from-yellow-400 sm:to-yellow-500 rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                  <span className="text-white font-medium text-xs sm:text-sm">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-1 text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs sm:text-sm">Hors ligne</span>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-400 rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-medium text-xs sm:text-sm">--</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
