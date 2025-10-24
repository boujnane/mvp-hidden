// lib/transformUser.ts
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types";

export const mapFirebaseUserToUser = (fbUser: FirebaseUser): User => ({
  id: fbUser.uid,
  displayName: fbUser.displayName || "Utilisateur",
  avatar: fbUser.photoURL || undefined,
  lastSeen: undefined, // tu peux récupérer si tu stockes la dernière connexion
});
