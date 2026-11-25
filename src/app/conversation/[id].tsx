import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMessages } from '../../context/MessagesContext';
import { Message } from '../../types';
import { MessageBubble } from '../../components/MessageBubble';
import { Avatar } from '../../components/Avatar';
import { AppleComposer } from '../../components/AppleComposer';
import { AppleTypingIndicator } from '../../components/AppleTypingIndicator';
import { AppleColors, AppleTypography, AppleSpacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface MessageGroupItem {
  type: 'date' | 'message';
  dateLabel?: string;
  message?: Message;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  showStatus?: boolean;
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    conversations,
    getContactById,
    getConversationMessages,
    sendMessage,
    markConversationAsRead,
    activeTypingConvId,
    onMessagesChange,
  } = useMessages();

  const conversation = conversations.find((c) => c.id === id);
  const participant = conversation?.participantIds[0]
    ? getContactById(conversation.participantIds[0])
    : undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const title = conversation?.title || participant?.fullName || 'Messages';
  const initials = participant?.initials || title.substring(0, 2).toUpperCase();
  const avatarColor = participant?.color || AppleColors.avatarColors[0];

  const isContactTyping = activeTypingConvId === id;

  const loadMessages = useCallback(async () => {
    if (id) {
      const msgs = await getConversationMessages(id);
      setMessages(msgs);
    }
  }, [id, getConversationMessages]);

  useEffect(() => {
    loadMessages();
    if (id) {
      markConversationAsRead(id);
    }

    // Subscribe to reactive message stream events (status updates, new replies)
    const unsubscribe = onMessagesChange((changedConvId) => {
      if (changedConvId === id) {
        loadMessages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, loadMessages, markConversationAsRead, onMessagesChange]);

  const handleSendMessage = async (text: string) => {
    if (!id) return;
    await sendMessage(id, text);
    await loadMessages();
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  // Group messages with timestamps and grouping flags
  const formatSeparatorDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return `Today ${timeStr}`;
    } else if (diffHours < 48 && d.getDate() === now.getDate() - 1) {
      return `Yesterday ${timeStr}`;
    }
    return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} ${timeStr}`;
  };

  const groupItems: MessageGroupItem[] = [];
  let lastTimestamp = 0;

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    const next = i < messages.length - 1 ? messages[i + 1] : null;

    // Insert date separator if first message or gap > 60 minutes
    if (i === 0 || current.timestamp - lastTimestamp > 60 * 60 * 1000) {
      groupItems.push({
        type: 'date',
        dateLabel: formatSeparatorDate(current.timestamp),
      });
      lastTimestamp = current.timestamp;
    }

    const isFirstInGroup =
      !prev || prev.senderId !== current.senderId || current.timestamp - prev.timestamp > 5 * 60 * 1000;
    const isLastInGroup =
      !next || next.senderId !== current.senderId || next.timestamp - current.timestamp > 5 * 60 * 1000;
    const showStatus = i === messages.length - 1;

    groupItems.push({
      type: 'message',
      message: current,
      isFirstInGroup,
      isLastInGroup,
      showStatus,
    });
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? AppleColors.backgroundDark : AppleColors.backgroundLight },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/conversation/details?id=${id}`)}
              style={styles.headerTitleButton}
            >
              <Avatar
                initials={initials}
                size={34}
                backgroundColor={avatarColor}
              />
              <View style={styles.titleWithChevron}>
                <Text
                  style={[
                    styles.headerTitleText,
                    { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={12}
                  color={isDark ? AppleColors.tertiaryLabelDark : AppleColors.tertiaryLabelLight}
                  style={styles.headerChevron}
                />
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                onPress={() => {}}
                activeOpacity={0.6}
                style={styles.headerActionButton}
              >
                <Ionicons name="videocam" size={23} color={AppleColors.systemBlue} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/conversation/details?id=${id}`)}
                activeOpacity={0.6}
                style={styles.headerActionButton}
              >
                <Ionicons name="information-circle-outline" size={24} color={AppleColors.systemBlue} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Message Stream */}
      <FlatList
        ref={flatListRef}
        data={groupItems}
        keyExtractor={(_, index) => `item-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'date') {
            return (
              <View style={styles.dateSeparatorContainer}>
                <Text
                  style={[
                    styles.dateSeparatorText,
                    {
                      color: isDark
                        ? AppleColors.secondaryLabelDark
                        : AppleColors.secondaryLabelLight,
                    },
                  ]}
                >
                  {item.dateLabel}
                </Text>
              </View>
            );
          }

          if (item.message) {
            return (
              <MessageBubble
                message={item.message}
                isFirstInGroup={item.isFirstInGroup}
                isLastInGroup={item.isLastInGroup}
                showStatus={item.showStatus}
              />
            );
          }
          return null;
        }}
        ListFooterComponent={() => (
          <View>
            {isContactTyping && <AppleTypingIndicator />}
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* iOS Composer */}
      <AppleComposer onSendMessage={handleSendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWithChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerTitleText: {
    ...AppleTypography.caption2,
    fontSize: 12,
    fontWeight: '600',
  },
  headerChevron: {
    marginLeft: 2,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  messagesList: {
    paddingVertical: AppleSpacing.sm,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: AppleSpacing.md,
  },
  dateSeparatorText: {
    ...AppleTypography.caption2,
    fontSize: 12,
    fontWeight: '500',
  },
});
