// lib/useUsers.ts
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export interface User {
  id: string;
  displayName: string;
  avatar?: string;
  lastSeen?: Timestamp; // Firestore timestamp
  isOnline?: boolean;   // Calculé automatiquement
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const allUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        let lastSeen: Timestamp | undefined = undefined;
        let isOnline = false;

        if (data.lastSeen) {
          lastSeen = data.lastSeen as Timestamp;
          // actif dans la dernière minute
          isOnline = (Date.now() - lastSeen.toMillis()) < 60000;
        }

        return {
          id: doc.id,
          displayName: data.displayName,
          avatar: data.avatar,
          lastSeen,
          isOnline,
        } as User;
      });

      setUsers(allUsers);
    });

    return () => unsubscribe();
  }, []);

  return { users };
};
