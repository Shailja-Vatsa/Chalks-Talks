import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Attachment } from '../types';
import { AppleTypography, AppleSpacing } from '../constants/theme';

interface AppleMediaViewerProps {
  visible: boolean;
  attachment: Attachment | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AppleMediaViewer: React.FC<AppleMediaViewerProps> = ({
  visible,
  attachment,
  onClose,
}) => {
  if (!visible || !attachment) return null;

  const isVideo = attachment.type === 'video';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {attachment.name || (isVideo ? 'Video' : 'Photo')}
          </Text>
          <View style={styles.placeholder} />
        </SafeAreaView>

        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: attachment.uri }}
            style={styles.image}
            resizeMode="contain"
          />

          {isVideo && (
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <Ionicons name="play" size={36} color="#FFFFFF" />
              </View>
              {attachment.duration && (
                <Text style={styles.durationText}>0:{attachment.duration < 10 ? `0${attachment.duration}` : attachment.duration}</Text>
              )}
            </View>
          )}
        </View>

        <SafeAreaView style={styles.safeFooter}>
          <TouchableOpacity style={styles.footerAction} onPress={() => {}}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  safeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppleSpacing.base,
    paddingTop: 10,
    zIndex: 10,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...AppleTypography.headline,
    color: '#FFFFFF',
    fontSize: 16,
    maxWidth: 200,
  },
  placeholder: {
    width: 38,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  playOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  playCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    ...AppleTypography.caption1,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
  safeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  footerAction: {
    padding: 10,
  },
});
