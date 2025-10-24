"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useAuth } from "@/lib/FirbaseAuthProvider";
import { useConversations, deleteChatForUser } from "@/lib/useConversations";
import { useUsers } from "@/lib/useUsers";
import { createChat } from "@/lib/useCreateChat";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";
import NewChatModal from "@/components/messages/NewChatModal";
import { mapFirebaseUserToUser } from "@/lib/tranformeUser";
import { User } from "@/types";
import { ChevronLeft } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations } = useConversations(user?.uid || "");
  const { users } = useUsers();
  const params = useParams();
  const router = useRouter();
  const currentUser: User | null = user ? mapFirebaseUserToUser(user) : null;
  const [searchTerm, setSearchTerm] = useState("");

  const chatIdFromUrl = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId || null;
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromUrl);
  const [showModal, setShowModal] = useState(false);

  const handleSelectConversation = (id: string) => {
    setSelectedChatId(id);
    router.push(`/messages/${id}`);
  };
  

  const handleDeleteConversation = async (id: string) => {
    if (!user?.uid) return;
    if (confirm("Supprimer cette conversation pour vous ?")) {
      await deleteChatForUser(id, user.uid);
      if (id === selectedChatId) router.push("/messages");
    }
  };

  const handleCreateChat = async (participantIds: string[]) => {
    if (!user) return;
    const newChatId = await createChat([user.uid, ...participantIds]);
    setShowModal(false);
    setSelectedChatId(newChatId);
    router.push(`/messages/${newChatId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 flex flex-col relative">
        {/* Bouton Retour */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center z-10"
          title="Retour au menu"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>

        <div className="container mx-auto max-w-7xl px-4 mt-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 pl-10 sm:pl-0">
            Messagerie
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Nouvelle conversation
          </button>
        </div>

        <main className="h-[calc(100vh-6rem)] flex container mx-auto px-2 sm:px-4 py-4 flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl">
          <ConversationList
            conversations={conversations}
            users={users}
            currentUserId={user?.uid || ""}
            selectedChatId={selectedChatId}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteConversation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <ChatWindow selectedChatId={selectedChatId} users={users} currentUser={currentUser} />
        </main>


        {showModal && (
          <NewChatModal
            users={users.filter(u => u.id !== user?.uid)}
            onClose={() => setShowModal(false)}
            onCreateChat={handleCreateChat}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
