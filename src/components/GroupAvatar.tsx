import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Contact } from '../types';
import { Avatar } from './Avatar';
import { AppleColors } from '../constants/theme';

interface GroupAvatarProps {
  participants: Contact[];
  size?: number;
  customAvatarUrl?: string;
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  participants,
  size = 50,
  customAvatarUrl,
}) => {
  if (customAvatarUrl) {
    return <Avatar avatarUrl={customAvatarUrl} size={size} />;
  }

  const p1 = participants[0];
  const p2 = participants[1];
  const p3 = participants[2];

  // If group only has 1 or 0 participants
  if (participants.length <= 1) {
    return (
      <Avatar
        initials={p1?.initials || 'GR'}
        backgroundColor={p1?.color || AppleColors.systemBlue}
        size={size}
      />
    );
  }

  // 2 or 3 overlapping iOS group avatar layout
  const miniSize = Math.round(size * 0.62);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top / Left avatar */}
      <View style={[styles.avatarWrapper, { top: 0, left: 0 }]}>
        <Avatar
          initials={p1?.initials || 'A'}
          backgroundColor={p1?.color || AppleColors.avatarColors[1]}
          size={miniSize}
        />
      </View>

      {/* Bottom / Right avatar */}
      <View style={[styles.avatarWrapper, { bottom: 0, right: 0 }]}>
        <Avatar
          initials={p2?.initials || 'B'}
          backgroundColor={p2?.color || AppleColors.avatarColors[2]}
          size={miniSize}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 9999,
  },
});
