import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Conversation, Contact } from '../types';
import { Avatar } from './Avatar';
import { AppleColors, AppleTypography, AppleSpacing } from '../constants/theme';

interface PinnedConversationItemProps {
  conversation: Conversation;
  participant?: Contact;
  onPress: () => void;
}

export const PinnedConversationItem: React.FC<PinnedConversationItemProps> = ({
  conversation,
  participant,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const displayName = conversation.isGroup
    ? (conversation.title || 'Group')
    : (participant?.firstName || participant?.fullName || 'Contact');

  const initials = participant?.initials || displayName.substring(0, 2).toUpperCase();
  const avatarColor = participant?.color || AppleColors.avatarColors[0];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatarWrapper}>
        <Avatar
          initials={initials}
          size={74}
          backgroundColor={avatarColor}
        />
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <View style={styles.unreadDot} />
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
        ]}
      >
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 86,
    marginHorizontal: 4,
    marginBottom: AppleSpacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
    // subtle Apple shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppleColors.systemBlue,
  },
  name: {
    ...AppleTypography.caption1,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
