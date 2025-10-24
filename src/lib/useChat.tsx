"use client";

import { useState } from "react";
import { useConversations } from "./useConversations";
import { useMessages } from "./useMessages";
import { useUsers } from "./useUsers";
import { createChat } from "./useCreateChat";
import { Offer } from "@/types";

export const useChat = (currentUserId?: string, selectedChatId: string | null = null) => {
  const { conversations } = useConversations(currentUserId);
  const {
    messages,
    sendMessage: sendMessageRaw,
    sendOffer: sendOfferRaw,
    updateOfferStatus,
  } = useMessages(selectedChatId || "", currentUserId);
  const { users } = useUsers();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const selectedChat = selectedChatId
    ? conversations.find((c) => c.id === selectedChatId)
    : undefined;
  const participants = selectedChat?.participants || [];

  const otherUser =
    participants.length > 0
      ? users.find((u) => u.id !== currentUserId)
      : undefined;
  const isOnline = otherUser?.lastSeen
    ? Date.now() - otherUser.lastSeen.seconds * 1000 < 60000
    : false;

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !selectedChatId || !currentUserId) return;
    await sendMessageRaw(text, currentUserId);
  };

  const sendOffer = async (offer: Offer) => {
    if (!selectedChatId || !currentUserId) return;
    await sendOfferRaw(offer, currentUserId); // ⚡ important
  };

  const handleOfferResponse = async (
    messageId: string,
    status: "accepted" | "rejected"
  ) => {
    await updateOfferStatus(messageId, status);
  };

  const createNewChat = async () => {
    if (!currentUserId || selectedUsers.length < 1) return null;
    const newChatId = await createChat([currentUserId, ...selectedUsers]);
    setSelectedUsers([]);
    return newChatId;
  };

  return {
    conversations,
    users,
    messages,
    sendMessage,
    sendOffer,
    handleOfferResponse,
    createNewChat,
    selectedUsers,
    toggleUserSelection,
    otherUser,
    isOnline,
    participants,
  };
};
