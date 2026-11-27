import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message, MessageReactionType } from '../types';
import { AppleColors, AppleTypography, AppleRadii, AppleSpacing } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

interface AppleTapbackModalProps {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
  onSelectReaction: (type: MessageReactionType) => void;
  onCopy: () => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

const REACTIONS: { type: MessageReactionType; label: string; icon: keyof typeof Ionicons.glyphMap; color?: string }[] = [
  { type: 'heart', label: 'Heart', icon: 'heart', color: '#FF2D55' },
  { type: 'like', label: 'Thumbs Up', icon: 'thumbs-up', color: AppleColors.systemBlue },
  { type: 'dislike', label: 'Thumbs Down', icon: 'thumbs-down', color: AppleColors.systemBlue },
  { type: 'laugh', label: 'HaHa', icon: 'happy-outline' },
  { type: 'emphasize', label: 'Exclamation', icon: 'alert-circle-outline' },
  { type: 'question', label: 'Question', icon: 'help-circle-outline' },
];

export const AppleTapbackModal: React.FC<AppleTapbackModalProps> = ({
  visible,
  message,
  onClose,
  onSelectReaction,
  onCopy,
  onReply,
  onEdit,
  onDelete,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible || !message) return null;

  const isOutgoing = !message.isIncoming;
  const existingReaction = message.reactions?.find((r) => r.userId === 'me');

  const handleReactionPress = (type: MessageReactionType) => {
    triggerHaptic('medium');
    onSelectReaction(type);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.contentContainer}>
              {/* Tapback Reaction Bubble Bar */}
              <View
                style={[
                  styles.tapbackBar,
                  {
                    backgroundColor: isDark
                      ? AppleColors.secondaryBackgroundDark
                      : '#FFFFFF',
                    borderColor: isDark ? AppleColors.separatorDark : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                {REACTIONS.map((item) => {
                  const isSelected = existingReaction?.type === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.reactionItem,
                        isSelected && {
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(0,122,255,0.12)',
                        },
                      ]}
                      onPress={() => handleReactionPress(item.type)}
                      activeOpacity={0.6}
                    >
                      {item.type === 'laugh' ? (
                        <Text style={[styles.textEmoji, isSelected && { color: AppleColors.systemBlue }]}>
                          HA
                        </Text>
                      ) : item.type === 'emphasize' ? (
                        <Text style={[styles.textEmoji, isSelected && { color: AppleColors.systemBlue }]}>
                          !!
                        </Text>
                      ) : item.type === 'question' ? (
                        <Text style={[styles.textEmoji, isSelected && { color: AppleColors.systemBlue }]}>
                          ?
                        </Text>
                      ) : (
                        <Ionicons
                          name={item.icon}
                          size={21}
                          color={
                            item.color
                              ? item.color
                              : isDark
                              ? AppleColors.labelDark
                              : AppleColors.labelLight
                          }
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Message Context Bubble Preview */}
              <View
                style={[
                  styles.previewBubble,
                  {
                    backgroundColor: isOutgoing
                      ? AppleColors.iMessageBlue
                      : isDark
                      ? AppleColors.incomingBubbleDark
                      : AppleColors.incomingBubbleLight,
                    alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewText,
                    {
                      color: isOutgoing
                        ? '#FFFFFF'
                        : isDark
                        ? AppleColors.labelDark
                        : AppleColors.labelLight,
                    },
                  ]}
                >
                  {message.text}
                </Text>
              </View>

              {/* iOS Context Action Menu Card */}
              <View
                style={[
                  styles.actionMenuCard,
                  {
                    backgroundColor: isDark
                      ? AppleColors.secondaryBackgroundDark
                      : '#FFFFFF',
                  },
                ]}
              >
                {/* Reply */}
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => {
                    triggerHaptic('light');
                    onReply();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.menuLabel,
                      { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                    ]}
                  >
                    Reply
                  </Text>
                  <Ionicons
                    name="arrow-undo-outline"
                    size={20}
                    color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
                  />
                </TouchableOpacity>

                <View
                  style={[
                    styles.menuSeparator,
                    {
                      backgroundColor: isDark
                        ? AppleColors.separatorDark
                        : AppleColors.separatorLight,
                    },
                  ]}
                />

                {/* Copy */}
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => {
                    triggerHaptic('light');
                    onCopy();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.menuLabel,
                      { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                    ]}
                  >
                    Copy
                  </Text>
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
                  />
                </TouchableOpacity>

                {/* Edit (only available on sent messages) */}
                {isOutgoing && onEdit && (
                  <>
                    <View
                      style={[
                        styles.menuSeparator,
                        {
                          backgroundColor: isDark
                            ? AppleColors.separatorDark
                            : AppleColors.separatorLight,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.menuRow}
                      onPress={() => {
                        triggerHaptic('light');
                        onEdit();
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.menuLabel,
                          { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                        ]}
                      >
                        Edit
                      </Text>
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
                      />
                    </TouchableOpacity>
                  </>
                )}

                <View
                  style={[
                    styles.menuSeparator,
                    {
                      backgroundColor: isDark
                        ? AppleColors.separatorDark
                        : AppleColors.separatorLight,
                    },
                  ]}
                />

                {/* Delete */}
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => {
                    triggerHaptic('medium');
                    onDelete();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.menuLabel, { color: AppleColors.systemRed }]}>
                    Delete
                  </Text>
                  <Ionicons name="trash-outline" size={20} color={AppleColors.systemRed} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppleSpacing.lg,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 340,
  },
  tapbackBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  reactionItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textEmoji: {
    fontSize: 14,
    fontWeight: '800',
    color: '#007AFF',
  },
  previewBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: AppleRadii.bubble,
    maxWidth: '85%',
    marginBottom: 14,
  },
  previewText: {
    ...AppleTypography.body,
    fontSize: 16,
    lineHeight: 21,
  },
  actionMenuCard: {
    borderRadius: AppleRadii.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: 13,
  },
  menuLabel: {
    ...AppleTypography.body,
    fontSize: 17,
  },
  menuSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: AppleSpacing.base,
  },
});
