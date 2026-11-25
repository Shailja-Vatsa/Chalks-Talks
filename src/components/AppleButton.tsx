import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';

interface AppleButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'tinted' | 'plain';
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  title,
  onPress,
  variant = 'plain',
  color = AppleColors.systemBlue,
  style,
  textStyle,
  children,
  disabled = false,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return [
          styles.base,
          styles.primary,
          { backgroundColor: color, opacity: disabled ? 0.5 : 1 },
          style,
        ];
      case 'tinted':
        return [
          styles.base,
          styles.tinted,
          { backgroundColor: `${color}1A`, opacity: disabled ? 0.5 : 1 },
          style,
        ];
      case 'plain':
      default:
        return [styles.plain, { opacity: disabled ? 0.4 : 1 }, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.textPrimary, textStyle];
      case 'tinted':
      case 'plain':
      default:
        return [styles.textPlain, { color }, textStyle];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={onPress}
      disabled={disabled}
      style={getContainerStyle()}
    >
      {children ? children : <Text style={getTextStyle()}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: AppleSpacing.sm + 2,
    paddingHorizontal: AppleSpacing.base,
    borderRadius: AppleRadii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    paddingVertical: AppleSpacing.xs,
    paddingHorizontal: AppleSpacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {},
  tinted: {},
  textPrimary: {
    ...AppleTypography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textPlain: {
    ...AppleTypography.body,
    fontWeight: '400',
  },
});
