import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, Modal, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNote } from '@/hooks/useNote';
import { base64ToDataUri, formatDuration } from '@/utils/mediaHelpers';
import { CapturedImage, AudioRecording } from '@/services/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { note, isLoading, error } = useNote(id);
  
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [playingAudio, setPlayingAudio] = useState<{ id: number; sound: Audio.Sound } | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      if (playingAudio) {
        playingAudio.sound.unloadAsync();
      }
    };
  }, [playingAudio]);

  const handlePlayAudio = async (audio: AudioRecording) => {
    try {
      // Stop currently playing audio if any
      if (playingAudio) {
        await playingAudio.sound.stopAsync();
        await playingAudio.sound.unloadAsync();
        
        if (playingAudio.id === audio.id) {
          setPlayingAudio(null);
          return;
        }
      }

      // Create audio URI from base64
      const audioUri = base64ToDataUri(audio.audioData, audio.mimeType);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          sound.unloadAsync();
        }
      });

      setPlayingAudio({ id: audio.id!, sound });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading note...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !note) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText type="title" style={styles.errorTitle}>
            Note Not Found
          </ThemedText>
          <ThemedText style={styles.errorText}>
            {error?.message || 'This note could not be loaded'}
          </ThemedText>
          <Pressable style={styles.errorButton} onPress={() => router.back()}>
            <ThemedText type="defaultSemiBold" style={styles.errorButtonLabel}>
              Go Back
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const coverImage = note.images.length > 0
    ? base64ToDataUri(note.images[0].imageData, note.images[0].mimeType)
    : 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&auto=format&fit=crop';

  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: note.title }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable 
          style={styles.heroImageShell} 
          onPress={() => note.images.length > 0 && setSelectedImage(note.images[0])}
        >
          <Image source={{ uri: coverImage }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay}>
            <View style={styles.heroMeta}>
              <View style={styles.heroTag}>
                <ThemedText type="defaultSemiBold" style={styles.heroTagText}>
                  {note.images.length} {note.images.length === 1 ? 'Photo' : 'Photos'}
                </ThemedText>
              </View>
              {note.audio.length > 0 && (
                <View style={[styles.heroTag, { backgroundColor: '#F59E0B' }]}>
                  <ThemedText type="defaultSemiBold" style={styles.heroTagText}>
                    {note.audio.length} Audio
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.heroMeta}>
              <ThemedText style={styles.heroLocation}>{formattedDate}</ThemedText>
              <Pressable style={styles.heroButton} onPress={() => Alert.alert('Share', 'Share functionality coming soon')}>
                <ThemedText type="defaultSemiBold" style={styles.heroButtonLabel}>
                  Share
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>

        {/* Images Carousel */}
        {note.images.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Photos ({note.images.length})</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoCarousel}>
              {note.images.map((image) => (
                <Pressable
                  key={image.id}
                  style={styles.carouselCard}
                  onPress={() => setSelectedImage(image)}>
                  <Image 
                    source={{ uri: base64ToDataUri(image.thumbnailData, image.mimeType) }} 
                    style={styles.carouselImage} 
                    contentFit="cover" 
                  />
                  <ThemedText style={styles.carouselCaption} numberOfLines={1}>
                    {image.fileName}
                  </ThemedText>
                </Pressable>
              ))}
              <Pressable style={styles.addPhotoCard} onPress={() => router.push('/(tabs)/capture')}>
                <ThemedText type="defaultSemiBold" style={styles.addPhotoText}>
                  + Capture more
                </ThemedText>
              </Pressable>
            </ScrollView>
          </>
        )}

        {/* Audio Recordings */}
        {note.audio.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Audio Recordings ({note.audio.length})</ThemedText>
            </View>
            <ThemedView style={styles.audioList}>
              {note.audio.map((audio) => (
                <Pressable
                  key={audio.id}
                  style={[
                    styles.audioCard,
                    playingAudio?.id === audio.id && styles.audioCardPlaying
                  ]}
                  onPress={() => handlePlayAudio(audio)}>
                  <Ionicons
                    name={playingAudio?.id === audio.id ? "pause-circle" : "play-circle"}
                    size={48}
                    color="#7C3AED"
                  />
                  <View style={styles.audioInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.audioTitle}>
                      {audio.fileName}
                    </ThemedText>
                    <ThemedText style={styles.audioDuration}>
                      {formatDuration(audio.duration)}
                    </ThemedText>
                  </View>
                  {playingAudio?.id === audio.id && (
                    <View style={styles.playingIndicator}>
                      <ThemedText style={styles.playingText}>Playing...</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </ThemedView>
          </>
        )}

        {/* Note Details */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Note Details</ThemedText>
        </View>
        <ThemedView style={styles.detailsCard}>
          <ThemedText type="defaultSemiBold" style={styles.detailLabel}>
            Title
          </ThemedText>
          <ThemedText style={styles.detailValue}>{note.title}</ThemedText>
          
          {note.description && (
            <>
              <ThemedText type="defaultSemiBold" style={[styles.detailLabel, { marginTop: 16 }]}>
                Description
              </ThemedText>
              <ThemedText style={styles.summary}>{note.description}</ThemedText>
            </>
          )}
          
          <ThemedText type="defaultSemiBold" style={[styles.detailLabel, { marginTop: 16 }]}>
            Created
          </ThemedText>
          <ThemedText style={styles.detailValue}>
            {new Date(note.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </ThemedText>
        </ThemedView>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <Pressable 
            style={styles.primaryAction} 
            onPress={() => router.push(`/(tabs)/capture?noteId=${note.id}`)}
          >
            <ThemedText type="defaultSemiBold" style={styles.primaryActionLabel}>
              Edit / Add Content
            </ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.back()}>
            <ThemedText type="defaultSemiBold" style={styles.secondaryActionLabel}>
              Back
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Full Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setSelectedImage(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                {selectedImage?.fileName || 'Image'}
              </ThemedText>
              <Pressable onPress={() => setSelectedImage(null)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </Pressable>
            </View>
            {selectedImage && (
              <ScrollView 
                style={styles.modalImageContainer}
                contentContainerStyle={styles.modalImageContent}
                maximumZoomScale={3}
                minimumZoomScale={1}>
                <Image
                  source={{ uri: base64ToDataUri(selectedImage.imageData, selectedImage.mimeType) }}
                  style={styles.fullImage}
                  contentFit="contain"
                />
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <ThemedText style={styles.modalInfo}>
                Pinch to zoom • Tap outside to close
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 8,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  errorButtonLabel: {
    color: '#FFFFFF',
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
    gap: 8,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  summary: {
    color: '#CBD5F5',
    lineHeight: 22,
  },
  audioList: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#0F172A',
    gap: 12,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  audioCardPlaying: {
    borderColor: '#7C3AED',
    backgroundColor: '#2D1B69',
  },
  audioInfo: {
    flex: 1,
    gap: 4,
  },
  audioTitle: {
    color: '#FFFFFF',
  },
  audioDuration: {
    color: '#94A3B8',
    fontSize: 14,
  },
  playingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#7C3AED',
  },
  playingText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLink: {
    color: '#7C3AED',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  modalImageContainer: {
    flex: 1,
  },
  modalImageContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.5,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
  },
  modalInfo: {
    color: '#94A3B8',
    fontSize: 12,
  },
});

