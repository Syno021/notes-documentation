import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const capturedShots = [
  {
    id: 'capture-1',
    uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop',
    label: 'Sketch board',
  },
  {
    id: 'capture-2',
    uri: 'https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=900&auto=format&fit=crop',
    label: 'Close-up detail',
  },
  {
    id: 'capture-3',
    uri: 'https://images.unsplash.com/photo-1500534314212-1e33f9c41a5b?w=900&auto=format&fit=crop',
    label: 'Lighting reference',
  },
];

const guidance = [
  'Hold steady for 2 seconds for auto-level to lock.',
  'Capture each angle you want to reference later.',
  'Tap markup to sketch directly on top after capture.',
];

export default function CaptureScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.previewShell}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&auto=format&fit=crop',
            }}
            style={styles.cameraPreview}
            contentFit="cover"
          />
          <View style={styles.overlayGrid}>
            <View style={styles.gridLineVertical} />
            <View style={styles.gridLineHorizontal} />
          </View>
          <View style={styles.previewMeta}>
            <View>
              <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
                Auto-align ready
              </ThemedText>
              <ThemedText style={styles.previewHint}>Surface detected · 98% leveled</ThemedText>
            </View>
            <Pressable style={styles.lensButton} onPress={() => alert('Switch lens')}>
              <ThemedText type="defaultSemiBold" style={styles.lensLabel}>
                Wide
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.captureControls}>
          <Pressable style={styles.utilityButton} onPress={() => alert('Enable markup')}>
            <ThemedText type="defaultSemiBold" style={styles.utilityLabel}>
              Markup
            </ThemedText>
          </Pressable>
          <Pressable style={styles.shutterButton} onPress={() => alert('Capture photo')} />
          <Pressable style={styles.utilityButton} onPress={() => alert('Toggle timer')}>
            <ThemedText type="defaultSemiBold" style={styles.utilityLabel}>
              Timer
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Captured for this note</ThemedText>
          <Pressable onPress={() => alert('Review all')}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLink}>
              Review
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.capturedRow}>
          {capturedShots.map((shot) => (
            <Pressable key={shot.id} style={styles.capturedCard} onPress={() => alert(`Annotate ${shot.label}`)}>
              <Image source={{ uri: shot.uri }} style={styles.capturedImage} contentFit="cover" />
              <ThemedText style={styles.capturedLabel}>{shot.label}</ThemedText>
            </Pressable>
          ))}
          <Pressable style={styles.capturedUpload} onPress={() => alert('Import from camera roll')}>
            <ThemedText type="defaultSemiBold" style={styles.capturedUploadLabel}>
              Import from roll
            </ThemedText>
          </Pressable>
        </ScrollView>

        <ThemedView style={styles.tipsCard}>
          <ThemedText type="defaultSemiBold">Capture tips</ThemedText>
          {guidance.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <ThemedText style={styles.tipText}>{tip}</ThemedText>
            </View>
          ))}
        </ThemedView>

        <View style={styles.footerActions}>
          <Pressable style={styles.footerButton} onPress={() => alert('Save to note')}>
            <ThemedText type="defaultSemiBold" style={styles.footerButtonLabel}>
              Save to note
            </ThemedText>
          </Pressable>
          <Pressable style={styles.footerGhostButton} onPress={() => alert('Discard capture')}>
            <ThemedText type="defaultSemiBold" style={styles.footerGhostLabel}>
              Discard
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
    padding: 20,
  },
  content: {
    gap: 24,
    paddingBottom: 64,
  },
  previewShell: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  cameraPreview: {
    width: '100%',
    height: 360,
  },
  overlayGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  previewTitle: {
    color: '#FFFFFF',
  },
  previewHint: {
    color: '#CBD5F5',
  },
  lensButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  lensLabel: {
    color: '#FFFFFF',
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  utilityButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
  },
  utilityLabel: {
    color: '#E2E8F0',
  },
  shutterButton: {
    height: 86,
    width: 86,
    borderRadius: 43,
    borderWidth: 8,
    borderColor: '#1E1B4B',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLink: {
    color: '#7C3AED',
  },
  capturedRow: {
    gap: 16,
    paddingVertical: 4,
  },
  capturedCard: {
    width: 140,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  capturedImage: {
    width: '100%',
    height: 120,
  },
  capturedLabel: {
    padding: 10,
    color: '#E2E8F0',
  },
  capturedUpload: {
    width: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  capturedUploadLabel: {
    color: '#7C3AED',
    textAlign: 'center',
  },
  tipsCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0B1220',
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  tipDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  tipText: {
    color: '#CBD5F5',
    flex: 1,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
  },
  footerButtonLabel: {
    color: '#FFFFFF',
  },
  footerGhostButton: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#475467',
  },
  footerGhostLabel: {
    color: '#E4E7EC',
  },
});

