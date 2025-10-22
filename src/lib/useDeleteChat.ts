import { doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const deleteChat = async (chatId: string) => {
  try {
    await deleteDoc(doc(db, "chats", chatId));
    console.log("Chat supprimé :", chatId);
  } catch (error) {
    console.error("Erreur suppression chat :", error);
    throw error;
  }
};
