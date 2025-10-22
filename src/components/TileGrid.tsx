"use client";

import React from "react";
import { LucideIcon, Edit3, MessageCircle, BarChart2, Scale, Calendar } from "lucide-react";
import { Card } from "@radix-ui/themes";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Separator from "@radix-ui/react-separator";
import Link from "next/link";
import { useAuth } from "@/lib/FirbaseAuthProvider";
import { useConversations } from "@/lib/useConversations";

const tileSections = [
  {
    category: "Talents",
    tiles: [
      { label: "Annonces", Icon: Edit3, href: "/annonces", description: "Publications et recherches d'annonces", category: "Talents" },
      { label: "Messages", Icon: MessageCircle, href: "/messages", description: "Communication interne", category: "Talents" },
    ]
  },
  {
    category: "Gestion",
    tiles: [
      { label: "Comptabilité", Icon: BarChart2, comingSoon: true, description: "Analyses financières", category: "Gestion" },
      { label: "Juridique", Icon: Scale, comingSoon: true, description: "Documents et conformité", category: "Gestion" },
      { label: "Agenda", Icon: Calendar, href: "/agenda", description: "Planning et rendez-vous", category: "Gestion" },
    ]
  }
];

interface TileProps {
  label: string;
  Icon: LucideIcon;
  href?: string;
  description?: string;
  category?: string;
  comingSoon?: boolean;
  children?: React.ReactNode;
}

const Tile: React.FC<TileProps> = ({ label, Icon, href, description, category, comingSoon, children }) => {
  const content = (
    <Card
      className={`group relative p-6 flex flex-col items-center text-center rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-2xl ${
        comingSoon ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
    >
      {/* Category badge */}
      {category && (
        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
          comingSoon ? "bg-gray-200 text-gray-500" : "bg-gray-50 text-gray-400"
        }`}>
          {category}
        </span>
      )}

      {/* Coming soon badge */}
      {comingSoon && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold text-white bg-yellow-500 px-2 py-1 rounded-full shadow-sm">
            Bientôt
          </span>
        </div>
      )}

      {/* Icon + Badge */}
      <div className="flex items-center justify-center mb-4 relative">
        <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-white shadow-sm group-hover:shadow-md transition-all duration-200">
          <Icon
            className={`w-7 h-7 ${
              comingSoon
                ? "text-gray-400"
                : "text-gray-600 group-hover:text-blue-600 transition-colors"
            }`}
          />
        </div>

        {/* Badge rouge clignotant */}
        {children}
      </div>

      {/* Title */}
      <h3 className={`font-semibold mb-2 text-lg ${comingSoon ? "text-gray-500" : "text-gray-800 group-hover:text-blue-900"}`}>
        {label}
      </h3>

      {/* Description */}
      {description && <p className={`text-sm leading-relaxed ${comingSoon ? "text-gray-400" : "text-gray-600"}`}>{description}</p>}
    </Card>
  );

  if (comingSoon) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger>{content}</Tooltip.Trigger>
        <Tooltip.Content side="top" className="rounded bg-gray-800 text-white px-2 py-1 text-xs">
          Bientôt disponible
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
};

const TileGrid: React.FC = () => {
  const { user } = useAuth();
  const { conversations } = useConversations(user?.uid);
  console.log("Conversations:", conversations);

  console.log(
    "Derniers messages:", 
    conversations.map(c => ({
      chatId: c.id,
      lastMessage: c.lastMessage,
      read: c.lastMessageObj?.read
    }))
  );
  // Vérifie s’il y a des messages non lus
  const hasUnreadMessages = conversations?.some(chat => {
    const lastMsg = chat.lastMessageObj;
    return lastMsg && !lastMsg.read && lastMsg.senderId !== user?.uid;
  });

  console.log("hasUnreadMessages:", hasUnreadMessages)
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-300 via-blue-200 to-gray-300 py-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Tableau de Bord
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Accédez à l&apos;ensemble de vos outils professionnels dans une interface unifiée et fluide.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {tileSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="relative">
              <div className="flex items-center justify-center mb-8">
                <Separator.Root className="w-full h-px bg-gray-300 relative flex-grow my-0 mx-4" />
                <span className="text-sm font-semibold uppercase text-gray-600 tracking-wider relative px-4 py-1 bg-white/70 rounded-full shadow-sm">
                  {section.category}
                </span>
                <Separator.Root className="w-full h-px bg-gray-300 relative flex-grow my-0 mx-4" />
              </div>

              <div className={`grid grid-cols-1 ${
                section.tiles.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 
                section.tiles.length === 3 ? 'md:grid-cols-3 max-w-4xl mx-auto' : 
                'md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'
              } gap-8`}>
                {section.tiles.map((tile, tileIndex) => (
                  <Tile
                  key={tileIndex}
                  {...tile}
                >
                  {tile.label === "Messages" && hasUnreadMessages && (
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  )}
                </Tile>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TileGrid;
