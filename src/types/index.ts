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

export type AttachmentType = 'image' | 'video' | 'document' | 'audio';

export interface Attachment {
  id: string;
  type: AttachmentType;
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  domain: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // 'me' or contact-id
  text: string;
  timestamp: number;
  status: MessageStatus;
  isIncoming: boolean;
  attachments?: Attachment[];
  linkPreview?: LinkPreview;
  reactions?: MessageReaction[];
  replyToMessageId?: string;
  replyToPreview?: {
    text: string;
    senderName: string;
  };
  isEdited?: boolean;
  editedAt?: number;
}

export interface Conversation {
  id: string;
  title?: string;
  avatarUrl?: string;
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
