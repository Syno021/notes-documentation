import { useState, useEffect } from 'react';
import { databaseService, Note, CapturedImage, AudioRecording } from '@/services/database';
import { useDatabase } from '@/contexts/DatabaseContext';

export interface NoteDetail extends Note {
  images: CapturedImage[];
  audio: AudioRecording[];
}

export function useNote(noteId: string | undefined) {
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isReady } = useDatabase();

  const loadNote = async () => {
    if (!isReady || !noteId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get note from database
      const noteData = await databaseService.getNote(noteId);
      
      if (!noteData) {
        throw new Error('Note not found');
      }

      // Load media for the note
      const [images, audio] = await Promise.all([
        databaseService.getImagesByNoteId(noteId),
        databaseService.getAudioByNoteId(noteId),
      ]);

      setNote({
        ...noteData,
        images,
        audio,
      });
    } catch (err) {
      console.error('Error loading note:', err);
      setError(err instanceof Error ? err : new Error('Failed to load note'));
      setNote(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNote();
  }, [isReady, noteId]);

  return {
    note,
    isLoading,
    error,
    refresh: loadNote,
  };
}

