import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sampleNotes } from '@/constants/notes';

const filters = ['All notes', 'Pinned', 'Shared', 'Camera uploads', 'Offline'];
const notebookStacks = [
  { id: 'stack-1', title: 'Studio research', count: 18, color: '#F4E8FF' },
  { id: 'stack-2', title: 'Kitchen journal', count: 11, color: '#E0F2FE' },
  { id: 'stack-3', title: 'Travel scouts', count: 9, color: '#FEF3C7' },
];

export default function LibraryScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#C7D7FE', dark: '#101828' }}
      headerImage={
        <IconSymbol
          size={260}
          color="#818CF8"
          name="books.vertical.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <View>
          <ThemedText type="title">Library</ThemedText>
          <ThemedText style={styles.subtitle}>Browse every notebook + photo set</ThemedText>
        </View>
        <Pressable style={styles.syncButton} onPress={() => alert('Sync now')}>
          <ThemedText type="defaultSemiBold" style={styles.syncLabel}>
            Sync
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {filters.map((filter) => (
          <Pressable
            key={filter}
            style={styles.filterChip}
            onPress={() => alert(`Filter: ${filter}`)}>
            <ThemedText type="defaultSemiBold">{filter}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.statRow}>
        <ThemedView style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            38
          </ThemedText>
          <ThemedText style={styles.statLabel}>Active notes</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            126
          </ThemedText>
          <ThemedText style={styles.statLabel}>Photos this week</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            5
          </ThemedText>
          <ThemedText style={styles.statLabel}>Shared spaces</ThemedText>
        </ThemedView>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Notebook stacks</ThemedText>
        <Pressable onPress={() => alert('Manage stacks')}>
          <ThemedText type="defaultSemiBold" style={styles.sectionLink}>
            Manage
          </ThemedText>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stackRow}>
        {notebookStacks.map((stack) => (
          <Pressable
            key={stack.id}
            style={[styles.stackCard, { backgroundColor: stack.color }]}
            onPress={() => alert(`Open ${stack.title}`)}>
            <ThemedText type="defaultSemiBold" style={styles.stackTitle}>
              {stack.title}
            </ThemedText>
            <ThemedText style={styles.stackCount}>{stack.count} notes</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">All notes</ThemedText>
        <Pressable onPress={() => alert('Sort options')}>
          <ThemedText type="defaultSemiBold" style={styles.sectionLink}>
            Sort
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {sampleNotes.map((note) => (
          <Link key={note.id} href={`/note/${note.id}`} asChild>
            <Pressable style={styles.gridCard}>
              <Image source={{ uri: note.coverImage }} style={styles.gridImage} contentFit="cover" />
              <View style={styles.gridBody}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {note.title}
                </ThemedText>
                <ThemedText style={styles.gridMeta}>{note.lastEdited}</ThemedText>
                <View style={styles.gridPhotoRow}>
                  {note.photos.slice(0, 3).map((photo) => (
                    <Image key={photo.id} source={{ uri: photo.uri }} style={styles.gridPhotoThumb} />
                  ))}
                  {note.photos.length > 3 ? (
                    <ThemedView style={styles.morePhotosPill}>
                      <ThemedText type="defaultSemiBold">+{note.photos.length - 3}</ThemedText>
                    </ThemedView>
                  ) : null}
                </View>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -40,
    right: -60,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  subtitle: {
    color: '#475467',
  },
  syncButton: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#111827',
  },
  syncLabel: {
    color: '#F8FAFC',
  },
  filterRow: {
    gap: 12,
    paddingVertical: 16,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    color: '#F8FAFC',
  },
  statLabel: {
    color: '#CBD5F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionLink: {
    color: '#7C3AED',
  },
  stackRow: {
    gap: 12,
    paddingBottom: 8,
  },
  stackCard: {
    width: 220,
    borderRadius: 20,
    padding: 18,
    gap: 4,
  },
  stackTitle: {
    color: '#0F172A',
  },
  stackCount: {
    color: '#475467',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridCard: {
    width: '47%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridBody: {
    padding: 12,
    gap: 6,
  },
  gridMeta: {
    color: '#94A3B8',
  },
  gridPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridPhotoThumb: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  morePhotosPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1D4ED8',
  },
});

