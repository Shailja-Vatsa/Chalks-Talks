import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Message } from '../types';
import { AppleColors, AppleTypography, AppleRadii, AppleSpacing } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  showStatus?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isFirstInGroup = true,
  isLastInGroup = true,
  showStatus = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isOutgoing = !message.isIncoming;

  const bubbleBackgroundColor = isOutgoing
    ? AppleColors.iMessageBlue
    : isDark
    ? AppleColors.incomingBubbleDark
    : AppleColors.incomingBubbleLight;

  const textColor = isOutgoing
    ? '#FFFFFF'
    : isDark
    ? AppleColors.labelDark
    : AppleColors.labelLight;

  // Authentic iOS iMessage Corner Radii Grouping
  const getBorderRadius = () => {
    const defaultRadius = AppleRadii.bubble;
    const tightRadius = 4;

    if (isOutgoing) {
      return {
        borderTopRightRadius: isFirstInGroup ? defaultRadius : tightRadius,
        borderBottomRightRadius: isLastInGroup ? tightRadius : tightRadius,
        borderTopLeftRadius: defaultRadius,
        borderBottomLeftRadius: defaultRadius,
      };
    } else {
      return {
        borderTopLeftRadius: isFirstInGroup ? defaultRadius : tightRadius,
        borderBottomLeftRadius: isLastInGroup ? tightRadius : tightRadius,
        borderTopRightRadius: defaultRadius,
        borderBottomRightRadius: defaultRadius,
      };
    }
  };

  const reaction = message.reactions?.[0];

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.rowContainer,
          isOutgoing ? styles.outgoingContainer : styles.incomingContainer,
          { marginBottom: isLastInGroup ? 8 : 2 },
        ]}
      >
        <View style={styles.bubbleWrapper}>
          <View
            style={[
              styles.bubble,
              { backgroundColor: bubbleBackgroundColor },
              getBorderRadius(),
            ]}
          >
            <Text style={[styles.messageText, { color: textColor }]}>
              {message.text}
            </Text>
          </View>

          {/* Reaction Tapback Pill */}
          {reaction && (
            <View
              style={[
                styles.tapbackBadge,
                isOutgoing ? styles.tapbackOutgoing : styles.tapbackIncoming,
                {
                  backgroundColor: isDark
                    ? AppleColors.secondaryBackgroundDark
                    : '#FFFFFF',
                  borderColor: isDark ? AppleColors.separatorDark : '#E5E5EA',
                },
              ]}
            >
              {reaction.type === 'heart' && <Ionicons name="heart" size={13} color="#FF2D55" />}
              {reaction.type === 'like' && <Ionicons name="thumbs-up" size={13} color={AppleColors.systemBlue} />}
              {reaction.type === 'dislike' && <Ionicons name="thumbs-down" size={13} color={AppleColors.systemBlue} />}
              {reaction.type === 'laugh' && <Text style={styles.tapbackText}>HA</Text>}
              {reaction.type === 'emphasize' && <Text style={styles.tapbackText}>!!</Text>}
              {reaction.type === 'question' && <Text style={styles.tapbackText}>?</Text>}
            </View>
          )}
        </View>
      </View>

      {/* Outgoing Status Indicator (Delivered / Read) */}
      {isOutgoing && showStatus && isLastInGroup && (
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              {
                color: isDark
                  ? AppleColors.secondaryLabelDark
                  : AppleColors.secondaryLabelLight,
              },
            ]}
          >
            {message.status === 'read'
              ? 'Read'
              : message.status === 'delivered'
              ? 'Delivered'
              : message.status === 'sending'
              ? 'Sending...'
              : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  rowContainer: {
    paddingHorizontal: AppleSpacing.base,
    flexDirection: 'row',
  },
  outgoingContainer: {
    justifyContent: 'flex-end',
  },
  incomingContainer: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    position: 'relative',
    maxWidth: '75%',
  },
  bubble: {
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  messageText: {
    ...AppleTypography.body,
    fontSize: 16,
    lineHeight: 21,
  },
  tapbackBadge: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  tapbackOutgoing: {
    left: -6,
  },
  tapbackIncoming: {
    right: -6,
  },
  tapbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppleColors.systemBlue,
  },
  statusContainer: {
    alignItems: 'flex-end',
    paddingRight: AppleSpacing.base,
    marginTop: -2,
    marginBottom: AppleSpacing.sm,
  },
  statusText: {
    ...AppleTypography.caption2,
    fontSize: 11,
    fontWeight: '400',
  },
});
