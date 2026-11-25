export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  initials: string;
  color: string;
  isOnline?: boolean;
}

export type MessageReactionType = 'heart' | 'like' | 'dislike' | 'laugh' | 'emphasize' | 'question';

export interface MessageReaction {
  userId: string;
  type: MessageReactionType;
  timestamp: number;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // 'me' for local user
  text: string;
  timestamp: number;
  status: MessageStatus;
  isIncoming: boolean;
  reactions?: MessageReaction[];
  replyToMessageId?: string;
}

export interface Conversation {
  id: string;
  title?: string; // custom title or fallback to participant name(s)
  participantIds: string[];
  isGroup: boolean;
  isPinned: boolean;
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: number;
    isIncoming: boolean;
    senderId: string;
  };
  muted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ConversationFilter = 'all' | 'known' | 'unknown' | 'unread';
