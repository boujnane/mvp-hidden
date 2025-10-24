import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { User } from "@/types";

interface ChatHeaderProps {
  otherUser?: User;
  router: ReturnType<typeof import("next/navigation").useRouter>;
}

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 70%)`;
  return color;
};

export default function ChatHeader({ otherUser, router }: ChatHeaderProps) {
  const isOnline = otherUser?.lastSeen
    ? (Date.now() - otherUser.lastSeen.seconds * 1000) < 60000
    : false;

  const initials = otherUser?.displayName
    ? otherUser.displayName
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="p-2 sm:p-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
      <button
        onClick={() => router.push("/messages")}
        className="lg:hidden p-1 rounded hover:bg-gray-100 transition"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: otherUser?.avatar ? undefined : stringToColor(initials) }}
        >
          {otherUser?.avatar ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
            {otherUser?.displayName || "Utilisateur inconnu"}
          </h2>
          <p className={`text-xs ${isOnline ? "text-green-600" : "text-gray-400"}`}>
            {isOnline ? "En ligne" : "Hors ligne"}
          </p>
        </div>
      </div>
    </div>
  );
}
