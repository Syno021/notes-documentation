import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/hooks/useNotes';
import { base64ToDataUri } from '@/utils/mediaHelpers';

const captureQueue = [
  { id: 'capture-1', title: 'Add blueprint close-ups', eta: 'Due in 12 min', color: '#FEC84B' },
  { id: 'capture-2', title: 'Pantry labels', eta: 'Due 3:30 PM', color: '#A4BCFD' },
];

const templates = [
  { id: 'temp-1', title: 'Meeting recap', helper: 'Audio + photo slots', accent: '#7C3AED' },
  { id: 'temp-2', title: 'Recipe draft', helper: 'Timers & ingredients', accent: '#22C55E' },
  { id: 'temp-3', title: 'Location scout', helper: 'Geo-tag & light scale', accent: '#0EA5E9' },
];

export default function NotebookHomeScreen() {
  const { notes, isLoading, refresh } = useNotes();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const pinned = notes.length > 0 ? notes[0] : null;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ThemedView style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View>
              <ThemedText type="defaultSemiBold" style={styles.heroEyebrow}>
                Notebook · Camera-first
              </ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                Every note remembers the scene
              </ThemedText>
            </View>
            <ThemedText style={styles.heroStreak}>7-day streak</ThemedText>
          </View>
          <ThemedText style={styles.heroBody}>
            Start typing, snap reference photos, annotate checklists, and keep everything in one
            doc.
          </ThemedText>
          <View style={styles.heroActions}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/capture')}>
              <ThemedText type="defaultSemiBold" style={styles.primaryButtonLabel}>
                Capture + note
              </ThemedText>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/review')}>
              <ThemedText type="defaultSemiBold" style={styles.secondaryButtonLabel}>
                Review captures
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateRow}>
          {templates.map((template) => (
            <Pressable
              key={template.id}
              style={[styles.templateCard, { borderColor: template.accent }]}
              onPress={() => alert(`Use ${template.title}`)}>
              <ThemedText type="defaultSemiBold">{template.title}</ThemedText>
              <ThemedText style={styles.templateHelper}>{template.helper}</ThemedText>
              <View style={[styles.templateAccentDot, { backgroundColor: template.accent }]} />
            </Pressable>
          ))}
        </ScrollView>

        {pinned && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="subtitle">Recent capture</ThemedText>
                <ThemedText style={styles.sectionHelper}>
                  Your most recent note with photos and audio.
                </ThemedText>
              </View>
            </View>

            <Link href={`/note/${pinned.id}`} asChild>
              <Pressable>
                <ThemedView style={styles.pinnedCard}>
                  <Image source={{ uri: pinned.coverImage }} style={styles.pinnedImage} contentFit="cover" />
                  <View style={styles.pinnedContent}>
                    <ThemedText type="defaultSemiBold" style={styles.pinnedTitle}>
                      {pinned.title}
                    </ThemedText>
                    <ThemedText numberOfLines={2} style={styles.pinnedBody}>
                      {pinned.description || 'No description'}
                    </ThemedText>
                    <View style={styles.pinnedMetaRow}>
                      {pinned.photoCount > 0 && (
                        <View style={styles.tagPill}>
                          <ThemedText type="defaultSemiBold" style={styles.tagPillText}>
                            {pinned.photoCount} {pinned.photoCount === 1 ? 'photo' : 'photos'}
                          </ThemedText>
                        </View>
                      )}
                      {pinned.audioCount > 0 && (
                        <View style={[styles.tagPill, { backgroundColor: '#F59E0B' }]}>
                          <ThemedText type="defaultSemiBold" style={styles.tagPillText}>
                            {pinned.audioCount} audio
                          </ThemedText>
                        </View>
                      )}
                      <ThemedText style={styles.noteTimestamp}>{pinned.lastEdited}</ThemedText>
                    </View>
                    {pinned.images.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.photoStrip}>
                          {pinned.images.slice(0, 5).map((image) => (
                            <Image 
                              key={image.id} 
                              source={{ uri: base64ToDataUri(image.thumbnailData, image.mimeType) }} 
                              style={styles.photoStripItem} 
                            />
                          ))}
                        </View>
                      </ScrollView>
                    )}
                  </View>
                </ThemedView>
              </Pressable>
            </Link>
          </>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <ThemedText style={styles.loadingText}>Loading your notes...</ThemedText>
          </View>
        ) : notes.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="title" style={styles.emptyTitle}>
              No notes yet
            </ThemedText>
            <ThemedText style={styles.emptyBody}>
              Start capturing your ideas with photos and audio. Tap "Capture + note" above to begin.
            </ThemedText>
            <Pressable style={styles.emptyButton} onPress={() => router.push('/(tabs)/capture')}>
              <ThemedText type="defaultSemiBold" style={styles.emptyButtonLabel}>
                Create First Note
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">All Notes ({notes.length})</ThemedText>
              <Pressable onPress={refresh}>
                <ThemedText type="defaultSemiBold" style={styles.tinyLink}>
                  Refresh
                </ThemedText>
              </Pressable>
            </View>

            {notes.map((note) => (
              <Link key={note.id} href={`/note/${note.id}`} asChild>
                <Pressable style={styles.noteCard}>
                  <Image source={{ uri: note.coverImage }} style={styles.notePhoto} contentFit="cover" />
                  <View style={styles.noteContent}>
                    <View style={styles.noteHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
                        {note.title}
                      </ThemedText>
                      {note.photoCount > 0 && (
                        <View style={styles.noteBadge}>
                          <ThemedText type="defaultSemiBold" style={styles.noteBadgeText}>
                            {note.photoCount} {note.photoCount === 1 ? 'photo' : 'photos'}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText numberOfLines={2} style={styles.noteBody}>
                      {note.description || 'No description'}
                    </ThemedText>
                    <View style={styles.noteMetaRow}>
                      <ThemedText style={styles.noteTimestamp}>{note.lastEdited}</ThemedText>
                      {note.audioCount > 0 && (
                        <ThemedText style={styles.noteTimestamp}>
                          🎤 {note.audioCount} audio
                        </ThemedText>
                      )}
                    </View>
                    <View style={styles.noteActionRow}>
                      <Pressable
                        style={styles.captureButton}
                        onPress={(e) => {
                          e.preventDefault();
                          router.push('/(tabs)/capture');
                        }}>
                        <ThemedText type="defaultSemiBold" style={styles.captureButtonLabel}>
                          Add photo
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={styles.outlineButton}
                        onPress={(e) => {
                          e.preventDefault();
                          alert(`Share functionality coming soon for: ${note.title}`);
                        }}>
                        <ThemedText type="defaultSemiBold" style={styles.outlineButtonLabel}>
                          Share
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 72,
    gap: 24,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#101828',
    gap: 12,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroEyebrow: {
    color: '#A4BCFD',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroBody: {
    color: '#E4E7EC',
  },
  heroStreak: {
    color: '#FEC84B',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#475467',
  },
  secondaryButtonLabel: {
    color: '#E4E7EC',
  },
  templateRow: {
    gap: 12,
    paddingRight: 20,
  },
  templateCard: {
    width: 220,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    backgroundColor: '#0F172A',
    gap: 6,
  },
  templateHelper: {
    color: '#94A3B8',
  },
  templateAccentDot: {
    height: 10,
    width: 10,
    borderRadius: 999,
    alignSelf: 'flex-end',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  sectionHelper: {
    color: '#475467',
    marginTop: 4,
  },
  tinyLink: {
    color: '#7C3AED',
  },
  pinnedCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  pinnedImage: {
    width: '100%',
    height: 200,
  },
  pinnedContent: {
    padding: 20,
    gap: 12,
  },
  pinnedTitle: {
    color: '#FFFFFF',
  },
  pinnedBody: {
    color: '#CBD5F5',
  },
  pinnedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#0EA5E9',
  },
  tagPillText: {
    color: '#0A1F33',
  },
  photoStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  photoStripItem: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  noteCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  notePhoto: {
    width: '100%',
    height: 180,
  },
  noteContent: {
    padding: 20,
    gap: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  noteTitle: {
    flex: 1,
    color: '#FFFFFF',
  },
  noteBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#1D4ED8',
  },
  noteBadgeText: {
    color: '#E0E7FF',
  },
  noteBody: {
    color: '#E4E7EC',
  },
  noteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteTimestamp: {
    color: '#9CA3AF',
  },
  noteActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  captureButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  captureButtonLabel: {
    color: '#052E16',
  },
  outlineButton: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  outlineButtonLabel: {
    color: '#E5E7EB',
  },
  queueList: {
    gap: 12,
  },
  queueCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  queueDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  queueContent: {
    flex: 1,
    gap: 4,
  },
  queueEta: {
    color: '#94A3B8',
  },
  queueButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#7C3AED',
  },
  queueButtonLabel: {
    color: '#FFFFFF',
  },
  captureReminder: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#F4F3FF',
    gap: 8,
  },
  reminderBody: {
    color: '#475467',
  },
  autoUploadButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
  },
  autoUploadButtonLabel: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    gap: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyBody: {
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyButtonLabel: {
    color: '#FFFFFF',
  },
});
