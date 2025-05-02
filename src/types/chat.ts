
export interface ConversationPreview {
  id: string;
  otherUser: {
    id?: string;
    pseudonym: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isFromCurrentUser: boolean;
    read: boolean;
  } | null;
}
