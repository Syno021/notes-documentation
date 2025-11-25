import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Modal, 
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDatabase } from '@/contexts/DatabaseContext';
import { databaseService, CapturedImage, AudioRecording } from '@/services/database';
import { base64ToDataUri, formatDuration } from '@/utils/mediaHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

export default function ReviewScreen() {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<{ id: number; sound: Audio.Sound } | null>(null);
  
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isReady } = useDatabase();

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadUnsavedContent();
  }, [isReady]);

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      if (playingAudio) {
        playingAudio.sound.unloadAsync();
      }
    };
  }, [playingAudio]);

  const loadUnsavedContent = async () => {
    if (!isReady) return;

    try {
      setIsLoading(true);
      const [unsavedImages, unsavedAudio] = await Promise.all([
        databaseService.getUnsavedImages(),
        databaseService.getUnsavedAudio(),
      ]);

      setImages(unsavedImages);
      setAudioRecordings(unsavedAudio);
    } catch (error) {
      console.error('Error loading unsaved content:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <ThemedText style={styles.loadingText}>Loading captures...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? '#FFFFFF' : '#000000'} 
          />
        </Pressable>
        <ThemedText type="title" style={styles.title}>
          Review Captures
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        {images.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Images ({images.length})
            </ThemedText>
            <View style={styles.imageGrid}>
              {images.map((image) => (
                <Pressable
                  key={image.id}
                  style={styles.gridItem}
                  onPress={() => setSelectedImage(image)}
                >
                  <Image
                    source={{ uri: base64ToDataUri(image.thumbnailData, image.mimeType) }}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Audio Section */}
        {audioRecordings.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Audio Recordings ({audioRecordings.length})
            </ThemedText>
            {audioRecordings.map((audio) => (
              <Pressable
                key={audio.id}
                style={[
                  styles.audioCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                  },
                  playingAudio?.id === audio.id && styles.audioCardPlaying,
                ]}
                onPress={() => handlePlayAudio(audio)}
              >
                <View style={styles.audioInfo}>
                  <Ionicons
                    name={playingAudio?.id === audio.id ? "pause-circle" : "play-circle"}
                    size={40}
                    color={isDark ? '#A78BFA' : '#7C3AED'}
                  />
                  <View style={styles.audioDetails}>
                    <ThemedText type="defaultSemiBold">
                      {audio.fileName}
                    </ThemedText>
                    <ThemedText style={styles.audioDuration}>
                      {formatDuration(audio.duration)}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {images.length === 0 && audioRecordings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="camera-outline"
              size={64}
              color={isDark ? '#64748B' : '#94A3B8'}
            />
            <ThemedText style={styles.emptyText}>
              No captures to review
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Go to the Capture tab to take photos or record audio
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setSelectedImage(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                Image Preview
              </ThemedText>
              <Pressable onPress={() => setSelectedImage(null)}>
                <Ionicons name="close" size={28} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            </View>
            {selectedImage && (
              <Image
                source={{ uri: base64ToDataUri(selectedImage.imageData, selectedImage.mimeType) }}
                style={styles.fullImage}
                contentFit="contain"
              />
            )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  audioCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  audioCardPlaying: {
    borderColor: '#7C3AED',
    borderWidth: 2,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  audioDetails: {
    flex: 1,
    gap: 4,
  },
  audioDuration: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
  },
  fullImage: {
    width: '100%',
    height: 400,
  },
});

