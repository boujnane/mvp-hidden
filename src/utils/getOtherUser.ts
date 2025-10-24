import { User } from "@/types";

/**
 * Récupère l'autre utilisateur dans une conversation.
 *
 * @param users - Liste de tous les utilisateurs
 * @param participants - Liste des ids des participants de la conversation
 * @param currentUserId - Id de l'utilisateur courant
 * @returns L'autre utilisateur ou undefined si non trouvé
 */
export const getOtherUser = (
  users: User[],
  participants: string[],
  currentUserId: string | undefined
): User | undefined => {
  if (!currentUserId) return undefined;
  return users.find(u => participants.includes(u.id) && u.id !== currentUserId);
};
