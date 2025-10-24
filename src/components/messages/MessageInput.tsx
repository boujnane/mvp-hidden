"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { Smile, Send } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Offer } from "@/types";

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onSendOffer: (offer: Offer) => void;
}

export default function MessageInput({ value, onChange, onSend, onSendOffer }: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerType, setOfferType] = useState<Offer["paymentType"]>("unique");

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(value + emojiData.emoji);
  };

  const handleSendOffer = () => {
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) return alert("Veuillez indiquer un montant 💶");

    const offer: Offer = {
      type: "offer", // ⚡ important pour différencier du texte
      amount,
      paymentType: offerType,
      status: "pending",
    };

    onSendOffer(offer); // ⚡ appel correct à sendOffer
    setOfferAmount("");
  };

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-t border-gray-100 bg-white">
      {/* --- Bouton Offre (Radix Popover) --- */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="p-2 hover:bg-gray-100 rounded-full transition flex items-center justify-center" title="Faire une offre">
            💰
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={8}
            className="z-50 w-[90vw] max-w-xs rounded-2xl border border-gray-200 text-gray-700 bg-white shadow-xl p-4"
          >
            <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">💰 Faire une offre</h3>
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="Montant"
              className="w-full border rounded px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value as Offer["paymentType"])}
              className="w-full border rounded px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unique">Unique</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
            </select>
            <button
              onClick={handleSendOffer}
              className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
            >
              Envoyer
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* --- Champ message --- */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Message..."
        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      {/* --- Emoji --- */}
      <div className="relative">
        <button onClick={() => setShowEmojiPicker(prev => !prev)} className="p-2 hover:bg-gray-100 rounded-full transition">
          <Smile size={18} className="text-gray-500" />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-12 right-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={350} lazyLoadEmojis />
          </div>
        )}
      </div>

      {/* --- Envoyer --- */}
      <button onClick={onSend} className="bg-blue-600 text-white rounded-full p-2.5 hover:scale-[1.05] transition-transform">
        <Send size={18} />
      </button>
    </div>
  );
}
