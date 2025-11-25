import { useState, useEffect } from 'react';
import { databaseService, Note, CapturedImage, AudioRecording } from '@/services/database';
import { useDatabase } from '@/contexts/DatabaseContext';
import { base64ToDataUri } from '@/utils/mediaHelpers';

export interface NoteWithMedia extends Note {
  images: CapturedImage[];
  audio: AudioRecording[];
  coverImage: string;
  photoCount: number;
  audioCount: number;
  lastEdited: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteWithMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isReady } = useDatabase();

  const loadNotes = async () => {
    if (!isReady) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get all notes from database
      const allNotes = await databaseService.getAllNotes();

      // Load media for each note
      const notesWithMedia: NoteWithMedia[] = await Promise.all(
        allNotes.map(async (note) => {
          const [images, audio] = await Promise.all([
            databaseService.getImagesByNoteId(note.id!),
            databaseService.getAudioByNoteId(note.id!),
          ]);

          // Use first image as cover, or a placeholder
          const coverImage = images.length > 0 
            ? base64ToDataUri(images[0].thumbnailData, images[0].mimeType)
            : 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&auto=format&fit=crop';

          // Format last edited time
          const updatedDate = new Date(note.updatedAt);
          const now = new Date();
          const diffMs = now.getTime() - updatedDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          let lastEdited: string;
          if (diffMins < 1) {
            lastEdited = 'Just now';
          } else if (diffMins < 60) {
            lastEdited = `${diffMins} min ago`;
          } else if (diffHours < 24) {
            lastEdited = `Today · ${updatedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
          } else if (diffDays === 1) {
            lastEdited = `Yesterday · ${updatedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
          } else if (diffDays < 7) {
            lastEdited = `${diffDays} days ago`;
          } else {
            lastEdited = updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }

          return {
            ...note,
            images,
            audio,
            coverImage,
            photoCount: images.length,
            audioCount: audio.length,
            lastEdited,
          };
        })
      );

      setNotes(notesWithMedia);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError(err instanceof Error ? err : new Error('Failed to load notes'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [isReady]);

  return {
    notes,
    isLoading,
    error,
    refresh: loadNotes,
  };
}

