"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import Link from "next/link";
import * as Label from "@radix-ui/react-label";
import * as Switch from "@radix-ui/react-switch";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        displayName: user.email,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      alert(`Utilisateur créé avec succès: ${user.email}`);
    } catch (error: any) {
      alert(`Erreur lors de l'inscription: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4 sm:bg-gradient-to-b sm:from-blue-50 sm:via-blue-100 sm:to-purple-100">
      {/* Logo */}
      <div className="flex items-center mb-8 space-x-3 z-10">
        <div className="w-10 h-10 bg-blue-500 sm:bg-gradient-to-br sm:from-blue-500 sm:to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-extrabold text-lg">H</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">HIDDEN</span>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Inscription
        </h2>

        {/* Email */}
        <div className="mb-4">
          <Label.Root className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </Label.Root>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400 text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <Label.Root className="block mb-1 text-sm font-medium text-gray-700">
            Mot de passe
          </Label.Root>
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400 text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center mb-6 gap-3">
          <Switch.Root
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked)}
            className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow transform transition-transform data-[state=checked]:translate-x-5" />
          </Switch.Root>
          <Label.Root className="text-sm text-gray-700 cursor-pointer">
            Se souvenir de moi
          </Label.Root>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 sm:bg-gradient-to-br sm:from-blue-600 sm:to-purple-600 text-white py-3 rounded-lg hover:bg-blue-600 sm:hover:from-blue-700 sm:hover:to-purple-700 transition-colors font-medium mb-4 shadow"
        >
          S’inscrire
        </button>

        {/* Link */}
        <p className="mt-2 text-center text-gray-500 text-sm">
          Déjà un compte?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Connectez-vous
          </Link>
        </p>
      </form>
    </div>
  );
}
