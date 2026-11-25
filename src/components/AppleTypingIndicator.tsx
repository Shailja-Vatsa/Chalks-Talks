import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { AppleColors, AppleRadii, AppleSpacing } from '../constants/theme';

export const AppleTypingIndicator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -5,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.delay(350),
          ])
        ),
      ]);
    };

    const anim1 = createPulse(dot1Anim, 0);
    const anim2 = createPulse(dot2Anim, 160);
    const anim3 = createPulse(dot3Anim, 320);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const bubbleBg = isDark
    ? AppleColors.incomingBubbleDark
    : AppleColors.incomingBubbleLight;

  const dotBg = isDark ? '#8E8E93' : '#8E8E93';

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: bubbleBg }]}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotBg, transform: [{ translateY: dot1Anim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotBg, transform: [{ translateY: dot2Anim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotBg, transform: [{ translateY: dot3Anim }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: AppleRadii.bubble,
    borderBottomLeftRadius: 4,
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
