"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Message } from "@/types";

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: any;
  lastMessageObj?: Message;
  deletedFor?: string[]; // 🆕 ajouté pour gérer la suppression individuelle
}

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Chat[]>([]);

  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, orderBy("lastTimestamp", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsWithLastMessage: Chat[] = [];

      for (const docSnap of snapshot.docs) {
        const chatData = docSnap.data();
        const chat: Chat = {
          id: docSnap.id,
          participants: chatData.participants,
          lastMessage: chatData.lastMessage,
          lastTimestamp: chatData.lastTimestamp,
          deletedFor: chatData.deletedFor || [], // 🆕 gestion des suppressions
          lastMessageObj: undefined,
        };

        // ⚠️ Ignorer les chats supprimés pour cet utilisateur
        if (!chat.participants.includes(userId) || chat.deletedFor?.includes(userId)) continue;

        // Charger le dernier message
        const messagesRef = collection(db, "chats", chat.id, "messages");
        const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));
        const messagesSnap = await getDocs(messagesQuery);
        chat.lastMessageObj = messagesSnap.docs[0]
          ? ({
              id: messagesSnap.docs[0].id,
              ...messagesSnap.docs[0].data(),
              read: messagesSnap.docs[0].data().read ?? false,
              senderId: messagesSnap.docs[0].data().senderId ?? "",
            } as Message)
          : undefined;

        chatsWithLastMessage.push(chat);
      }

      setConversations(chatsWithLastMessage);
    });

    return () => unsubscribe();
  }, [userId]);

  return { conversations };
};

// ✅ Fonction pour supprimer un chat uniquement pour un utilisateur
export const deleteChatForUser = async (chatId: string, userId: string) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      deletedFor: arrayUnion(userId),
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du chat :", error);
  }
};
