"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Search, Send, Paperclip, Smile, ChevronLeft, Circle, Plus } from "lucide-react";
import { useRouter } from "next/navigation"; 
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useAuth } from "@/lib/FirbaseAuthProvider";
import { useConversations } from "@/lib/useConversations";
import { useMessages } from "@/lib/useMessages";
import { useUsers } from "@/lib/useUsers";
import { createChat } from "@/lib/useCreateChat";

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations } = useConversations(user?.uid || "");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { messages, sendMessage } = useMessages(selectedChatId || "", user?.uid);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // --- Modal pour nouvelle conversation
  const { users } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSend = async () => {
    if (!message.trim() || !selectedChatId || !user) return;
    await sendMessage(message, user.uid);
    setMessage("");
  };

  const handleCreateChat = async () => {
    if (!user || selectedUsers.length < 1) return;
    try {
      const participantIds = [user.uid, ...selectedUsers];
      const newChatId = await createChat(participantIds);
      setSelectedChatId(newChatId);
      setShowModal(false);
      setSelectedUsers([]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const selectedChat = conversations.find(c => c.id === selectedChatId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 relative flex flex-col">
        <div className="absolute inset-0 bg-[url('/background_pattern.svg')] opacity-5 pointer-events-none" />
        <Header />
        <div className="container mx-auto max-w-7xl px-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Messagerie</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Nouvelle conversation
          </button>
        </div>

        <main className="flex-1 container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 max-w-7xl">
          {/* Conversations list */}
          <aside className="w-full lg:w-1/4 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Search size={16} className="text-gray-500" />
              <input
                placeholder="Rechercher une conversation..."
                className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChatId(conv.id)}
                  className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                    selectedChatId === conv.id ? "bg-blue-50/60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 truncate">
                        Chat: {conv.id}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {conv.lastTimestamp
                          ? new Date(conv.lastTimestamp.seconds * 1000).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  <Circle size={8} className="text-blue-500 fill-blue-500" />
                </button>
              ))}
            </div>
          </aside>

          {/* Chat area */}
          <section className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Sélectionnez une conversation pour commencer.
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="lg:hidden p-1 rounded hover:bg-gray-100 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-semibold text-gray-900">Chat: {selectedChat.id}</h2>
                    <p className="text-xs text-green-600">En ligne</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm max-w-xs ${
                          m.senderId === user?.uid
                            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {m.text}
                        <div className="text-[10px] mt-1 opacity-70">
                          {new Date(m.createdAt.seconds * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Paperclip size={18} className="text-gray-500" />
                  </button>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Smile size={18} className="text-gray-500" />
                  </button>
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full p-2 hover:scale-[1.05] transition-transform"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </main>

        {/* Modal Nouvelle conversation */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Nouvelle conversation</h2>
              <div className="max-h-64 overflow-y-auto mb-4">
                {users.filter(u => u.id !== user?.uid).map(u => (
                  <button
                    key={u.id}
                    onClick={() => toggleUserSelection(u.id)}
                    className={`w-full text-left p-2 rounded mb-1 border ${
                      selectedUsers.includes(u.id) ? "border-blue-600 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    {u.displayName}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateChat}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
