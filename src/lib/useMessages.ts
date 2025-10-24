"use client";

import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { Message, Offer } from "@/types";

export const useMessages = (chatId: string, userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId,
          type: data.type,
          text: data.text,
          offer: data.offer,
          createdAt: data.createdAt,
          read: data.read,
        } as Message;
      });
      setMessages(msgs);

      // Marquer les messages reçus comme lus
      snapshot.docs.forEach(async (docSnap) => {
        const msg = docSnap.data() as Message;
        if (!msg.read && msg.senderId !== userId) {
          await updateDoc(
            doc(db, "chats", chatId, "messages", docSnap.id),
            { read: true }
          );
        }
      });
    });

    return () => unsubscribe();
  }, [chatId, userId]);

  const sendMessage = async (text: string, senderId: string) => {
    if (!chatId) return;

    const messageData: Partial<Message> = {
      senderId,
      type: "text",
      text,
      createdAt: Timestamp.now(),
      read: false,
    };

    await addDoc(collection(db, "chats", chatId, "messages"), messageData);

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      lastTimestamp: serverTimestamp(),
    });
  };

  const sendOffer = async (offer: Offer, senderId: string) => {
    if (!chatId) return;

    const messageData: Partial<Message> = {
      senderId,
      type: "offer",
      offer,
      createdAt: Timestamp.now(),
      read: false,
    };

    await addDoc(collection(db, "chats", chatId, "messages"), messageData);

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: `💰 Offre de ${offer.amount}€`,
      lastTimestamp: serverTimestamp(),
    });
  };

  const updateOfferStatus = async (
    messageId: string,
    status: "accepted" | "rejected"
  ) => {
    if (!chatId) return;
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    await updateDoc(messageRef, { "offer.status": status });
  };

  return { messages, sendMessage, sendOffer, updateOfferStatus };
};
