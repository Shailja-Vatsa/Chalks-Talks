import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';

interface AppleComposerProps {
  onSendMessage: (text: string) => void;
  placeholder?: string;
}

export const AppleComposer: React.FC<AppleComposerProps> = ({
  onSendMessage,
  placeholder = 'iMessage',
}) => {
  const [text, setText] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? AppleColors.backgroundDark
            : AppleColors.backgroundLight,
          borderTopColor: isDark
            ? AppleColors.separatorDark
            : AppleColors.separatorLight,
        },
      ]}
    >
      {/* Plus / App Drawer button */}
      <TouchableOpacity
        activeOpacity={0.6}
        style={[
          styles.actionButton,
          {
            backgroundColor: isDark
              ? AppleColors.secondaryBackgroundDark
              : '#E9E9EB',
          },
        ]}
        onPress={() => {}}
      >
        <Ionicons
          name="add"
          size={20}
          color={isDark ? AppleColors.labelDark : AppleColors.secondaryLabelLight}
        />
      </TouchableOpacity>

      {/* Pill-shaped Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark
              ? AppleColors.secondaryBackgroundDark
              : AppleColors.secondaryBackgroundLight,
            borderColor: isDark
              ? AppleColors.separatorDark
              : '#E5E5EA',
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
          ]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={
            isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight
          }
          multiline
          maxLength={1000}
          enablesReturnKeyAutomatically
          returnKeyType="default"
          blurOnSubmit={false}
        />

        {/* Audio / Dictation Icon when empty */}
        {!canSend && (
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.micButton}
            onPress={() => {}}
          >
            <Ionicons
              name="mic"
              size={19}
              color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
            />
          </TouchableOpacity>
        )}

        {/* Send Arrow Button when has text */}
        {canSend && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            style={styles.sendButton}
          >
            <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: AppleSpacing.base,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: AppleRadii.composer,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 38,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    ...AppleTypography.body,
    fontSize: 16,
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  micButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppleColors.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
