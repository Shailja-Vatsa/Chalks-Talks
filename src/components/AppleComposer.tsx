import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';
import { Message, Attachment } from '../types';

interface AppleComposerProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  onPressAttachmentDrawer?: () => void;
  placeholder?: string;
  replyingTo?: { message: Message; senderName: string } | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onSaveEdit?: (newText: string) => void;
  onCancelEdit?: () => void;
  pendingAttachment?: Attachment | null;
  onRemoveAttachment?: () => void;
}

export const AppleComposer: React.FC<AppleComposerProps> = ({
  onSendMessage,
  onPressAttachmentDrawer,
  placeholder = 'iMessage',
  replyingTo,
  onCancelReply,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
  pendingAttachment,
  onRemoveAttachment,
}) => {
  const [text, setText] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    }
  }, [editingMessage]);

  const canSend = text.trim().length > 0 || !!pendingAttachment;

  const handleSend = () => {
    if (!canSend) return;
    if (editingMessage && onSaveEdit) {
      onSaveEdit(text.trim());
      setText('');
      return;
    }
    onSendMessage(text.trim(), pendingAttachment || undefined);
    setText('');
    onRemoveAttachment?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? AppleColors.backgroundDark
            : AppleColors.backgroundLight,
          borderTopColor: isDark
            ? AppleColors.separatorDark
            : AppleColors.separatorLight,
        },
      ]}
    >
      {/* Replying Banner */}
      {replyingTo && (
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark
                ? AppleColors.secondaryBackgroundDark
                : AppleColors.secondaryBackgroundLight,
            },
          ]}
        >
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerActionLabel}>
              Replying to {replyingTo.senderName}
            </Text>
            <Text numberOfLines={1} style={styles.bannerSnippet}>
              {replyingTo.message.text}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.bannerCloseBtn}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark
                ? AppleColors.secondaryBackgroundDark
                : AppleColors.secondaryBackgroundLight,
            },
          ]}
        >
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerActionLabel}>Editing Message</Text>
            <Text numberOfLines={1} style={styles.bannerSnippet}>
              {editingMessage.text}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelEdit} style={styles.bannerCloseBtn}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Staged Attachment Badge */}
      {pendingAttachment && (
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark
                ? AppleColors.secondaryBackgroundDark
                : AppleColors.secondaryBackgroundLight,
            },
          ]}
        >
          <Ionicons
            name={
              pendingAttachment.type === 'image'
                ? 'image'
                : pendingAttachment.type === 'video'
                ? 'videocam'
                : pendingAttachment.type === 'document'
                ? 'document'
                : 'mic'
            }
            size={18}
            color={AppleColors.systemBlue}
          />
          <View style={[styles.bannerTextCol, { marginLeft: 8 }]}>
            <Text numberOfLines={1} style={styles.bannerActionLabel}>
              {pendingAttachment.name || pendingAttachment.type}
            </Text>
          </View>
          <TouchableOpacity onPress={onRemoveAttachment} style={styles.bannerCloseBtn}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        {/* Plus / App Drawer button */}
        <TouchableOpacity
          activeOpacity={0.6}
          style={[
            styles.actionButton,
            {
              backgroundColor: isDark
                ? AppleColors.secondaryBackgroundDark
                : '#E9E9EB',
            },
          ]}
          onPress={onPressAttachmentDrawer}
        >
          <Ionicons
            name="add"
            size={20}
            color={isDark ? AppleColors.labelDark : AppleColors.secondaryLabelLight}
          />
        </TouchableOpacity>

        {/* Pill-shaped Input Container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark
                ? AppleColors.secondaryBackgroundDark
                : AppleColors.secondaryBackgroundLight,
              borderColor: isDark ? AppleColors.separatorDark : '#E5E5EA',
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
            ]}
            value={text}
            onChangeText={setText}
            placeholder={editingMessage ? 'Edit message' : placeholder}
            placeholderTextColor={
              isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight
            }
            multiline
            maxLength={1000}
            enablesReturnKeyAutomatically
            returnKeyType="default"
            blurOnSubmit={false}
          />

          {/* Audio / Dictation Icon when empty and not editing */}
          {!canSend && !editingMessage && (
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.micButton}
              onPress={onPressAttachmentDrawer}
            >
              <Ionicons
                name="mic"
                size={19}
                color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
              />
            </TouchableOpacity>
          )}

          {/* Send / Checkmark Arrow Button when has text or editing */}
          {canSend && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSend}
              style={[
                styles.sendButton,
                editingMessage && { backgroundColor: AppleColors.systemGreen },
              ]}
            >
              <Ionicons
                name={editingMessage ? 'checkmark' : 'arrow-up'}
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: AppleSpacing.base,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppleRadii.sm,
    marginBottom: 6,
  },
  bannerTextCol: {
    flex: 1,
    marginRight: 8,
  },
  bannerActionLabel: {
    ...AppleTypography.caption2,
    fontWeight: '600',
    color: AppleColors.systemBlue,
  },
  bannerSnippet: {
    ...AppleTypography.caption2,
    fontSize: 11,
    opacity: 0.75,
  },
  bannerCloseBtn: {
    padding: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: AppleRadii.composer,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 38,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    ...AppleTypography.body,
    fontSize: 16,
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  micButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppleColors.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
