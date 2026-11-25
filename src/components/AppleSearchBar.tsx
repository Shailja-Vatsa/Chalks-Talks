import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export const AppleSearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? AppleColors.secondaryBackgroundDark
            : 'rgba(118, 118, 128, 0.12)',
        },
      ]}
    >
      <Ionicons
        name="search"
        size={16}
        color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight
        }
        style={[
          styles.input,
          { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
        ]}
        clearButtonMode="while-editing"
        autoCorrect={false}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton} activeOpacity={0.6}>
          <Ionicons
            name="close-circle"
            size={16}
            color={isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: AppleRadii.sm + 2,
    paddingHorizontal: AppleSpacing.sm,
    marginHorizontal: AppleSpacing.base,
    marginVertical: AppleSpacing.xs,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    ...AppleTypography.body,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 2,
  },
});
