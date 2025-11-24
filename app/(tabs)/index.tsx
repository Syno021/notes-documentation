import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { sampleNotes } from '@/constants/notes';

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
  const pinned = sampleNotes[0];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
            <Pressable style={styles.primaryButton} onPress={() => alert('Start note with camera')}>
              <ThemedText type="defaultSemiBold" style={styles.primaryButtonLabel}>
                Capture + note
              </ThemedText>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => alert('Open templates')}>
              <ThemedText type="defaultSemiBold" style={styles.secondaryButtonLabel}>
                Choose template
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

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="subtitle">Pinned capture</ThemedText>
            <ThemedText style={styles.sectionHelper}>
              Continue adding photos or turn it into a shareable doc.
            </ThemedText>
          </View>
          <Pressable onPress={() => alert('Manage pins')}>
            <ThemedText type="defaultSemiBold" style={styles.tinyLink}>
              Manage
            </ThemedText>
          </Pressable>
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
                  {pinned.summary}
                </ThemedText>
                <View style={styles.pinnedMetaRow}>
                  <View style={styles.tagPill}>
                    <ThemedText type="defaultSemiBold" style={styles.tagPillText}>
                      {pinned.tag}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.noteTimestamp}>{pinned.lastEdited}</ThemedText>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.photoStrip}>
                    {pinned.photos.map((photo) => (
                      <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoStripItem} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ThemedView>
          </Pressable>
        </Link>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Today&apos;s captures</ThemedText>
          <Pressable onPress={() => alert('Open calendar')}>
            <ThemedText type="defaultSemiBold" style={styles.tinyLink}>
              Calendar
            </ThemedText>
          </Pressable>
        </View>

        {sampleNotes.map((note) => (
          <Link key={note.id} href={`/note/${note.id}`} asChild>
            <Pressable style={styles.noteCard}>
              <Image source={{ uri: note.coverImage }} style={styles.notePhoto} contentFit="cover" />
              <View style={styles.noteContent}>
                <View style={styles.noteHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
                    {note.title}
                  </ThemedText>
                  <View style={styles.noteBadge}>
                    <ThemedText type="defaultSemiBold" style={styles.noteBadgeText}>
                      {note.photos.length} photos
                    </ThemedText>
                  </View>
                </View>
                <ThemedText numberOfLines={2} style={styles.noteBody}>
                  {note.summary}
                </ThemedText>
                <View style={styles.noteMetaRow}>
                  <ThemedText style={styles.noteTimestamp}>{note.lastEdited}</ThemedText>
                  <ThemedText style={styles.noteTimestamp}>{note.location}</ThemedText>
                </View>
                <View style={styles.noteActionRow}>
                  <Pressable
                    style={styles.captureButton}
                    onPress={() => alert(`Add photo to ${note.title}`)}>
                    <ThemedText type="defaultSemiBold" style={styles.captureButtonLabel}>
                      Add photo
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.outlineButton}
                    onPress={() => alert(`Share ${note.title}`)}>
                    <ThemedText type="defaultSemiBold" style={styles.outlineButtonLabel}>
                      Share
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Link>
        ))}

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Capture queue</ThemedText>
          <Pressable onPress={() => alert('View all reminders')}>
            <ThemedText type="defaultSemiBold" style={styles.tinyLink}>
              See all
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.queueList}>
          {captureQueue.map((item) => (
            <ThemedView key={item.id} style={styles.queueCard}>
              <View style={[styles.queueDot, { backgroundColor: item.color }]} />
              <View style={styles.queueContent}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={styles.queueEta}>{item.eta}</ThemedText>
              </View>
              <Pressable
                style={styles.queueButton}
                onPress={() => alert(`Capture for ${item.title}`)}>
                <ThemedText type="defaultSemiBold" style={styles.queueButtonLabel}>
                  Capture now
                </ThemedText>
              </Pressable>
            </ThemedView>
          ))}
        </View>

        <ThemedView style={styles.captureReminder}>
          <ThemedText type="defaultSemiBold">Hands-free capture</ThemedText>
          <ThemedText style={styles.reminderBody}>
            Enable auto-upload to turn every camera snap into a new note instantly.
          </ThemedText>
          <Pressable style={styles.autoUploadButton} onPress={() => alert('Enable auto-upload')}>
            <ThemedText type="defaultSemiBold" style={styles.autoUploadButtonLabel}>
              Enable auto-upload
            </ThemedText>
          </Pressable>
        </ThemedView>
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
});
