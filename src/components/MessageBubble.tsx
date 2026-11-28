import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  Linking,
} from 'react-native';
import { Message, Attachment } from '../types';
import { AppleColors, AppleTypography, AppleRadii, AppleSpacing } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

interface MessageBubbleProps {
  message: Message;
  senderName?: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  showStatus?: boolean;
  showSenderHeader?: boolean;
  onLongPress?: () => void;
  onPressAttachment?: (attachment: Attachment) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  senderName,
  isFirstInGroup = true,
  isLastInGroup = true,
  showStatus = false,
  showSenderHeader = false,
  onLongPress,
  onPressAttachment,
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

  const reaction = message.reactions?.[message.reactions.length - 1];

  const handleLongPress = () => {
    triggerHaptic('medium');
    onLongPress?.();
  };

  const attachment = message.attachments?.[0];

  return (
    <View style={styles.outerContainer}>
      {/* Group Sender Header Name for Incoming Messages */}
      {showSenderHeader && senderName && !isOutgoing && (
        <View style={styles.senderHeaderContainer}>
          <Text
            style={[
              styles.senderHeaderText,
              { color: isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight },
            ]}
          >
            {senderName}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.rowContainer,
          isOutgoing ? styles.outgoingContainer : styles.incomingContainer,
          { marginBottom: isLastInGroup ? 8 : 2 },
        ]}
      >
        <View style={styles.bubbleWrapper}>
          {/* Replied Context Pill */}
          {message.replyToPreview && (
            <View
              style={[
                styles.replyContextContainer,
                isOutgoing ? styles.replyOutgoing : styles.replyIncoming,
              ]}
            >
              <Text style={styles.replySenderText}>
                {message.replyToPreview.senderName}
              </Text>
              <Text numberOfLines={1} style={styles.replySnippetText}>
                {message.replyToPreview.text}
              </Text>
            </View>
          )}

          {/* Attachment Renderers */}
          {attachment && (
            <View style={styles.attachmentWrapper}>
              {(attachment.type === 'image' || attachment.type === 'video') && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => onPressAttachment?.(attachment)}
                  onLongPress={handleLongPress}
                  style={styles.imageAttachmentContainer}
                >
                  <Image source={{ uri: attachment.uri }} style={styles.imageThumbnail} />
                  {attachment.type === 'video' && (
                    <View style={styles.videoBadge}>
                      <Ionicons name="play" size={20} color="#FFFFFF" />
                      {attachment.duration && (
                        <Text style={styles.videoDurationText}>0:{attachment.duration}</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {attachment.type === 'document' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onLongPress={handleLongPress}
                  onPress={() => triggerHaptic('light')}
                  style={[
                    styles.documentContainer,
                    { backgroundColor: bubbleBackgroundColor },
                    getBorderRadius(),
                  ]}
                >
                  <View style={styles.docIconBox}>
                    <Ionicons name="document-text" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.docDetails}>
                    <Text numberOfLines={1} style={[styles.docName, { color: textColor }]}>
                      {attachment.name || 'Document'}
                    </Text>
                    {attachment.size && (
                      <Text style={[styles.docSize, { color: isOutgoing ? 'rgba(255,255,255,0.7)' : AppleColors.secondaryLabelLight }]}>
                        {Math.round(attachment.size / 1024)} KB
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {attachment.type === 'audio' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onLongPress={handleLongPress}
                  onPress={() => triggerHaptic('light')}
                  style={[
                    styles.audioContainer,
                    { backgroundColor: bubbleBackgroundColor },
                    getBorderRadius(),
                  ]}
                >
                  <View style={styles.audioPlayBtn}>
                    <Ionicons
                      name="play"
                      size={18}
                      color={isOutgoing ? AppleColors.systemBlue : '#FFFFFF'}
                    />
                  </View>
                  <View style={styles.waveformContainer}>
                    <View style={[styles.waveBar, { height: 8, backgroundColor: textColor }]} />
                    <View style={[styles.waveBar, { height: 16, backgroundColor: textColor }]} />
                    <View style={[styles.waveBar, { height: 22, backgroundColor: textColor }]} />
                    <View style={[styles.waveBar, { height: 14, backgroundColor: textColor }]} />
                    <View style={[styles.waveBar, { height: 18, backgroundColor: textColor }]} />
                    <View style={[styles.waveBar, { height: 10, backgroundColor: textColor }]} />
                    <View style={[styles.waveBar, { height: 20, backgroundColor: textColor }]} />
                  </View>
                  <Text style={[styles.audioDuration, { color: textColor }]}>
                    0:0{attachment.duration || 4}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Text Message Bubble */}
          {message.text ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onLongPress={handleLongPress}
              delayLongPress={280}
              style={[
                styles.bubble,
                { backgroundColor: bubbleBackgroundColor },
                getBorderRadius(),
              ]}
            >
              <Text style={[styles.messageText, { color: textColor }]}>
                {message.text}
              </Text>

              {message.isEdited && (
                <Text
                  style={[
                    styles.editedTag,
                    { color: isOutgoing ? 'rgba(255,255,255,0.7)' : AppleColors.secondaryLabelLight },
                  ]}
                >
                  Edited
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Rich Link Preview Card */}
          {message.linkPreview && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Linking.openURL(message.linkPreview!.url)}
              onLongPress={handleLongPress}
              style={[
                styles.linkPreviewCard,
                {
                  backgroundColor: isDark
                    ? AppleColors.secondaryBackgroundDark
                    : '#FFFFFF',
                  borderColor: isDark ? AppleColors.separatorDark : '#E5E5EA',
                },
              ]}
            >
              {message.linkPreview.imageUrl && (
                <Image
                  source={{ uri: message.linkPreview.imageUrl }}
                  style={styles.linkImage}
                />
              )}
              <View style={styles.linkInfo}>
                <Text numberOfLines={1} style={[styles.linkDomain, { color: AppleColors.secondaryLabelLight }]}>
                  {message.linkPreview.domain}
                </Text>
                <Text numberOfLines={2} style={[styles.linkTitle, { color: isDark ? AppleColors.labelDark : AppleColors.labelLight }]}>
                  {message.linkPreview.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}

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

      {/* Outgoing Status Indicator */}
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
  senderHeaderContainer: {
    paddingLeft: AppleSpacing.base + 8,
    marginBottom: 2,
    marginTop: 4,
  },
  senderHeaderText: {
    ...AppleTypography.caption2,
    fontSize: 11,
    fontWeight: '500',
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
  replyContextContainer: {
    backgroundColor: 'rgba(142, 142, 147, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 2,
    maxWidth: '90%',
  },
  replyOutgoing: {
    alignSelf: 'flex-end',
  },
  replyIncoming: {
    alignSelf: 'flex-start',
  },
  replySenderText: {
    ...AppleTypography.caption2,
    fontWeight: '600',
    fontSize: 10,
    color: AppleColors.systemBlue,
  },
  replySnippetText: {
    ...AppleTypography.caption2,
    fontSize: 11,
    opacity: 0.8,
  },
  attachmentWrapper: {
    marginBottom: 4,
  },
  imageAttachmentContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumbnail: {
    width: 210,
    height: 150,
    borderRadius: 16,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  videoDurationText: {
    ...AppleTypography.caption2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    minWidth: 180,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  docDetails: {
    flex: 1,
  },
  docName: {
    ...AppleTypography.body,
    fontSize: 14,
    fontWeight: '500',
  },
  docSize: {
    ...AppleTypography.caption2,
    fontSize: 11,
    marginTop: 2,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 170,
  },
  audioPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: 10,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  audioDuration: {
    ...AppleTypography.caption2,
    fontSize: 12,
    fontWeight: '600',
  },
  linkPreviewCard: {
    borderRadius: AppleRadii.sm + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: 4,
    width: 220,
  },
  linkImage: {
    width: '100%',
    height: 100,
  },
  linkInfo: {
    padding: 8,
  },
  linkDomain: {
    ...AppleTypography.caption2,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  linkTitle: {
    ...AppleTypography.subhead,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
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
  editedTag: {
    ...AppleTypography.caption2,
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
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
