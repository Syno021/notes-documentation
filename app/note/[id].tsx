import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { sampleNotes } from '@/constants/notes';

const captureTimeline = [
  { id: 'timeline-1', label: 'Wide reference', time: '10:32 AM', status: 'Tagged' },
  { id: 'timeline-2', label: 'Detail macro', time: '10:35 AM', status: 'Markup ready' },
  { id: 'timeline-3', label: 'Color gauge', time: '10:38 AM', status: 'Needs caption' },
];

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const note = sampleNotes.find((entry) => entry.id === id) ?? sampleNotes[0];

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: note.title }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.heroImageShell} onPress={() => alert('Expand gallery')}>
          <Image source={{ uri: note.coverImage }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay}>
            <View style={styles.heroMeta}>
              <View style={styles.heroTag}>
                <ThemedText type="defaultSemiBold" style={styles.heroTagText}>
                  {note.tag}
                </ThemedText>
              </View>
              <ThemedText style={styles.heroLocation}>{note.location}</ThemedText>
            </View>
            <View style={styles.heroMeta}>
              <ThemedText style={styles.heroLocation}>{note.lastEdited}</ThemedText>
              <Pressable style={styles.heroButton} onPress={() => alert('Share note')}>
                <ThemedText type="defaultSemiBold" style={styles.heroButtonLabel}>
                  Share
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoCarousel}>
          {note.photos.map((photo) => (
            <Pressable
              key={photo.id}
              style={styles.carouselCard}
              onPress={() => alert(`Open photo ${photo.caption}`)}>
              <Image source={{ uri: photo.uri }} style={styles.carouselImage} contentFit="cover" />
              <ThemedText style={styles.carouselCaption} numberOfLines={1}>
                {photo.caption}
              </ThemedText>
            </Pressable>
          ))}
          <Pressable style={styles.addPhotoCard} onPress={() => alert('Add new photo')}>
            <ThemedText type="defaultSemiBold" style={styles.addPhotoText}>
              + Capture more
            </ThemedText>
          </Pressable>
        </ScrollView>

        <ThemedView style={styles.detailsCard}>
          <ThemedText type="defaultSemiBold">Notebooks</ThemedText>
          <View style={styles.notebookRow}>
            {note.notebooks.map((book) => (
              <View key={book} style={styles.notebookPill}>
                <ThemedText type="defaultSemiBold" style={styles.notebookText}>
                  {book}
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={styles.summary}>{note.summary}</ThemedText>
        </ThemedView>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Checklist</ThemedText>
          <Pressable onPress={() => alert('Add checklist item')}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLink}>
              Add item
            </ThemedText>
          </Pressable>
        </View>
        <ThemedView style={styles.checklistCard}>
          {note.checklist.map((item) => (
            <View key={item.id} style={styles.checklistRow}>
              <View style={[styles.checkbox, item.done && styles.checkboxDone]} />
              <View style={styles.checklistTextWrapper}>
                <ThemedText
                  style={[styles.checklistText, item.done && styles.checklistTextDone]}>
                  {item.label}
                </ThemedText>
              </View>
              <Pressable onPress={() => alert(`Toggle ${item.label}`)}>
                <ThemedText style={styles.checklistToggle}>Toggle</ThemedText>
              </Pressable>
            </View>
          ))}
        </ThemedView>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Capture timeline</ThemedText>
          <Pressable onPress={() => alert('View capture details')}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLink}>
              See details
            </ThemedText>
          </Pressable>
        </View>
        <ThemedView style={styles.timelineCard}>
          {captureTimeline.map((entry, index) => (
            <View key={entry.id} style={styles.timelineRow}>
              <View style={styles.timelineIcon} />
              <View style={styles.timelineContent}>
                <ThemedText type="defaultSemiBold">{entry.label}</ThemedText>
                <ThemedText style={styles.timelineMeta}>
                  {entry.time} · {entry.status}
                </ThemedText>
              </View>
              {index !== captureTimeline.length - 1 && <View style={styles.timelineConnector} />}
            </View>
          ))}
        </ThemedView>

        <View style={styles.footerActions}>
          <Pressable style={styles.primaryAction} onPress={() => alert('Add more photos')}>
            <ThemedText type="defaultSemiBold" style={styles.primaryActionLabel}>
              Capture photos
            </ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.back()}>
            <ThemedText type="defaultSemiBold" style={styles.secondaryActionLabel}>
              Back
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    gap: 24,
  },
  heroImageShell: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTag: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#0EA5E9',
  },
  heroTagText: {
    color: '#0A1F33',
  },
  heroLocation: {
    color: '#E2E8F0',
  },
  heroButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  heroButtonLabel: {
    color: '#FFFFFF',
  },
  photoCarousel: {
    paddingVertical: 8,
    gap: 12,
  },
  carouselCard: {
    width: 160,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  carouselImage: {
    width: '100%',
    height: 130,
  },
  carouselCaption: {
    padding: 10,
    color: '#E2E8F0',
  },
  addPhotoCard: {
    width: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    color: '#7C3AED',
  },
  detailsCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0B1220',
    gap: 12,
  },
  notebookRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  notebookPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#1D4ED8',
  },
  notebookText: {
    color: '#E0E7FF',
  },
  summary: {
    color: '#CBD5F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLink: {
    color: '#7C3AED',
  },
  checklistCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#111827',
    gap: 12,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475467',
  },
  checkboxDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checklistTextWrapper: {
    flex: 1,
  },
  checklistText: {
    color: '#E4E7EC',
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  checklistToggle: {
    color: '#7C3AED',
  },
  timelineCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#0F172A',
    gap: 16,
  },
  timelineRow: {
    position: 'relative',
    paddingLeft: 32,
  },
  timelineIcon: {
    position: 'absolute',
    left: 0,
    top: 8,
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  timelineContent: {
    gap: 4,
  },
  timelineMeta: {
    color: '#94A3B8',
  },
  timelineConnector: {
    position: 'absolute',
    left: 5.5,
    top: 20,
    bottom: -20,
    width: 1,
    backgroundColor: 'rgba(148,163,184,0.5)',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#22C55E',
  },
  primaryActionLabel: {
    color: '#052E16',
  },
  secondaryAction: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#475467',
  },
  secondaryActionLabel: {
    color: '#E4E7EC',
  },
});

