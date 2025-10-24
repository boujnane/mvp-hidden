// types/index.ts
import { Timestamp } from "firebase/firestore";

export type PaymentType = "unique" | "hebdomadaire" | "mensuel";
export type OfferStatus = "pending" | "accepted" | "rejected";

export interface Offer {
  type: "offer"; // obligatoire
  amount: number;
  paymentType: "unique" | "hebdomadaire" | "mensuel";
  status: "pending" | "accepted" | "rejected";
}

export interface Message {
  id: string;
  senderId: string;
  type: "text" | "offer"; // type obligatoire
  text?: string;           // uniquement si type === "text"
  offer?: Offer;           // uniquement si type === "offer"
  createdAt: Timestamp;
  read: boolean;
}


export interface User {
  id: string;
  displayName: string;
  avatar?: string;
  lastSeen?: Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: Timestamp;
}
