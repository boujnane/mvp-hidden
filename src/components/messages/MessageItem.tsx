import Image from "next/image";
import { User, Message } from "@/types";
import MessageOfferCard from "./MessageOfferCard";

interface MessageItemProps {
  message: Message;
  currentUser: User | null;
  users: User[];
  handleOfferResponse: (messageId: string, status: "accepted" | "rejected") => void;
}

export default function MessageItem({ message, currentUser, users, handleOfferResponse }: MessageItemProps) {
  const isCurrentUser = message.senderId === currentUser?.id;
  const sender = users.find(u => u.id === message.senderId) || { displayName: "Vous", avatar: "" };

  const renderAvatarAndName = !isCurrentUser && (
    <div className="flex items-center mb-1 gap-1 sm:gap-2">
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {sender.avatar ? (
          <Image src={sender.avatar} alt={sender.displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-600 text-[9px] sm:text-xs font-medium">
            {sender.displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-gray-700 text-[10px] sm:text-xs font-medium">{sender.displayName}</span>
    </div>
  );

  // --- Si le message contient une offre ---
  if (message.offer) {
    return (
      <div className="flex flex-col">
        {renderAvatarAndName}
        <MessageOfferCard
          offer={message.offer}
          isSender={isCurrentUser}
          onAccept={() => handleOfferResponse(message.id, "accepted")}
          onReject={() => handleOfferResponse(message.id, "rejected")}
          createdAt={message.createdAt}
        />
      </div>
    );
  }

  // --- Message texte classique ---
  return (
    <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
      {renderAvatarAndName}
      <div className={`
        px-3 py-2 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm max-w-xs sm:max-w-sm break-words
        ${isCurrentUser ? "bg-blue-400 lg:bg-gradient-to-br lg:from-blue-400 lg:to-purple-300 text-white" : "bg-gray-100 text-gray-800"}
      `}>
        {message.text ?? ""} {/* ⚡ fallback pour éviter undefined */}
        <div className="text-[8px] sm:text-[10px] mt-1 opacity-70 text-right">
          {message.createdAt
            ? new Date(message.createdAt.seconds * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            : ""}
        </div>
      </div>
    </div>
  );
}
