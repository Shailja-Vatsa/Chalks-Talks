import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMessages } from '../../context/MessagesContext';
import { Avatar } from '../../components/Avatar';
import { GroupAvatar } from '../../components/GroupAvatar';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Contact, Message } from '../../types';

export default function ConversationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    conversations,
    contacts,
    getContactById,
    getConversationMessages,
    updateConversationDetails,
    addParticipant,
    removeParticipant,
  } = useMessages();

  const conversation = conversations.find((c) => c.id === id);
  const isGroup = conversation?.isGroup || (conversation?.participantIds && conversation.participantIds.length > 1);

  const participants: Contact[] = (conversation?.participantIds || [])
    .map((pid) => getContactById(pid))
    .filter((c): c is Contact => !!c);

  const [groupTitle, setGroupTitle] = useState(conversation?.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [hideAlerts, setHideAlerts] = useState(conversation?.muted || false);
  const [sendReadReceipts, setSendReadReceipts] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [mediaMessages, setMediaMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (id) {
      getConversationMessages(id).then((msgs) => {
        setMediaMessages(msgs.filter((m) => m.attachments && m.attachments.length > 0));
      });
    }
  }, [id, getConversationMessages]);

  const primaryContact = participants[0];
  const title =
    conversation?.title ||
    (isGroup ? participants.map((p) => p.firstName).join(', ') : primaryContact?.fullName || 'Details');

  const handleSaveTitle = async () => {
    if (!id) return;
    await updateConversationDetails(id, { title: groupTitle.trim() || undefined });
    setIsEditingTitle(false);
  };

  const handleToggleMute = async (val: boolean) => {
    setHideAlerts(val);
    if (id) {
      await updateConversationDetails(id, { muted: val });
    }
  };

  const handleAddMember = async (contactId: string) => {
    if (!id) return;
    await addParticipant(id, contactId);
    setShowAddMember(false);
  };

  const handleRemoveMember = async (contact: Contact) => {
    if (!id) return;
    Alert.alert(
      'Remove Participant',
      `Remove ${contact.fullName} from this conversation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeParticipant(id, contact.id);
          },
        },
      ]
    );
  };

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
          headerTitle: isGroup ? 'Group Details' : 'Details',
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
        {isGroup ? (
          <GroupAvatar participants={participants} size={84} />
        ) : (
          <Avatar
            initials={primaryContact?.initials || 'ME'}
            size={84}
            backgroundColor={primaryContact?.color || AppleColors.avatarColors[0]}
          />
        )}

        {/* Group Title or Contact Name */}
        {isGroup && isEditingTitle ? (
          <View style={styles.editTitleRow}>
            <TextInput
              style={[
                styles.titleInput,
                { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
              ]}
              value={groupTitle}
              onChangeText={setGroupTitle}
              placeholder="Group Name"
              placeholderTextColor={AppleColors.secondaryLabelLight}
              autoFocus
            />
            <TouchableOpacity onPress={handleSaveTitle} style={styles.titleSaveBtn}>
              <Text style={styles.titleSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => isGroup && setIsEditingTitle(true)}
            activeOpacity={isGroup ? 0.6 : 1}
          >
            <Text
              style={[
                styles.profileName,
                { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
              ]}
            >
              {title}
            </Text>
            {isGroup && (
              <Ionicons
                name="pencil"
                size={14}
                color={AppleColors.systemBlue}
                style={styles.editIcon}
              />
            )}
          </TouchableOpacity>
        )}

        {!isGroup && primaryContact?.phone && (
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
            {primaryContact.phone}
          </Text>
        )}

        {/* Action Buttons */}
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

      {/* Group Members Section */}
      {isGroup && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionHeader,
                { color: isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight },
              ]}
            >
              MEMBERS ({participants.length})
            </Text>
            <TouchableOpacity onPress={() => setShowAddMember(!showAddMember)} activeOpacity={0.7}>
              <Text style={styles.addMemberText}>
                {showAddMember ? 'Done' : 'Add Contact'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Member Dropdown/List */}
          {showAddMember && (
            <View
              style={[
                styles.groupCard,
                styles.addMemberList,
                { backgroundColor: isDark ? AppleColors.backgroundDark : AppleColors.backgroundLight },
              ]}
            >
              {contacts
                .filter((c) => !participants.some((p) => p.id === c.id))
                .map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.addMemberRow}
                    onPress={() => handleAddMember(contact.id)}
                    activeOpacity={0.6}
                  >
                    <Avatar initials={contact.initials} size={32} backgroundColor={contact.color} />
                    <Text
                      style={[
                        styles.participantName,
                        { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                      ]}
                    >
                      {contact.fullName}
                    </Text>
                    <Ionicons name="add-circle" size={22} color={AppleColors.systemGreen} />
                  </TouchableOpacity>
                ))}
            </View>
          )}

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
            {participants.map((contact, index) => (
              <React.Fragment key={contact.id}>
                <View style={styles.participantRow}>
                  <Avatar initials={contact.initials} size={36} backgroundColor={contact.color} />
                  <View style={styles.participantMeta}>
                    <Text
                      style={[
                        styles.participantName,
                        { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                      ]}
                    >
                      {contact.fullName}
                    </Text>
                    {contact.phone && (
                      <Text style={[styles.participantPhone, { color: AppleColors.secondaryLabelLight }]}>
                        {contact.phone}
                      </Text>
                    )}
                  </View>

                  {participants.length > 2 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(contact)}
                      style={styles.removeMemberBtn}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="remove-circle-outline" size={20} color={AppleColors.systemRed} />
                    </TouchableOpacity>
                  )}
                </View>
                {index < participants.length - 1 && (
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
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Conversation Settings Section */}
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
              onValueChange={handleToggleMute}
              trackColor={{ false: '#767577', true: AppleColors.systemGreen }}
            />
          </View>
        </View>
      </View>

      {/* Shared Photos & Media Gallery Section */}
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
            {
              backgroundColor: isDark
                ? AppleColors.backgroundDark
                : AppleColors.backgroundLight,
            },
          ]}
        >
          {mediaMessages.length > 0 ? (
            <View style={styles.mediaGrid}>
              {mediaMessages.map((msg) =>
                msg.attachments?.map((att) => (
                  <View key={att.id} style={styles.mediaGridItem}>
                    {att.type === 'image' || att.type === 'video' ? (
                      <Image source={{ uri: att.uri }} style={styles.mediaThumb} />
                    ) : (
                      <View style={styles.docThumb}>
                        <Ionicons
                          name={att.type === 'document' ? 'document-text' : 'mic'}
                          size={24}
                          color={AppleColors.systemBlue}
                        />
                        <Text numberOfLines={1} style={styles.docThumbName}>
                          {att.name}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={styles.emptyMediaCard}>
              <Ionicons
                name="images-outline"
                size={34}
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
                Photos, links, and documents sent in this chat appear here.
              </Text>
            </View>
          )}
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
    paddingVertical: AppleSpacing.lg,
    borderRadius: AppleRadii.md,
    marginBottom: AppleSpacing.base,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: AppleSpacing.md,
  },
  profileName: {
    ...AppleTypography.title2,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 6,
  },
  editTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: AppleSpacing.md,
    paddingHorizontal: 20,
  },
  titleInput: {
    ...AppleTypography.title3,
    borderBottomWidth: 1.5,
    borderBottomColor: AppleColors.systemBlue,
    paddingVertical: 2,
    minWidth: 160,
    textAlign: 'center',
  },
  titleSaveBtn: {
    marginLeft: 8,
    padding: 4,
  },
  titleSaveText: {
    ...AppleTypography.headline,
    color: AppleColors.systemBlue,
    fontSize: 15,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: AppleSpacing.xs,
  },
  sectionHeader: {
    ...AppleTypography.caption2,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  addMemberText: {
    ...AppleTypography.caption1,
    color: AppleColors.systemBlue,
    fontWeight: '600',
  },
  groupCard: {
    borderRadius: AppleRadii.md,
    overflow: 'hidden',
  },
  addMemberList: {
    marginBottom: 10,
    paddingVertical: 6,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: 8,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: 10,
  },
  participantMeta: {
    marginLeft: AppleSpacing.md,
    flex: 1,
  },
  participantName: {
    ...AppleTypography.body,
    fontSize: 16,
    fontWeight: '500',
  },
  participantPhone: {
    ...AppleTypography.caption2,
    marginTop: 2,
  },
  removeMemberBtn: {
    padding: 6,
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
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
  },
  mediaGridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 3,
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  docThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  docThumbName: {
    ...AppleTypography.caption2,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
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
