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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMessages } from '../context/MessagesContext';
import { Avatar } from '../components/Avatar';
import { AppleComposer } from '../components/AppleComposer';
import { AppleColors, AppleTypography, AppleSpacing, AppleRadii } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Contact } from '../types';

export default function ComposeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contacts, conversations, sendMessage } = useMessages();

  const [toInput, setToInput] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter((c) => {
    if (!toInput.trim()) return false;
    const query = toInput.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  });

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setToInput('');
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedContact) return;

    // Find if an existing conversation with this contact exists
    const existing = conversations.find(
      (c) => !c.isGroup && c.participantIds.includes(selectedContact.id)
    );

    const targetConvId = existing ? existing.id : `conv-${Date.now()}`;
    await sendMessage(targetConvId, text);
    router.replace(`/conversation/${targetConvId}`);
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
          New Message
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* "To:" Recipient Field */}
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

        {selectedContact ? (
          <TouchableOpacity
            style={styles.selectedPill}
            onPress={() => setSelectedContact(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectedPillText}>{selectedContact.fullName}</Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            style={[
              styles.toInput,
              { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
            ]}
            placeholder="Name, number, or email"
            placeholderTextColor={
              isDark ? AppleColors.tertiaryLabelDark : AppleColors.tertiaryLabelLight
            }
            value={toInput}
            onChangeText={setToInput}
            autoFocus
          />
        )}

        <TouchableOpacity
          onPress={() => {}}
          activeOpacity={0.6}
          style={styles.plusContactButton}
        >
          <Ionicons name="add-circle" size={24} color={AppleColors.systemBlue} />
        </TouchableOpacity>
      </View>

      {/* Suggested Contact List */}
      <View style={styles.contentArea}>
        {!selectedContact && toInput.trim().length > 0 && (
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
        )}

        {/* Empty placeholder helper */}
        {!selectedContact && !toInput.trim() && (
          <View style={styles.contactsPrompt}>
            <Text
              style={[
                styles.promptHeading,
                { color: isDark ? AppleColors.secondaryLabelDark : AppleColors.secondaryLabelLight },
              ]}
            >
              Suggested Contacts
            </Text>
            {contacts.slice(0, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.suggestedRow}
                onPress={() => handleSelectContact(c)}
                activeOpacity={0.6}
              >
                <Avatar initials={c.initials} size={32} backgroundColor={c.color} />
                <Text
                  style={[
                    styles.suggestedName,
                    { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
                  ]}
                >
                  {c.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Composer */}
      {selectedContact && (
        <AppleComposer
          onSendMessage={handleSendMessage}
          placeholder={`iMessage to ${selectedContact.firstName}`}
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
    marginRight: 8,
  },
  toInput: {
    flex: 1,
    ...AppleTypography.body,
    fontSize: 16,
    paddingVertical: 2,
  },
  selectedPill: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppleRadii.pill,
    marginRight: 8,
  },
  selectedPillText: {
    ...AppleTypography.body,
    color: AppleColors.systemBlue,
    fontSize: 15,
    fontWeight: '500',
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
  suggestedName: {
    ...AppleTypography.body,
    fontSize: 16,
    marginLeft: AppleSpacing.md,
  },
});
