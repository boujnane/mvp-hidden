import { User, Message } from "@/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  handleOfferResponse: (messageId: string, status: "accepted" | "rejected") => void; // ⚡ ajouter
}

export default function MessageList({ messages, users, currentUser, handleOfferResponse }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-3 sm:space-y-4 max-h-[calc(100vh-320px)]">
      {messages.map(m => (
        <MessageItem
          key={m.id}
          message={m}
          users={users}
          currentUser={currentUser}
          handleOfferResponse={handleOfferResponse} // ⚡ passer en props
        />
      ))}
    </div>
  );
}
