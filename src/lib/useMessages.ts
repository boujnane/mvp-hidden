"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  read: boolean; // true si le destinataire a lu
}

export const useMessages = (chatId: string, userId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);

      // Marquer les messages non lus comme lus pour le destinataire
      snapshot.docs.forEach(async (docSnap) => {
        const msg = docSnap.data() as Message;
        if (!msg.read && msg.senderId !== userId) {
          await updateDoc(doc(db, "chats", chatId, "messages", docSnap.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [chatId, userId]);

  const sendMessage = async (text: string, senderId: string) => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
      text,
      senderId,
      createdAt: Timestamp.now(),
      read: false
    });

    // Mettre à jour le dernier message dans le chat
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastTimestamp: serverTimestamp(),
    });
  };

  return { messages, sendMessage };
};
