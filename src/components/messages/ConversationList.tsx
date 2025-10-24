import Image from "next/image";
import { Trash, Search } from "lucide-react";
import type { User, Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  users: User[];
  currentUserId: string;
  selectedChatId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export default function ConversationList({
  conversations,
  users,
  currentUserId,
  selectedChatId,
  onSelect,
  onDelete,
  searchTerm = "",
  onSearchChange,
}: ConversationListProps) {
  // Filtrage des conversations selon le terme de recherche
  const filteredConversations = conversations.filter((conv) => {
    const otherUserId = conv.participants.find((id) => id !== currentUserId) || conv.participants[0];
    const otherUser = users.find((u) => u.id === otherUserId);
    const name = otherUser?.displayName?.toLowerCase() || "";
    const lastMessage = conv.lastMessage?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || lastMessage.includes(term);
  });

  return (
    <aside className="w-full lg:w-1/4 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden max-h-[33vh] lg:max-h-full">
      
      {/* Recherche */}
      <div className="p-2 sm:p-4 border-b border-gray-100 flex items-center gap-2">
        <Search size={16} className="text-gray-500" />
        <input
          placeholder="Rechercher..."
          className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {filteredConversations.map((conv) => {
          const otherUserId = conv.participants.find((id) => id !== currentUserId) || conv.participants[0];
          const otherUser = users.find((u) => u.id === otherUserId);

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`cursor-pointer p-2 sm:p-4 flex items-center gap-2 sm:gap-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                selectedChatId === conv.id ? "bg-blue-50/60" : ""
              }`}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {otherUser?.avatar ? (
                  <Image
                    src={otherUser.avatar}
                    alt={otherUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-medium text-xs sm:text-sm">
                    {otherUser?.displayName?.slice(0, 2).toUpperCase() || "??"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                {otherUser?.displayName || "Utilisateur inconnu"}
              </span>

              {/* Conteneur date + poubelle */}
              <div className="flex items-center ml-auto gap-2">
                <span className="text-xs text-gray-500">
                  {conv.lastTimestamp
                    ? new Date(conv.lastTimestamp.seconds * 1000).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })
                    : ""}
                </span>
                <div
      onClick={(e) => {
        e.stopPropagation();
        onDelete(conv.id);
      }}
      className="p-2 hover:bg-red-100 rounded-full transition cursor-pointer"
      title="Supprimer la conversation"
    >
      <Trash size={16} className="text-red-500" />
    </div>
  </div>
</div>

                <p className="text-xs sm:text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="flex items-center justify-center p-4 text-gray-400 text-sm">
            Aucune conversation trouvée.
          </div>
        )}
      </div>
    </aside>
  );
}
