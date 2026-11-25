import { Platform } from 'react-native';

export const AppleColors = {
  // Brand / iMessage Colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759', // SMS green if applicable
  systemIndigo: '#5856D6',
  systemOrange: '#FF9500',
  systemPink: '#FF2D55',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',

  // iMessage Specific Bubble Colors
  iMessageBlue: '#007AFF',
  iMessageBubbleGradientStart: '#007AFF',
  iMessageBubbleGradientEnd: '#0062D2',
  incomingBubbleLight: '#E9E9EB',
  incomingBubbleDark: '#26252A',
  outgoingBubbleDark: '#0B84FE',

  // System Backgrounds (Light & Dark)
  backgroundLight: '#FFFFFF',
  secondaryBackgroundLight: '#F2F2F7',
  groupedBackgroundLight: '#F2F2F7',
  
  backgroundDark: '#000000',
  secondaryBackgroundDark: '#1C1C1E',
  groupedBackgroundDark: '#1C1C1E',

  // Text Colors
  labelLight: '#000000',
  secondaryLabelLight: '#8E8E93',
  tertiaryLabelLight: '#C7C7CC',
  quaternaryLabelLight: '#D1D1D6',

  labelDark: '#FFFFFF',
  secondaryLabelDark: '#8E8E93',
  tertiaryLabelDark: '#48484A',
  quaternaryLabelDark: '#3A3A3C',

  // Borders & Separators
  separatorLight: '#C6C6C8',
  separatorDark: '#38383A',
  dividerLight: 'rgba(60, 60, 67, 0.29)',
  dividerDark: 'rgba(84, 84, 88, 0.65)',

  // Gray Tints for Avatars
  avatarColors: [
    '#8E8E93', // Classic Apple Monogram Gray
    '#5856D6',
    '#007AFF',
    '#34C759',
    '#FF9500',
    '#FF2D55',
    '#AF52DE',
  ],
};

export const AppleTypography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    fontFamily: Platform.select({ ios: 'System', default: undefined }),
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
};

export const AppleSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const AppleRadii = {
  xs: 4,
  sm: 8,
  md: 12,
  bubble: 18,
  composer: 20,
  avatar: 9999,
  pill: 9999,
};
