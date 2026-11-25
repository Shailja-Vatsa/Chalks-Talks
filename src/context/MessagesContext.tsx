import React, { createContext, useContext, useEffect, useState } from 'react';
import { Contact, Conversation, Message } from '../types';
import { storageService } from '../services/storage';

interface MessagesContextType {
  contacts: Contact[];
  conversations: Conversation[];
  loading: boolean;
  getContactById: (id: string) => Contact | undefined;
  getConversationMessages: (convId: string) => Promise<Message[]>;
  sendMessage: (convId: string, text: string) => Promise<void>;
  refresh: () => Promise<void>;
  resetData: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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
    return contacts.find(c => c.id === id);
  };

  const getConversationMessages = async (convId: string): Promise<Message[]> => {
    return await storageService.getMessages(convId);
  };

  const sendMessage = async (convId: string, text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: 'me',
      text,
      timestamp: Date.now(),
      status: 'sent',
      isIncoming: false,
    };
    await storageService.saveMessage(convId, newMessage);
    const updatedConvs = await storageService.getConversations();
    setConversations(updatedConvs);
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
        getContactById,
        getConversationMessages,
        sendMessage,
        refresh: loadData,
        resetData,
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
