import { useState } from "react";
import { useRouter } from "next/navigation";
import { Offer, User } from "@/types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "@/lib/useChat";
import { getOtherUser } from "@/utils/getOtherUser";

interface ChatWindowProps {
  selectedChatId: string | null;
  users: User[];
  currentUser: User | null;
}

export default function ChatWindow({ selectedChatId, users, currentUser }: ChatWindowProps) {
  const router = useRouter();
  const { messages, handleOfferResponse, sendMessage, sendOffer, participants } = useChat(currentUser?.id, selectedChatId);
  const [message, setMessage] = useState("");

  if (!selectedChatId || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Sélectionnez une conversation pour commencer.
      </div>
    );
  }

  const otherUser = participants ? getOtherUser(users, participants, currentUser.id) : undefined;

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message); // string
    setMessage("");
  };

  const handleSendOffer = async (offer: Offer) => {
    await sendOffer(offer); // ⚡ envoi correctement l'objet offer
  };
  

  return (
    <section className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      <ChatHeader otherUser={otherUser} router={router} />
      <MessageList messages={messages} currentUser={currentUser} users={users} handleOfferResponse={handleOfferResponse} />
      <MessageInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onSendOffer={handleSendOffer}
      />
    </section>
  );
}
