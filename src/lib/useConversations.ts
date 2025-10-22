"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Message } from "./useMessages";

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: any;
  lastMessageObj?: Message;
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
          lastMessageObj: undefined, // par défaut
        };
  
        if (chat.participants.includes(userId)) {
          const messagesRef = collection(db, "chats", chat.id, "messages");
          const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));
          const messagesSnap = await getDocs(messagesQuery);
          chat.lastMessageObj = messagesSnap.docs[0]
            ? {
                id: messagesSnap.docs[0].id,
                ...messagesSnap.docs[0].data(),
                read: messagesSnap.docs[0].data().read ?? false,
                senderId: messagesSnap.docs[0].data().senderId ?? ""
              } as Message
            : undefined;
          chatsWithLastMessage.push(chat);
        }
      }
  
      setConversations(chatsWithLastMessage);
    });
  
    return () => unsubscribe();
  }, [userId]);
  

  return { conversations };
};
