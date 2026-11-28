import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Conversation, Contact } from '../types';
import { Avatar } from './Avatar';
import { GroupAvatar } from './GroupAvatar';
import { AppleColors, AppleTypography, AppleSpacing } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ConversationRowProps {
  conversation: Conversation;
  participant?: Contact;
  allParticipants?: Contact[];
  onPress: () => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  participant,
  allParticipants = [],
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isGroup = conversation.isGroup || conversation.participantIds.length > 1;

  const title =
    conversation.title ||
    (isGroup
      ? allParticipants.map((p) => p.firstName).join(', ')
      : participant
      ? participant.fullName
      : 'Unknown');

  const initials = participant?.initials || title.substring(0, 2).toUpperCase();
  const avatarColor = participant?.color || AppleColors.avatarColors[0];

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      style={[
        styles.container,
        { backgroundColor: isDark ? AppleColors.backgroundDark : AppleColors.backgroundLight },
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        {conversation.unreadCount > 0 && <View style={styles.unreadDot} />}
        {isGroup ? (
          <GroupAvatar participants={allParticipants} size={50} />
        ) : (
          <Avatar initials={initials} size={50} backgroundColor={avatarColor} />
        )}
      </View>

      <View
        style={[
          styles.contentContainer,
          {
            borderBottomColor: isDark
              ? AppleColors.separatorDark
              : AppleColors.separatorLight,
          },
        ]}
      >
        <View style={styles.topRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
              conversation.unreadCount > 0 && styles.unreadTitle,
            ]}
          >
            {title}
          </Text>
          <View style={styles.timestampContainer}>
            <Text
              style={[
                styles.timestamp,
                {
                  color:
                    conversation.unreadCount > 0
                      ? AppleColors.systemBlue
                      : isDark
                      ? AppleColors.secondaryLabelDark
                      : AppleColors.secondaryLabelLight,
                },
              ]}
            >
              {formatTimestamp(conversation.lastMessage?.timestamp)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isDark ? AppleColors.tertiaryLabelDark : AppleColors.tertiaryLabelLight}
              style={styles.chevron}
            />
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.subtitle,
            {
              color: isDark
                ? AppleColors.secondaryLabelDark
                : AppleColors.secondaryLabelLight,
            },
            conversation.unreadCount > 0 && [
              styles.unreadSubtitle,
              { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
            ],
          ]}
        >
          {conversation.lastMessage?.text || 'No messages'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: AppleSpacing.base,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: AppleSpacing.md,
    paddingVertical: AppleSpacing.sm + 2,
  },
  unreadDot: {
    position: 'absolute',
    left: -10,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppleColors.systemBlue,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: AppleSpacing.md,
    paddingRight: AppleSpacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...AppleTypography.headline,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    ...AppleTypography.subhead,
    fontSize: 14,
  },
  chevron: {
    marginLeft: 4,
  },
  subtitle: {
    ...AppleTypography.subhead,
    fontSize: 14,
    lineHeight: 18,
  },
  unreadSubtitle: {
    fontWeight: '500',
  },
});
