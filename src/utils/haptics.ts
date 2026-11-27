import { Platform, Vibration } from 'react-native';

export const triggerHaptic = (type: 'light' | 'medium' | 'selection' | 'success' = 'light') => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    switch (type) {
      case 'light':
      case 'selection':
        Vibration.vibrate(10);
        break;
      case 'medium':
        Vibration.vibrate(25);
        break;
      case 'success':
        Vibration.vibrate([0, 15, 60, 15]);
        break;
      default:
        Vibration.vibrate(10);
    }
  }
};
