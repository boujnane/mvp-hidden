import { useEffect, useRef, useState } from "react";
import { User, Message } from "@/types";
import MessageItem from "./MessageItem";
import { ArrowDown } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  handleOfferResponse: (messageId: string, status: "accepted" | "rejected") => void;
}

export default function MessageList({ messages, users, currentUser, handleOfferResponse }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // 🧭 Détection du scroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);

    // Si l'utilisateur revient en bas → on cache la notif
    if (nearBottom && hasNewMessage) {
      setHasNewMessage(false);
    }
  };

  // ⚡ Défilement automatique si on est déjà en bas
  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Si on reçoit un message et qu'on n'est pas en bas → affiche le badge
      setHasNewMessage(true);
    }
  }, [messages]);

  // 🧱 Scroll initial à l'ouverture du chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  // ⬇️ Bouton de scroll manuel vers le bas
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasNewMessage(false);
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Zone de messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto h-full p-2 sm:p-6 space-y-3 sm:space-y-4 max-h-[calc(100vh-320px)]"
      >
        {messages.map((m) => (
          <MessageItem
            key={m.id}
            message={m}
            users={users}
            currentUser={currentUser}
            handleOfferResponse={handleOfferResponse}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Notification de nouveau message */}
      {hasNewMessage && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-gray-700 text-sm hover:bg-gray-100 transition"
        >
          <ArrowDown size={16} />
          Nouveau message
        </button>
      )}
    </div>
  );
}
