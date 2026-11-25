import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MessagesProvider } from '../context/MessagesContext';
import { AppleColors } from '../constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <MessagesProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark
              ? AppleColors.backgroundDark
              : AppleColors.backgroundLight,
          },
          headerTintColor: AppleColors.systemBlue,
          headerTitleStyle: {
            fontWeight: '600',
            color: isDark ? AppleColors.labelDark : AppleColors.labelLight,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: isDark
              ? AppleColors.backgroundDark
              : AppleColors.backgroundLight,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="conversation/[id]"
          options={{
            headerTitle: '',
            headerBackTitle: 'Messages',
          }}
        />
        <Stack.Screen
          name="compose"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="conversation/details"
          options={{
            headerTitle: 'Details',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </MessagesProvider>
  );
}
