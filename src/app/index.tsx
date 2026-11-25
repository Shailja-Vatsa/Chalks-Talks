import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMessages } from '../context/MessagesContext';
import { ConversationRow } from '../components/ConversationRow';
import { PinnedConversationItem } from '../components/PinnedConversationItem';
import { AppleSearchBar } from '../components/AppleSearchBar';
import { AppleButton } from '../components/AppleButton';
import { AppleIcon } from '../components/AppleIcon';
import { AppleColors, AppleTypography, AppleSpacing } from '../constants/theme';

export default function MessagesIndexScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { conversations, getContactById, loading } = useMessages();

  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: isDark ? AppleColors.backgroundDark : AppleColors.backgroundLight },
        ]}
      >
        <ActivityIndicator size="small" color={AppleColors.systemBlue} />
      </View>
    );
  }

  // Filter pinned & regular conversations
  const pinnedConversations = conversations.filter((c) => c.isPinned);
  
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const contact = c.participantIds[0] ? getContactById(c.participantIds[0]) : undefined;
    const title = c.title || contact?.fullName || '';
    const lastMsg = c.lastMessage?.text || '';
    return title.toLowerCase().includes(query) || lastMsg.toLowerCase().includes(query);
  });

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? AppleColors.backgroundDark : AppleColors.backgroundLight },
      ]}
    >
      {/* Top Header Actions */}
      <View style={styles.header}>
        <AppleButton
          title="Edit"
          onPress={() => {}}
          textStyle={styles.headerNavText}
        />
        <AppleButton
          onPress={() => {
            router.push('/compose');
          }}
          style={styles.composeButton}
        >
          <AppleIcon name="compose" size={24} color={AppleColors.systemBlue} />
        </AppleButton>
      </View>

      {/* Large Title */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.largeTitle,
            { color: isDark ? AppleColors.labelDark : AppleColors.labelLight },
          ]}
        >
          Messages
        </Text>
      </View>

      {/* Search Bar */}
      <AppleSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {/* Pinned conversations row when not searching */}
            {!searchQuery && pinnedConversations.length > 0 && (
              <View style={styles.pinnedSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pinnedScroll}
                >
                  {pinnedConversations.map((item) => {
                    const participant = item.participantIds[0]
                      ? getContactById(item.participantIds[0])
                      : undefined;
                    return (
                      <PinnedConversationItem
                        key={item.id}
                        conversation={item}
                        participant={participant}
                        onPress={() => router.push(`/conversation/${item.id}`)}
                      />
                    );
                  })}
                </ScrollView>
                <View
                  style={[
                    styles.sectionDivider,
                    {
                      backgroundColor: isDark
                        ? AppleColors.separatorDark
                        : AppleColors.separatorLight,
                    },
                  ]}
                />
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => {
          const participant = item.participantIds[0]
            ? getContactById(item.participantIds[0])
            : undefined;

          return (
            <ConversationRow
              conversation={item}
              participant={participant}
              onPress={() => {
                router.push(`/conversation/${item.id}`);
              }}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppleSpacing.base,
    paddingTop: AppleSpacing.xs,
  },
  headerNavText: {
    ...AppleTypography.body,
    color: AppleColors.systemBlue,
    fontSize: 17,
  },
  composeButton: {
    padding: 4,
  },
  titleContainer: {
    paddingHorizontal: AppleSpacing.base,
    paddingTop: AppleSpacing.xs,
    paddingBottom: 2,
  },
  largeTitle: {
    ...AppleTypography.largeTitle,
  },
  pinnedSection: {
    paddingTop: AppleSpacing.sm,
    paddingBottom: AppleSpacing.xs,
  },
  pinnedScroll: {
    paddingHorizontal: AppleSpacing.base - 4,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: AppleSpacing.base,
    marginTop: AppleSpacing.sm,
  },
  listContent: {
    paddingBottom: AppleSpacing.xxl,
  },
});
