import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebCamera } from '@/components/WebCamera';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AudioRecording, CapturedImage, databaseService } from '@/services/database';
import { base64ToDataUri, createThumbnail, fileToBase64, formatDuration, generateFileName } from '@/utils/mediaHelpers';

export default function CaptureScreen() {
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [showWebCamera, setShowWebCamera] = useState(false);
  
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isReady } = useDatabase();

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    // Load note for editing or unsaved captures
    if (noteId) {
      loadExistingNote(noteId);
    } else {
      loadUnsavedCaptures();
    }
  }, [isReady, noteId]);

  const loadExistingNote = async (id: string) => {
    if (!isReady) return;
    
    try {
      setIsLoadingNote(true);
      const note = await databaseService.getNote(id);
      
      if (!note) {
        Alert.alert('Error', 'Note not found');
        router.back();
        return;
      }

      // Load note data
      setTitle(note.title);
      setDescription(note.description || '');
      setIsEditMode(true);

      // Load existing images and audio
      const [images, audio] = await Promise.all([
        databaseService.getImagesByNoteId(id),
        databaseService.getAudioByNoteId(id),
      ]);

      setCapturedImages(images);
      setAudioRecordings(audio);
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note');
    } finally {
      setIsLoadingNote(false);
    }
  };

  const loadUnsavedCaptures = async () => {
    if (!isReady) return;
    
    try {
      const images = await databaseService.getUnsavedImages();
      const audio = await databaseService.getUnsavedAudio();
      setCapturedImages(images);
      setAudioRecordings(audio);
    } catch (error) {
      console.error('Error loading unsaved captures:', error);
    }
  };

  const handleCaptureImage = async () => {
    try {
      console.log('Camera button clicked - Platform:', Platform.OS);
      
      // On web, use custom web camera component
      if (Platform.OS === 'web') {
        console.log('Opening web camera modal...');
        setShowWebCamera(true);
        return;
      }

      // On native platforms, use ImagePicker
      console.log('Requesting camera permissions...');
      
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      console.log('Camera permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Camera permission is required to take photos. Please enable camera access in your device settings.');
        return;
      }

      console.log('Launching camera...');
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Allow full image without cropping
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Image captured, saving to database...');
        await saveImageToDatabase(result.assets[0].uri);
        console.log('Image saved successfully!');
      } else {
        console.log('Camera was canceled or no image captured');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', `Failed to capture image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleWebCameraCapture = async (dataUrl: string) => {
    try {
      console.log('Web camera captured image, saving...');
      // DataUrl is already base64, extract it
      const base64Data = dataUrl.split(',')[1];
      const thumbnailBase64 = await createThumbnail(dataUrl);
      const fileName = generateFileName('image', 'jpg');

      const imageData: Omit<CapturedImage, 'id'> = {
        noteId: isEditMode ? noteId! : null,
        imageData: base64Data,
        thumbnailData: thumbnailBase64,
        fileName,
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        createdAt: new Date().toISOString(),
        saved: isEditMode ? 1 : 0,
      };

      const id = await databaseService.saveImage(imageData);
      setCapturedImages(prev => [...prev, { ...imageData, id }]);
      
      if (isEditMode) {
        Alert.alert('Success', 'Image added to note');
      }
      
      console.log('Web camera image saved successfully!');
    } catch (error) {
      console.error('Error saving web camera image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleUploadImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media library permission is required to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        for (const asset of result.assets) {
          await saveImageToDatabase(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const saveImageToDatabase = async (uri: string) => {
    try {
      const base64Image = await fileToBase64(uri);
      const thumbnailBase64 = await createThumbnail(uri);
      const fileName = generateFileName('image', 'jpg');

      const imageData: Omit<CapturedImage, 'id'> = {
        noteId: isEditMode ? noteId! : null,
        imageData: base64Image,
        thumbnailData: thumbnailBase64,
        fileName,
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        createdAt: new Date().toISOString(),
        saved: isEditMode ? 1 : 0,
      };

      const id = await databaseService.saveImage(imageData);
      setCapturedImages(prev => [...prev, { ...imageData, id }]);
      
      if (isEditMode) {
        Alert.alert('Success', 'Image added to note');
      }
    } catch (error) {
      console.error('Error saving image to database:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleStartRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        await saveAudioToDatabase(uri, recordingDuration);
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const saveAudioToDatabase = async (uri: string, duration: number) => {
    try {
      const base64Audio = await fileToBase64(uri);
      const fileName = generateFileName('audio', 'm4a');

      const audioData: Omit<AudioRecording, 'id'> = {
        noteId: isEditMode ? noteId! : null,
        audioData: base64Audio,
        fileName,
        mimeType: 'audio/m4a',
        duration,
        createdAt: new Date().toISOString(),
        saved: isEditMode ? 1 : 0,
      };

      const id = await databaseService.saveAudio(audioData);
      setAudioRecordings(prev => [...prev, { ...audioData, id }]);
      
      if (isEditMode) {
        Alert.alert('Success', 'Audio recording added to note');
      }
    } catch (error) {
      console.error('Error saving audio to database:', error);
      Alert.alert('Error', 'Failed to save audio');
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteImage(imageId);
              setCapturedImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
              console.error('Error removing image:', error);
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleRemoveAudio = async (audioId: number) => {
    Alert.alert(
      'Delete Audio',
      'Are you sure you want to delete this audio recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteAudio(audioId);
              setAudioRecordings(prev => prev.filter(audio => audio.id !== audioId));
            } catch (error) {
              console.error('Error removing audio:', error);
              Alert.alert('Error', 'Failed to delete audio');
            }
          },
        },
      ]
    );
  };

  const handleSaveNote = async () => {
    console.log('Save button clicked!');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Images:', capturedImages.length);
    console.log('Audio:', audioRecordings.length);
    console.log('Edit mode:', isEditMode);
    
    // Check if there's any content
    const hasText = title.trim() || description.trim();
    const hasMedia = capturedImages.length > 0 || audioRecordings.length > 0;

    if (!hasText && !hasMedia) {
      console.log('Validation failed: No content');
      Alert.alert('Nothing to Save', 'Please add a title, description, or capture some media');
      return;
    }

    if (!hasText) {
      console.log('Validation failed: No text');
      Alert.alert('Missing Information', 'Please add a title or description for your note');
      return;
    }

    console.log('Validation passed, saving...');
    setIsSaving(true);

    try {
      const now = new Date().toISOString();

      if (isEditMode && noteId) {
        // Update existing note
        await databaseService.saveNote({
          id: noteId,
          title,
          description,
          createdAt: (await databaseService.getNote(noteId))?.createdAt || now,
          updatedAt: now,
        });

        Alert.alert('Success', 'Note updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        // Create new note
        const newNoteId = `note_${Date.now()}`;

        // Save the note
        await databaseService.saveNote({
          id: newNoteId,
          title,
          description,
          createdAt: now,
          updatedAt: now,
        });

        // Mark all images as saved
        for (const image of capturedImages) {
          if (image.id) {
            await databaseService.markImageAsSaved(image.id, newNoteId);
          }
        }

        // Mark all audio as saved
        for (const audio of audioRecordings) {
          if (audio.id) {
            await databaseService.markAudioAsSaved(audio.id, newNoteId);
          }
        }

        Alert.alert('Success', 'Note saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setCapturedImages([]);
              setAudioRecordings([]);
              router.back();
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (capturedImages.length > 0 || audioRecordings.length > 0) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved captures. They will be kept until you save or delete them.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoadingNote) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading note...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </Pressable>
          <ThemedText type="title" style={styles.screenTitle}>
            {isEditMode ? 'Edit Note' : 'Create Note'}
          </ThemedText>
          {!isEditMode && (
            <Pressable 
              onPress={() => router.push('/review')} 
              style={styles.reviewButton}
            >
              <Ionicons 
                name="images-outline" 
                size={24} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
            </Pressable>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Title
          </ThemedText>
          <TextInput
            style={[
              styles.titleInput,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: isDark ? '#334155' : '#CBD5E1',
              }
            ]}
            placeholder="Enter note title..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Description
          </ThemedText>
          <TextInput
            style={[
              styles.descriptionInput,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: isDark ? '#334155' : '#CBD5E1',
              }
            ]}
            placeholder="Enter note description..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.actionButton} 
            onPress={handleCaptureImage}
            disabled={isSaving}
          >
            <Ionicons 
              name="camera" 
              size={24} 
              color="#FFFFFF" 
            />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Camera
            </ThemedText>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, styles.uploadButton]} 
            onPress={handleUploadImage}
            disabled={isSaving}
          >
            <Ionicons 
              name="images" 
              size={24} 
              color="#FFFFFF" 
            />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Gallery
            </ThemedText>
          </Pressable>

          <Pressable 
            style={[
              styles.actionButton, 
              isRecording ? styles.recordingButton : styles.audioButton
            ]} 
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isSaving}
          >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic"} 
              size={24} 
              color="#FFFFFF" 
            />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              {isRecording ? formatDuration(recordingDuration) : 'Audio'}
            </ThemedText>
          </Pressable>
        </View>

        {/* Captured Images Preview */}
        {capturedImages.length > 0 && (
          <View style={styles.imagesSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Captured Images ({capturedImages.length})
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesRow}
            >
              {capturedImages.map((image) => (
                <View key={image.id} style={styles.imageCard}>
                  <Image 
                    source={{ uri: base64ToDataUri(image.thumbnailData, image.mimeType) }} 
                    style={styles.previewImage} 
                    contentFit="cover" 
                  />
                  <Pressable 
                    style={styles.removeButton}
                    onPress={() => image.id && handleRemoveImage(image.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Audio Recordings */}
        {audioRecordings.length > 0 && (
          <View style={styles.audioSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Audio Recordings ({audioRecordings.length})
            </ThemedText>
            {audioRecordings.map((audio) => (
              <View 
                key={audio.id} 
                style={[
                  styles.audioCard,
                  { 
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                  }
                ]}
              >
                <View style={styles.audioInfo}>
                  <Ionicons 
                    name="musical-notes" 
                    size={24} 
                    color={isDark ? '#A78BFA' : '#7C3AED'} 
                  />
                  <View style={styles.audioDetails}>
                    <ThemedText type="defaultSemiBold">
                      {audio.fileName}
                    </ThemedText>
                    <ThemedText style={styles.audioDuration}>
                      Duration: {formatDuration(audio.duration)}
                    </ThemedText>
                  </View>
                </View>
                <Pressable 
                  onPress={() => audio.id && handleRemoveAudio(audio.id)}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={24} 
                    color="#EF4444" 
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Save Button */}
        <Pressable 
          style={({ pressed }) => [
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
            pressed && styles.saveButtonPressed,
          ]} 
          onPress={() => {
            console.log('Button press detected');
            handleSaveNote();
          }}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
              {isEditMode ? 'Update Note' : 'Save Note'}
            </ThemedText>
          )}
        </Pressable>
        
        {/* Spacer for bottom padding on web */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Web Camera Modal */}
      {Platform.OS === 'web' && (
        <WebCamera
          visible={showWebCamera}
          onClose={() => setShowWebCamera(false)}
          onCapture={handleWebCameraCapture}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  content: {
    gap: 20,
    paddingBottom: 64,
  },
  loadingContainer: {
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
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  screenTitle: {
    flex: 1,
  },
  reviewButton: {
    padding: 4,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 150,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  uploadButton: {
    backgroundColor: '#10B981',
  },
  audioButton: {
    backgroundColor: '#F59E0B',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagesSection: {
    marginTop: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
  },
  imagesRow: {
    gap: 12,
    paddingVertical: 4,
  },
  imageCard: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  audioSection: {
    marginTop: 8,
    gap: 12,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  audioDetails: {
    flex: 1,
    gap: 4,
  },
  audioDuration: {
    fontSize: 12,
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    cursor: 'pointer' as any,
    userSelect: 'none' as any,
  },
  saveButtonPressed: {
    backgroundColor: '#6D28D9',
    opacity: 0.9,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
    cursor: 'not-allowed' as any,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

