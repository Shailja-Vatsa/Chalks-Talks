import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMessages } from '../../context/MessagesContext';
import { Avatar } from '../../components/Avatar';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ConversationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { conversations, getContactById } = useMessages();

  const conversation = conversations.find((c) => c.id === id);
  const participant = conversation?.participantIds[0]
    ? getContactById(conversation.participantIds[0])
    : undefined;

  const [hideAlerts, setHideAlerts] = useState(conversation?.muted || false);
  const [sendReadReceipts, setSendReadReceipts] = useState(true);

  const title = conversation?.title || participant?.fullName || 'Details';
  const initials = participant?.initials || title.substring(0, 2).toUpperCase();
  const avatarColor = participant?.color || AppleColors.avatarColors[0];

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? AppleColors.secondaryBackgroundDark
            : AppleColors.secondaryBackgroundLight,
        },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen
        options={{
          headerTitle: 'Details',
          headerBackTitle: 'Back',
        }}
      />

      {/* Profile Header */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: isDark
              ? AppleColors.backgroundDark
              : AppleColors.backgroundLight,
          },
        ]}
      >
        <Avatar
          initials={initials}
          size={84}
          backgroundColor={avatarColor}
        />
        <Text
          style={[
            styles.profileName,
            { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
          ]}
        >
          {title}
        </Text>
        {participant?.phone && (
          <Text
            style={[
              styles.profileSub,
              {
                color: isDark
                  ? AppleColors.secondaryLabelDark
                  : AppleColors.secondaryLabelLight,
              },
            ]}
          >
            {participant.phone}
          </Text>
        )}

        {/* Quick Action Buttons (Call, FaceTime, Info) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? AppleColors.secondaryBackgroundDark
                  : AppleColors.secondaryBackgroundLight,
              },
            ]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color={AppleColors.systemBlue} />
            <Text style={styles.actionText}>call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? AppleColors.secondaryBackgroundDark
                  : AppleColors.secondaryBackgroundLight,
              },
            ]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam" size={20} color={AppleColors.systemBlue} />
            <Text style={styles.actionText}>FaceTime</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? AppleColors.secondaryBackgroundDark
                  : AppleColors.secondaryBackgroundLight,
              },
            ]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={20} color={AppleColors.systemBlue} />
            <Text style={styles.actionText}>mail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? AppleColors.secondaryBackgroundDark
                  : AppleColors.secondaryBackgroundLight,
              },
            ]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle" size={20} color={AppleColors.systemBlue} />
            <Text style={styles.actionText}>info</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <View
          style={[
            styles.groupCard,
            {
              backgroundColor: isDark
                ? AppleColors.backgroundDark
                : AppleColors.backgroundLight,
            },
          ]}
        >
          <View style={styles.row}>
            <Text
              style={[
                styles.rowLabel,
                { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
              ]}
            >
              Send Read Receipts
            </Text>
            <Switch
              value={sendReadReceipts}
              onValueChange={setSendReadReceipts}
              trackColor={{ false: '#767577', true: AppleColors.systemGreen }}
            />
          </View>

          <View
            style={[
              styles.rowSeparator,
              {
                backgroundColor: isDark
                  ? AppleColors.separatorDark
                  : AppleColors.separatorLight,
              },
            ]}
          />

          <View style={styles.row}>
            <Text
              style={[
                styles.rowLabel,
                { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
              ]}
            >
              Hide Alerts
            </Text>
            <Switch
              value={hideAlerts}
              onValueChange={setHideAlerts}
              trackColor={{ false: '#767577', true: AppleColors.systemGreen }}
            />
          </View>
        </View>
      </View>

      {/* Attachments & Photos Section */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionHeader,
            {
              color: isDark
                ? AppleColors.secondaryLabelDark
                : AppleColors.secondaryLabelLight,
            },
          ]}
        >
          PHOTOS & ATTACHMENTS
        </Text>
        <View
          style={[
            styles.groupCard,
            styles.emptyMediaCard,
            {
              backgroundColor: isDark
                ? AppleColors.backgroundDark
                : AppleColors.backgroundLight,
            },
          ]}
        >
          <Ionicons
            name="images-outline"
            size={36}
            color={isDark ? AppleColors.tertiaryLabelDark : AppleColors.tertiaryLabelLight}
          />
          <Text
            style={[
              styles.emptyMediaText,
              {
                color: isDark
                  ? AppleColors.secondaryLabelDark
                  : AppleColors.secondaryLabelLight,
              },
            ]}
          >
            Photos and documents sent in this conversation will appear here.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: AppleSpacing.base,
    paddingHorizontal: AppleSpacing.base,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: AppleSpacing.xl,
    borderRadius: AppleRadii.md,
    marginBottom: AppleSpacing.base,
  },
  profileName: {
    ...AppleTypography.title2,
    marginTop: AppleSpacing.md,
  },
  profileSub: {
    ...AppleTypography.subhead,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: AppleSpacing.lg,
    width: '100%',
    paddingHorizontal: AppleSpacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 56,
    borderRadius: AppleRadii.sm + 2,
    marginHorizontal: 6,
  },
  actionText: {
    ...AppleTypography.caption2,
    color: AppleColors.systemBlue,
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: AppleSpacing.base,
  },
  sectionHeader: {
    ...AppleTypography.caption2,
    fontSize: 12,
    marginBottom: 6,
    marginLeft: AppleSpacing.sm,
    letterSpacing: 0.2,
  },
  groupCard: {
    borderRadius: AppleRadii.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: AppleSpacing.md,
  },
  rowLabel: {
    ...AppleTypography.body,
    fontSize: 16,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: AppleSpacing.base,
  },
  emptyMediaCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: AppleSpacing.xl,
    paddingHorizontal: AppleSpacing.base,
  },
  emptyMediaText: {
    ...AppleTypography.caption1,
    textAlign: 'center',
    marginTop: AppleSpacing.sm,
    maxWidth: 240,
    lineHeight: 18,
  },
});
