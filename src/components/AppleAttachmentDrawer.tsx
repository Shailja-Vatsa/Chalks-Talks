import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Attachment } from '../types';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

interface AppleAttachmentDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectAttachment: (attachment: Attachment) => void;
  onSendSimulatedAudio: () => void;
  onInsertEmoji: (emoji: string) => void;
}

const COMMON_EMOJIS = ['😊', '😂', '🔥', '❤️', '👍', '🎉', '🙌', '🚀', '✨', '👀'];

export const AppleAttachmentDrawer: React.FC<AppleAttachmentDrawerProps> = ({
  visible,
  onClose,
  onSelectAttachment,
  onSendSimulatedAudio,
  onInsertEmoji,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  // 1. Pick Image or Video from Photo Library
  const handlePickMedia = async () => {
    try {
      triggerHaptic('light');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant photo library access in Settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        onSelectAttachment({
          id: `att-${Date.now()}`,
          type: isVideo ? 'video' : 'image',
          uri: asset.uri,
          name: asset.fileName || (isVideo ? 'video.mp4' : 'photo.jpg'),
          width: asset.width,
          height: asset.height,
          duration: asset.duration ? Math.round(asset.duration / 1000) : undefined,
        });
        onClose();
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  // 2. Take Photo with Camera
  const handleTakePhoto = async () => {
    try {
      triggerHaptic('light');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant camera access in Settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onSelectAttachment({
          id: `att-${Date.now()}`,
          type: 'image',
          uri: asset.uri,
          name: 'CameraPhoto.jpg',
          width: asset.width,
          height: asset.height,
        });
        onClose();
      }
    } catch (e) {
      console.warn('Camera error:', e);
    }
  };

  // 3. Attach Document
  const handlePickDocument = async () => {
    try {
      triggerHaptic('light');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        onSelectAttachment({
          id: `att-${Date.now()}`,
          type: 'document',
          uri: doc.uri,
          name: doc.name,
          size: doc.size,
          mimeType: doc.mimeType,
        });
        onClose();
      }
    } catch (e) {
      console.warn('Doc picker error:', e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetCard,
                {
                  backgroundColor: isDark
                    ? AppleColors.secondaryBackgroundDark
                    : '#FFFFFF',
                },
              ]}
            >
              {/* Grabber indicator */}
              <View style={styles.grabber} />

              <Text
                style={[
                  styles.title,
                  { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                ]}
              >
                Share
              </Text>

              {/* Grid of Apps & Media Actions matching iOS iMessage Drawer */}
              <View style={styles.gridContainer}>
                {/* Photos */}
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={handlePickMedia}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#34C759' }]}>
                    <Ionicons name="images" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.itemLabel, { color: isDark ? AppleColors.labelDark : AppleColors.labelLight }]}>
                    Photos
                  </Text>
                </TouchableOpacity>

                {/* Camera */}
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#8E8E93' }]}>
                    <Ionicons name="camera" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.itemLabel, { color: isDark ? AppleColors.labelDark : AppleColors.labelLight }]}>
                    Camera
                  </Text>
                </TouchableOpacity>

                {/* Documents / Files */}
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={handlePickDocument}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: AppleColors.systemBlue }]}>
                    <Ionicons name="document-text" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.itemLabel, { color: isDark ? AppleColors.labelDark : AppleColors.labelLight }]}>
                    Files
                  </Text>
                </TouchableOpacity>

                {/* Audio Message */}
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => {
                    triggerHaptic('medium');
                    onSendSimulatedAudio();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FF2D55' }]}>
                    <Ionicons name="mic" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.itemLabel, { color: isDark ? AppleColors.labelDark : AppleColors.labelLight }]}>
                    Audio
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Apple Emoji Bar */}
              <View
                style={[
                  styles.emojiRow,
                  {
                    borderTopColor: isDark
                      ? AppleColors.separatorDark
                      : AppleColors.separatorLight,
                  },
                ]}
              >
                {COMMON_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.emojiBtn}
                    onPress={() => {
                      triggerHaptic('selection');
                      onInsertEmoji(emoji);
                      onClose();
                    }}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: AppleSpacing.base,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(128,128,128,0.4)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    ...AppleTypography.headline,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  gridItem: {
    alignItems: 'center',
    width: 68,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLabel: {
    ...AppleTypography.caption2,
    fontSize: 12,
    fontWeight: '500',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emojiBtn: {
    padding: 6,
  },
  emojiText: {
    fontSize: 22,
  },
});
