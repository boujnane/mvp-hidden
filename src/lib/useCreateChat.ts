// lib/useCreateChat.ts
"use client";

import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export const createChat = async (participantIds: string[], annonceId?: string) => {
  if (participantIds.length < 2) throw new Error("Il faut au moins deux participants");

  const chatRef = await addDoc(collection(db, "chats"), {
    participants: participantIds,
    annonceId: annonceId || null,
    lastMessage: "",
    lastTimestamp: Timestamp.now(),
  });

  return chatRef.id;
};
