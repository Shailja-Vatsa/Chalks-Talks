import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppleColors } from '../constants/theme';

export type AppleIconName =
  | 'compose'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'send'
  | 'camera'
  | 'microphone'
  | 'ellipsis'
  | 'pin'
  | 'trash'
  | 'info'
  | 'heart'
  | 'thumbs-up'
  | 'thumbs-down';

interface IconProps {
  name: AppleIconName;
  size?: number;
  color?: string;
}

const ICON_MAP: Record<AppleIconName, keyof typeof Ionicons.glyphMap> = {
  'compose': 'create-outline',
  'chevron-left': 'chevron-back',
  'chevron-right': 'chevron-forward',
  'search': 'search',
  'send': 'arrow-up-circle-sharp',
  'camera': 'camera-outline',
  'microphone': 'mic-outline',
  'ellipsis': 'ellipsis-horizontal-circle',
  'pin': 'pin',
  'trash': 'trash-outline',
  'info': 'information-circle-outline',
  'heart': 'heart',
  'thumbs-up': 'thumbs-up',
  'thumbs-down': 'thumbs-down',
};

export const AppleIcon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = AppleColors.systemBlue,
}) => {
  const iconGlyph = name === 'compose' ? 'create-outline' : (ICON_MAP[name] || 'help-outline');
  return <Ionicons name={iconGlyph} size={size} color={color} />;
};
