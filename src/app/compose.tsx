import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMessages } from '../context/MessagesContext';
import { Avatar } from '../components/Avatar';
import { AppleComposer } from '../components/AppleComposer';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Contact, Attachment } from '../types';

export default function ComposeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contacts, conversations, createConversation, sendMessage } = useMessages();

  const [toInput, setToInput] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<Contact[]>([]);

  const filteredContacts = contacts.filter((c) => {
    if (!toInput.trim()) return false;
    // Don't show already selected recipients in search results
    if (selectedRecipients.some((r) => r.id === c.id)) return false;

    const query = toInput.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  });

  const handleSelectContact = (contact: Contact) => {
    setSelectedRecipients([...selectedRecipients, contact]);
    setToInput('');
  };

  const handleRemoveRecipient = (contactId: string) => {
    setSelectedRecipients(selectedRecipients.filter((c) => c.id !== contactId));
  };

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    if (selectedRecipients.length === 0) return;

    const participantIds = selectedRecipients.map((r) => r.id);

    // If 1 recipient, check if 1:1 conversation already exists
    if (participantIds.length === 1) {
      const existing = conversations.find(
        (c) => !c.isGroup && c.participantIds.includes(participantIds[0])
      );

      const targetConvId = existing ? existing.id : `conv-${Date.now()}`;
      await sendMessage(targetConvId, text, { attachment });
      router.replace(`/conversation/${targetConvId}`);
    } else {
      // Group conversation
      const groupTitle = selectedRecipients.map((r) => r.firstName).join(', ');
      const newGroup = await createConversation(participantIds, groupTitle);
      await sendMessage(newGroup.id, text, { attachment });
      router.replace(`/conversation/${newGroup.id}`);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? AppleColors.backgroundDark : AppleColors.backgroundLight },
      ]}
    >
      {/* iOS New Message Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            borderBottomColor: isDark
              ? AppleColors.separatorDark
              : AppleColors.separatorLight,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelButton}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
          ]}
        >
          {selectedRecipients.length > 1 ? 'New Group' : 'New Message'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* "To:" Multi-Recipient Field */}
      <View
        style={[
          styles.recipientRow,
          {
            borderBottomColor: isDark
              ? AppleColors.separatorDark
              : AppleColors.separatorLight,
          },
        ]}
      >
        <Text
          style={[
            styles.toLabel,
            {
              color: isDark
                ? AppleColors.secondaryLabelDark
                : AppleColors.secondaryLabelLight,
            },
          ]}
        >
          To:
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {selectedRecipients.map((recipient) => (
            <TouchableOpacity
              key={recipient.id}
              style={styles.selectedPill}
              onPress={() => handleRemoveRecipient(recipient.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectedPillText}>{recipient.firstName}</Text>
              <Ionicons name="close" size={13} color={AppleColors.systemBlue} style={styles.pillClose} />
            </TouchableOpacity>
          ))}

          <TextInput
            style={[
              styles.toInput,
              { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
            ]}
            placeholder={selectedRecipients.length === 0 ? 'Name, number, or email' : 'Add another'}
            placeholderTextColor={
              isDark ? AppleColors.tertiaryLabelDark : AppleColors.tertiaryLabelLight
            }
            value={toInput}
            onChangeText={setToInput}
            autoFocus={selectedRecipients.length === 0}
          />
        </ScrollView>

        <TouchableOpacity
          onPress={() => {}}
          activeOpacity={0.6}
          style={styles.plusContactButton}
        >
          <Ionicons name="add-circle" size={24} color={AppleColors.systemBlue} />
        </TouchableOpacity>
      </View>

      {/* Suggested & Filtered Contact List */}
      <View style={styles.contentArea}>
        {toInput.trim().length > 0 ? (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.contactRow,
                  {
                    borderBottomColor: isDark
                      ? AppleColors.separatorDark
                      : AppleColors.separatorLight,
                  },
                ]}
                onPress={() => handleSelectContact(item)}
                activeOpacity={0.6}
              >
                <Avatar
                  initials={item.initials}
                  size={36}
                  backgroundColor={item.color}
                />
                <View style={styles.contactDetails}>
                  <Text
                    style={[
                      styles.contactName,
                      { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                    ]}
                  >
                    {item.fullName}
                  </Text>
                  <Text
                    style={[
                      styles.contactSub,
                      {
                        color: isDark
                          ? AppleColors.secondaryLabelDark
                          : AppleColors.secondaryLabelLight,
                      },
                    ]}
                  >
                    {item.phone || item.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.contactsPrompt}>
            <Text
              style={[
                styles.promptHeading,
                { color: isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight },
              ]}
            >
              Suggested Contacts
            </Text>
            {contacts
              .filter((c) => !selectedRecipients.some((r) => r.id === c.id))
              .slice(0, 5)
              .map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.suggestedRow}
                  onPress={() => handleSelectContact(c)}
                  activeOpacity={0.6}
                >
                  <Avatar initials={c.initials} size={34} backgroundColor={c.color} />
                  <View style={styles.suggestedMeta}>
                    <Text
                      style={[
                        styles.suggestedName,
                        { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                      ]}
                    >
                      {c.fullName}
                    </Text>
                    {c.phone && (
                      <Text style={[styles.suggestedPhone, { color: AppleColors.secondaryLabelLight }]}>
                        {c.phone}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      {/* Bottom Composer */}
      {selectedRecipients.length > 0 && (
        <AppleComposer
          onSendMessage={handleSendMessage}
          placeholder={
            selectedRecipients.length === 1
              ? `iMessage to ${selectedRecipients[0].firstName}`
              : `iMessage to ${selectedRecipients.length} people`
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: AppleSpacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    paddingVertical: 4,
  },
  cancelText: {
    ...AppleTypography.body,
    color: AppleColors.systemBlue,
    fontSize: 17,
  },
  headerTitle: {
    ...AppleTypography.headline,
    fontSize: 17,
  },
  headerSpacer: {
    width: 50,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppleSpacing.base,
    paddingVertical: AppleSpacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toLabel: {
    ...AppleTypography.body,
    fontSize: 16,
    marginRight: 6,
  },
  pillsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
  },
  toInput: {
    minWidth: 120,
    ...AppleTypography.body,
    fontSize: 16,
    paddingVertical: 2,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppleRadii.pill,
    marginRight: 6,
  },
  selectedPillText: {
    ...AppleTypography.body,
    color: AppleColors.systemBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  pillClose: {
    marginLeft: 3,
  },
  plusContactButton: {
    padding: 2,
  },
  contentArea: {
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppleSpacing.sm,
    paddingHorizontal: AppleSpacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactDetails: {
    marginLeft: AppleSpacing.md,
    flex: 1,
  },
  contactName: {
    ...AppleTypography.body,
    fontSize: 16,
    fontWeight: '500',
  },
  contactSub: {
    ...AppleTypography.caption1,
    marginTop: 2,
  },
  contactsPrompt: {
    paddingHorizontal: AppleSpacing.base,
    paddingTop: AppleSpacing.base,
  },
  promptHeading: {
    ...AppleTypography.caption1,
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: AppleSpacing.sm,
    letterSpacing: 0.2,
  },
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  suggestedMeta: {
    marginLeft: AppleSpacing.md,
  },
  suggestedName: {
    ...AppleTypography.body,
    fontSize: 16,
  },
  suggestedPhone: {
    ...AppleTypography.caption2,
    marginTop: 2,
  },
});
