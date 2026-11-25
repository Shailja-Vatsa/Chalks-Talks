import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Contact, Conversation, Message, MessageStatus } from '../types';
import { storageService } from '../services/storage';

interface MessagesContextType {
  contacts: Contact[];
  conversations: Conversation[];
  loading: boolean;
  activeTypingConvId: string | null;
  getContactById: (id: string) => Contact | undefined;
  getConversationMessages: (convId: string) => Promise<Message[]>;
  sendMessage: (convId: string, text: string, options?: { simulateReply?: boolean }) => Promise<void>;
  markConversationAsRead: (convId: string) => Promise<void>;
  refresh: () => Promise<void>;
  resetData: () => Promise<void>;
  onMessagesChange: (listener: (convId: string) => void) => () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

// Realistic auto-reply canned responses matching Apple keynote / engineering tones
const SIMULATED_RESPONSES = [
  'Sounds great! The team is reviewing the latest build right now.',
  'Thanks for the update. Let’s make sure we test this on both iOS and Android before shipping.',
  'Agreed! The corner radius and haptics feel distinctly Apple.',
  'Got it. I will sync with design and follow up shortly.',
  'Looks fantastic! Looking forward to testing it out on device.',
];

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

  const sendMessage = async (
    convId: string,
    text: string,
    options: { simulateReply?: boolean } = { simulateReply: true }
  ) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Step 1: Immediately save message with 'sending' status
    const initialMessage: Message = {
      id: messageId,
      conversationId: convId,
      senderId: 'me',
      text,
      timestamp: Date.now(),
      status: 'sending',
      isIncoming: false,
    };

    await storageService.saveMessage(convId, initialMessage);
    let updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
    notifyListeners(convId);

    // Step 2: Transition to 'delivered' status after realistic network delay (600ms)
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

            // Wait 2 seconds while contact is typing
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
