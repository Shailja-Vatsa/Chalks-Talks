import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AppleColors, AppleTypography } from '../constants/theme';

interface AvatarProps {
  initials?: string;
  avatarUrl?: string;
  size?: number;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials = '?',
  avatarUrl,
  size = 44,
  backgroundColor = AppleColors.avatarColors[0],
}) => {
  const radius = size / 2;
  const fontSize = size * 0.42;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[
          styles.container,
          { width: size, height: size, borderRadius: radius },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            lineHeight: fontSize * 1.2,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    ...AppleTypography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});
