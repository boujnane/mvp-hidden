import { CheckCircle2, CircleX } from "lucide-react";
import clsx from "clsx";
import { Timestamp } from "firebase/firestore";

interface Offer {
  amount: number;
  paymentType: "unique" | "hebdomadaire" | "mensuel";
  status: "pending" | "accepted" | "rejected";
}

interface MessageOfferCardProps {
  offer: Offer;
  isSender: boolean;
  createdAt: Timestamp;
  onAccept: () => void;
  onReject: () => void;
}

export default function MessageOfferCard({
  offer,
  isSender,
  createdAt,
  onAccept,
  onReject,
}: MessageOfferCardProps) {
  const formattedDate = new Date(createdAt.seconds * 1000).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={clsx(
        "relative flex flex-col max-w-[85%] sm:max-w-[260px] p-3 pl-5 rounded-2xl border transition-transform transform hover:scale-[1.02] shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
        isSender
          ? "bg-gradient-to-br from-blue-50 via-white to-blue-100/40 ml-auto border-blue-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-200"
      )}
    >
      {/* Accent bar */}
      <div
        className={clsx(
          "absolute left-0 top-0 h-full w-1.5 rounded-l-xl",
          offer.status === "pending"
            ? "bg-yellow-400"
            : offer.status === "accepted"
            ? "bg-green-500"
            : "bg-red-500"
        )}
      />

      {/* Montant et info */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
        <p className="text-sm font-semibold text-gray-900">💰 {offer.amount} €</p>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>

      {/* Actions ou status */}
      {offer.status === "pending" ? (
        !isSender ? (
          <div className="flex flex-wrap gap-2 mt-1">
            <button
              onClick={onAccept}
              className="flex items-center gap-1 bg-green-600/90 text-white px-3 py-1 text-xs rounded-full hover:bg-green-700 transition-shadow shadow-sm"
            >
              <CheckCircle2 size={14} /> Accepter
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1 bg-red-600/90 text-white px-3 py-1 text-xs rounded-full hover:bg-red-700 transition-shadow shadow-sm"
            >
              <CircleX size={14} /> Refuser
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic mt-1">En attente de réponse…</p>
        )
      ) : (
        <div className="flex items-center gap-1 mt-1 text-xs font-semibold self-start px-2 py-1 rounded-full shadow-sm bg-gray-100">
          {offer.status === "accepted" ? (
            <>
              <CheckCircle2 className="text-green-600" size={16} />
              <span className="text-green-700">Acceptée</span>
            </>
          ) : (
            <>
              <CircleX className="text-red-600" size={16} />
              <span className="text-red-700">Refusée</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
