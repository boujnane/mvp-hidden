"use client";

import { useState } from "react";
import { User } from "@/types";

interface NewChatModalProps {
  users: User[];
  onClose: () => void;
  onCreateChat: (participantIds: string[]) => void;
}

export default function NewChatModal({ users, onClose, onCreateChat }: NewChatModalProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const toggleUserSelection = (id: string) => {
    // sélection unique : si on clique sur le même utilisateur, on le désélectionne
    setSelectedUser(prev => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Nouvelle conversation</h2>

        <div className="max-h-64 overflow-y-auto mb-4">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => toggleUserSelection(u.id)}
              className={`w-full text-left p-2 rounded mb-1 border ${
                selectedUser === u.id ? "border-blue-600 bg-blue-50" : "border-gray-200"
              }`}
            >
              {u.displayName}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => selectedUser && onCreateChat([selectedUser])}
            className={`px-4 py-2 rounded text-white transition ${
              selectedUser ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!selectedUser}
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
