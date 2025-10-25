"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@radix-ui/themes";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface Stat {
  label: string;
  value: number;
  trend: string; // "+12", "-3", "0"
}

export default function DashboardStatsLive() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Annonces", value: 0, trend: "+0" },
    { label: "Conversations", value: 0, trend: "+0" },
    { label: "Utilisateurs", value: 0, trend: "+0" },
  ]);

  useEffect(() => {
    // Annonces
    const unsubAnnonces = onSnapshot(collection(db, "annonces"), (snap) => {
      setStats((prev) => [
        { ...prev[0], value: snap.size },
        prev[1],
        prev[2],
      ]);
    });

    // Chats / Conversations
    const unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
      setStats((prev) => [
        prev[0],
        { ...prev[1], value: snap.size },
        prev[2],
      ]);
    });

    // Utilisateurs
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats((prev) => [
        prev[0],
        prev[1],
        { ...prev[2], value: snap.size },
      ]);
    });

    return () => {
      unsubAnnonces();
      unsubChats();
      unsubUsers();
    };
  }, []);

  return (
    <div className="mt-12 max-w-5xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col items-center mb-6 gap-2">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                Aperçu du système
            </h3>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">LIVE</span>
            </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
        {stats.map((stat, idx) => {
            const trendValue = parseInt(stat.trend);
            const isPositive = trendValue > 0;
            const isNegative = trendValue < 0;
            const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

            return (
            <div
                key={idx}
                className={`p-4 rounded-xl hover:bg-gray-50 transition-all flex flex-col items-center
                ${idx === 2 ? "col-span-2 md:col-span-1 justify-self-center" : ""}`}
            >
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div
                className={`flex items-center justify-center gap-1 text-xs mt-1 ${
                    isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500"
                }`}
                >
                <TrendIcon className="w-3.5 h-3.5" />
                {stat.trend}
                </div>
            </div>
            );
        })}
        </div>

      </Card>
    </div>
  );
}
