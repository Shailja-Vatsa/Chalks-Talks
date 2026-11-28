import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Contact, Conversation, Message, MessageReactionType, MessageStatus, Attachment, LinkPreview } from '../types';
import { storageService } from '../services/storage';

interface MessagesContextType {
  contacts: Contact[];
  conversations: Conversation[];
  loading: boolean;
  activeTypingConvId: string | null;
  getContactById: (id: string) => Contact | undefined;
  getConversationMessages: (convId: string) => Promise<Message[]>;
  sendMessage: (
    convId: string,
    text: string,
    options?: {
      simulateReply?: boolean;
      replyToMessageId?: string;
      replyToPreview?: { text: string; senderName: string };
      attachment?: Attachment;
      linkPreview?: LinkPreview;
    }
  ) => Promise<void>;
  createConversation: (participantIds: string[], title?: string) => Promise<Conversation>;
  updateConversationDetails: (convId: string, updates: Partial<Conversation>) => Promise<void>;
  addParticipant: (convId: string, contactId: string) => Promise<void>;
  removeParticipant: (convId: string, contactId: string) => Promise<void>;
  editMessage: (convId: string, messageId: string, newText: string) => Promise<void>;
  deleteMessage: (convId: string, messageId: string) => Promise<void>;
  toggleReaction: (convId: string, messageId: string, type: MessageReactionType) => Promise<void>;
  markConversationAsRead: (convId: string) => Promise<void>;
  refresh: () => Promise<void>;
  resetData: () => Promise<void>;
  onMessagesChange: (listener: (convId: string) => void) => () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

const SIMULATED_RESPONSES = [
  'Sounds great! The team is reviewing the latest build right now.',
  'Thanks for the update. Let’s make sure we test this on both iOS and Android before shipping.',
  'Agreed! The corner radius and haptics feel distinctly Apple.',
  'Got it. I will sync with design and follow up shortly.',
  'Looks fantastic! Looking forward to testing it out on device.',
];

const parsePotentialLink = (text: string): LinkPreview | undefined => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  if (!match) return undefined;

  const url = match[0];
  try {
    const domain = url.replace('https://', '').replace('http://', '').split('/')[0];
    if (domain.includes('apple.com')) {
      return {
        url,
        domain: 'apple.com',
        title: 'Apple — Experience innovation and design',
        imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      };
    }
    return {
      url,
      domain,
      title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Official Website`,
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    };
  } catch {
    return undefined;
  }
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTypingConvId, setActiveTypingConvId] = useState<string | null>(null);
  const listeners = React.useRef<Set<(convId: string) => void>>(new Set());

  const notifyListeners = (convId: string) => {
    listeners.current.forEach((fn) => fn(convId));
  };

  const onMessagesChange = useCallback((listener: (convId: string) => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const loadData = async () => {
    try {
      await storageService.initStorage();
      const [loadedContacts, loadedConversations] = await Promise.all([
        storageService.getContacts(),
        storageService.getConversations(),
      ]);
      setContacts(loadedContacts);
      setConversations(loadedConversations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getContactById = (id: string): Contact | undefined => {
    return contacts.find((c) => c.id === id);
  };

  const getConversationMessages = async (convId: string): Promise<Message[]> => {
    return await storageService.getMessages(convId);
  };

  const markConversationAsRead = async (convId: string) => {
    await storageService.markConversationRead(convId);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
  };

  const createConversation = async (participantIds: string[], title?: string): Promise<Conversation> => {
    const isGroup = participantIds.length > 1;
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: title || (isGroup ? 'New Group' : undefined),
      participantIds,
      isGroup,
      isPinned: false,
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const currentConvs = await storageService.getConversations();
    const updated = [newConv, ...currentConvs];
    await storageService.saveConversations(updated);
    setConversations(updated);
    return newConv;
  };

  const updateConversationDetails = async (convId: string, updates: Partial<Conversation>) => {
    await storageService.updateConversation(convId, updates);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);
  };

  const addParticipant = async (convId: string, contactId: string) => {
    await storageService.addParticipantToGroup(convId, contactId);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);
  };

  const removeParticipant = async (convId: string, contactId: string) => {
    await storageService.removeParticipantFromGroup(convId, contactId);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);
  };

  const sendMessage = async (
    convId: string,
    text: string,
    options: {
      simulateReply?: boolean;
      replyToMessageId?: string;
      replyToPreview?: { text: string; senderName: string };
      attachment?: Attachment;
      linkPreview?: LinkPreview;
    } = { simulateReply: true }
  ) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const detectedLink = options.linkPreview || parsePotentialLink(text);

    const initialMessage: Message = {
      id: messageId,
      conversationId: convId,
      senderId: 'me',
      text,
      timestamp: Date.now(),
      status: 'sending',
      isIncoming: false,
      replyToMessageId: options.replyToMessageId,
      replyToPreview: options.replyToPreview,
      attachments: options.attachment ? [options.attachment] : undefined,
      linkPreview: detectedLink,
    };

    await storageService.saveMessage(convId, initialMessage);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);

    // Step 2: Transition to 'delivered' status after 600ms
    setTimeout(async () => {
      await storageService.updateMessageStatus(convId, messageId, 'delivered');
      notifyListeners(convId);

      // Step 3: Transition to 'read' status after 1200ms
      setTimeout(async () => {
        await storageService.updateMessageStatus(convId, messageId, 'read');
        notifyListeners(convId);

        // Step 4: Simulate typing indicator and incoming reply if enabled
        if (options.simulateReply !== false) {
          setTimeout(async () => {
            setActiveTypingConvId(convId);
            notifyListeners(convId);

            setTimeout(async () => {
              setActiveTypingConvId(null);
              const targetConv = (await storageService.getConversations()).find((c) => c.id === convId);
              const senderId = targetConv?.participantIds[0] || 'contact-craig';
              
              const randomReply =
                SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];

              const replyMessage: Message = {
                id: `reply-${Date.now()}`,
                conversationId: convId,
                senderId,
                text: randomReply,
                timestamp: Date.now(),
                status: 'delivered',
                isIncoming: true,
              };

              await storageService.saveMessage(convId, replyMessage);
              const freshConvs = await storageService.getConversations();
              setConversations(freshConvs);
              notifyListeners(convId);
            }, 2000);
          }, 800);
        }
      }, 1200);
    }, 600);
  };

  const editMessage = async (convId: string, messageId: string, newText: string) => {
    await storageService.updateMessageText(convId, messageId, newText);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);
  };

  const deleteMessage = async (convId: string, messageId: string) => {
    await storageService.deleteMessage(convId, messageId);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);
  };

  const toggleReaction = async (convId: string, messageId: string, type: MessageReactionType) => {
    await storageService.toggleReaction(convId, messageId, 'me', type);
    notifyListeners(convId);
  };

  const resetData = async () => {
    await storageService.resetToSeed();
    await loadData();
  };

  return (
    <MessagesContext.Provider
      value={{
        contacts,
        conversations,
        loading,
        activeTypingConvId,
        getContactById,
        getConversationMessages,
        sendMessage,
        createConversation,
        updateConversationDetails,
        addParticipant,
        removeParticipant,
        editMessage,
        deleteMessage,
        toggleReaction,
        markConversationAsRead,
        refresh: loadData,
        resetData,
        onMessagesChange,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
