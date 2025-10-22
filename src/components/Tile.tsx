// src/components/Tile.tsx
import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card } from "@radix-ui/themes";

interface TileProps {
  label: string;
  Icon: LucideIcon;
  href?: string;
  description?: string;
  category?: string;
  comingSoon?: boolean;
  children?: React.ReactNode; // <- important pour badge
}

const Tile: React.FC<TileProps> = ({
  label,
  Icon,
  href,
  description,
  category,
  comingSoon,
  children, // <- récupérer children
}) => {
  const content = (
    <Card
      className={`relative flex flex-col items-center justify-between text-center h-[360px] p-12 rounded-3xl shadow-md transition-all duration-300
        ${
          comingSoon
            ? "bg-gray-100 border border-gray-200 opacity-75 cursor-not-allowed"
            : "bg-white hover:shadow-xl hover:scale-[1.03] border border-gray-100 cursor-pointer"
        }`}
    >
      {/* Category badge */}
      {category && (
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full shadow-sm ${
            comingSoon
              ? "bg-gray-200 text-gray-500"
              : "bg-gray-50 text-gray-400"
          }`}
        >
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

      {/* Icon + badge */}
      <div className="flex items-center justify-center mb-5 relative">
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm transition-all duration-200
            ${
              comingSoon
                ? "bg-gray-200"
                : "bg-gradient-to-br from-gray-50 to-white border border-gray-100 group-hover:border-blue-300"
            }`}
        >
          <Icon
            className={`w-8 h-8 ${
              comingSoon
                ? "text-gray-400"
                : "text-gray-600 hover:text-blue-600 transition-colors"
            }`}
          />
        </div>

        {/* Ici on affiche le badge si passé en children */}
        {children && <>{children}</>}
      </div>

      {/* Title */}
      <h3
        className={`font-semibold text-lg mb-2 ${
          comingSoon
            ? "text-gray-500"
            : "text-gray-800 hover:text-blue-900 transition-colors"
        }`}
      >
        {label}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`text-sm leading-relaxed max-w-[220px] ${
            comingSoon ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      )}
    </Card>
  );

  if (comingSoon || !href) return content;

  return <Link href={href}>{content}</Link>;
};

export default Tile;
