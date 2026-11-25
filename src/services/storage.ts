import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Conversation, Message, MessageStatus } from '../types';
import { MOCK_CONTACTS, MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../data/mockData';

const STORAGE_KEYS = {
  CONTACTS: '@apple_messages_contacts_v1',
  CONVERSATIONS: '@apple_messages_conversations_v1',
  MESSAGES: '@apple_messages_messages_v1',
};

class StorageService {
  async initStorage(): Promise<void> {
    try {
      const existingContacts = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (!existingContacts) {
        await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(MOCK_CONTACTS));
      }

      const existingConversations = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!existingConversations) {
        await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(MOCK_CONVERSATIONS));
      }

      const existingMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!existingMessages) {
        await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(MOCK_MESSAGES));
      }
    } catch (e) {
      console.warn('Failed to initialize local persistence:', e);
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : MOCK_CONTACTS;
    } catch {
      return MOCK_CONTACTS;
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : MOCK_CONVERSATIONS;
    } catch {
      return MOCK_CONVERSATIONS;
    }
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      const allMessages: Record<string, Message[]> = data ? JSON.parse(data) : MOCK_MESSAGES;
      const list = allMessages[conversationId] || [];
      return [...list].sort((a, b) => a.timestamp - b.timestamp);
    } catch {
      return MOCK_MESSAGES[conversationId] || [];
    }
  }

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      const allMessages: Record<string, Message[]> = data ? JSON.parse(data) : { ...MOCK_MESSAGES };
      
      const convList = allMessages[conversationId] ? [...allMessages[conversationId]] : [];
      convList.push(message);
      convList.sort((a, b) => a.timestamp - b.timestamp);
      allMessages[conversationId] = convList;

      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

      // Update or create conversation metadata
      let convs = await this.getConversations();
      let exists = false;
      convs = convs.map((c) => {
        if (c.id === conversationId) {
          exists = true;
          return {
            ...c,
            updatedAt: message.timestamp,
            lastMessage: {
              text: message.text,
              timestamp: message.timestamp,
              isIncoming: message.isIncoming,
              senderId: message.senderId,
            },
          };
        }
        return c;
      });

      if (!exists) {
        convs.unshift({
          id: conversationId,
          participantIds: [message.senderId !== 'me' ? message.senderId : 'contact-craig'],
          isGroup: false,
          isPinned: false,
          unreadCount: message.isIncoming ? 1 : 0,
          createdAt: message.timestamp,
          updatedAt: message.timestamp,
          lastMessage: {
            text: message.text,
            timestamp: message.timestamp,
            isIncoming: message.isIncoming,
            senderId: message.senderId,
          },
        });
      }

      // Re-sort conversations descending by updatedAt
      convs.sort((a, b) => b.updatedAt - a.updatedAt);
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    } catch (e) {
      console.error('Failed to save message:', e);
    }
  }

  async updateMessageStatus(conversationId: string, messageId: string, status: MessageStatus): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      const allMessages: Record<string, Message[]> = data ? JSON.parse(data) : {};
      const convList = allMessages[conversationId];
      if (!convList) return;

      allMessages[conversationId] = convList.map((m) =>
        m.id === messageId ? { ...m, status } : m
      );

      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    } catch (e) {
      console.error('Failed to update message status:', e);
    }
  }

  async markConversationRead(conversationId: string): Promise<void> {
    try {
      const convs = await this.getConversations();
      const updated = convs.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to mark conversation read:', e);
    }
  }

  async resetToSeed(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(MOCK_CONTACTS));
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(MOCK_CONVERSATIONS));
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(MOCK_MESSAGES));
  }
}

export const storageService = new StorageService();
