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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMessages } from '../../context/MessagesContext';
import { Message, MessageReactionType, Attachment, Contact } from '../../types';
import { MessageBubble } from '../../components/MessageBubble';
import { Avatar } from '../../components/Avatar';
import { GroupAvatar } from '../../components/GroupAvatar';
import { AppleComposer } from '../../components/AppleComposer';
import { AppleTypingIndicator } from '../../components/AppleTypingIndicator';
import { AppleTapbackModal } from '../../components/AppleTapbackModal';
import { AppleAttachmentDrawer } from '../../components/AppleAttachmentDrawer';
import { AppleMediaViewer } from '../../components/AppleMediaViewer';
import { AppleColors, AppleTypography, AppleSpacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface MessageGroupItem {
  type: 'date' | 'message';
  dateLabel?: string;
  message?: Message;
  senderName?: string;
  showSenderHeader?: boolean;
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
    editMessage,
    deleteMessage,
    toggleReaction,
    markConversationAsRead,
    activeTypingConvId,
    onMessagesChange,
  } = useMessages();

  const conversation = conversations.find((c) => c.id === id);
  const isGroup = conversation?.isGroup || (conversation?.participantIds && conversation.participantIds.length > 1);

  const participants: Contact[] = (conversation?.participantIds || [])
    .map((pid) => getContactById(pid))
    .filter((c): c is Contact => !!c);

  const primaryContact = participants[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ message: Message; senderName: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Rich Media State
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [stagedAttachment, setStagedAttachment] = useState<Attachment | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const title =
    conversation?.title ||
    (isGroup
      ? participants.map((p) => p.firstName).join(', ')
      : primaryContact?.fullName || 'Messages');

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

    const unsubscribe = onMessagesChange((changedConvId) => {
      if (changedConvId === id) {
        loadMessages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, loadMessages, markConversationAsRead, onMessagesChange]);

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    if (!id) return;
    const replyOptions = replyingTo
      ? {
          replyToMessageId: replyingTo.message.id,
          replyToPreview: {
            text: replyingTo.message.text,
            senderName: replyingTo.senderName,
          },
        }
      : {};

    setReplyingTo(null);
    setStagedAttachment(null);

    await sendMessage(id, text, {
      ...replyOptions,
      attachment,
    });
    await loadMessages();
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const handleSelectReaction = async (type: MessageReactionType) => {
    if (!id || !selectedMessageForAction) return;
    await toggleReaction(id, selectedMessageForAction.id, type);
    await loadMessages();
  };

  const handleCopyMessage = () => {
    if (!selectedMessageForAction) return;
    Alert.alert('Copied to Clipboard', `"${selectedMessageForAction.text}"`);
  };

  const handleReplyMessage = () => {
    if (!selectedMessageForAction) return;
    const sender = getContactById(selectedMessageForAction.senderId);
    const senderName = selectedMessageForAction.isIncoming
      ? sender?.firstName || 'Contact'
      : 'You';
    setReplyingTo({
      message: selectedMessageForAction,
      senderName,
    });
  };

  const handleEditMessage = () => {
    if (!selectedMessageForAction) return;
    setEditingMessage(selectedMessageForAction);
  };

  const handleSaveEdit = async (newText: string) => {
    if (!id || !editingMessage) return;
    await editMessage(id, editingMessage.id, newText);
    setEditingMessage(null);
    await loadMessages();
  };

  const handleDeleteMessage = async () => {
    if (!id || !selectedMessageForAction) return;
    await deleteMessage(id, selectedMessageForAction.id);
    await loadMessages();
  };

  const handleSendSimulatedAudio = async () => {
    if (!id) return;
    const audioAttachment: Attachment = {
      id: `audio-${Date.now()}`,
      type: 'audio',
      uri: 'simulated_audio.m4a',
      name: 'Audio Message',
      duration: 4,
    };
    await handleSendMessage('', audioAttachment);
  };

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

    if (i === 0 || current.timestamp - lastTimestamp > 60 * 60 * 1000) {
      groupItems.push({
        type: 'date',
        dateLabel: formatSeparatorDate(current.timestamp),
      });
      lastTimestamp = current.timestamp;
    }

    const senderContact = getContactById(current.senderId);
    const senderName = senderContact?.firstName || 'Unknown';

    const isFirstInGroup =
      !prev || prev.senderId !== current.senderId || current.timestamp - prev.timestamp > 5 * 60 * 1000;
    const isLastInGroup =
      !next || next.senderId !== current.senderId || next.timestamp - current.timestamp > 5 * 60 * 1000;
    const showStatus = i === messages.length - 1;
    const showSenderHeader = isGroup && isFirstInGroup && current.isIncoming;

    groupItems.push({
      type: 'message',
      message: current,
      senderName,
      showSenderHeader,
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
              {isGroup ? (
                <GroupAvatar participants={participants} size={34} />
              ) : (
                <Avatar
                  initials={primaryContact?.initials || 'ME'}
                  size={34}
                  backgroundColor={primaryContact?.color || AppleColors.avatarColors[0]}
                />
              )}
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
                senderName={item.senderName}
                showSenderHeader={item.showSenderHeader}
                isFirstInGroup={item.isFirstInGroup}
                isLastInGroup={item.isLastInGroup}
                showStatus={item.showStatus}
                onLongPress={() => setSelectedMessageForAction(item.message!)}
                onPressAttachment={(att) => setViewingAttachment(att)}
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

      {/* Context Action & Tapback Modal */}
      <AppleTapbackModal
        visible={!!selectedMessageForAction}
        message={selectedMessageForAction}
        onClose={() => setSelectedMessageForAction(null)}
        onSelectReaction={handleSelectReaction}
        onCopy={handleCopyMessage}
        onReply={handleReplyMessage}
        onEdit={selectedMessageForAction?.senderId === 'me' ? handleEditMessage : undefined}
        onDelete={handleDeleteMessage}
      />

      {/* Attachment Drawer Modal */}
      <AppleAttachmentDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onSelectAttachment={(att) => setStagedAttachment(att)}
        onSendSimulatedAudio={handleSendSimulatedAudio}
        onInsertEmoji={(emoji) => handleSendMessage(emoji)}
      />

      {/* Full-screen Media Viewer */}
      <AppleMediaViewer
        visible={!!viewingAttachment}
        attachment={viewingAttachment}
        onClose={() => setViewingAttachment(null)}
      />

      {/* iOS Composer supporting rich attachments */}
      <AppleComposer
        onSendMessage={handleSendMessage}
        onPressAttachmentDrawer={() => setDrawerVisible(true)}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={() => setEditingMessage(null)}
        pendingAttachment={stagedAttachment}
        onRemoveAttachment={() => setStagedAttachment(null)}
      />
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
