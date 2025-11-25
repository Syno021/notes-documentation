export interface CapturedImage {
  id?: number;
  noteId: string | null;
  imageData: string; // base64 encoded image
  thumbnailData: string; // base64 encoded thumbnail
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
  saved: number; // 0 for unsaved, 1 for saved
}

export interface AudioRecording {
  id?: number;
  noteId: string | null;
  audioData: string; // base64 encoded audio
  fileName: string;
  mimeType: string;
  duration: number;
  createdAt: string;
  saved: number; // 0 for unsaved, 1 for saved
}

export interface Note {
  id?: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseServiceInterface {
  init(): Promise<void>;
  saveImage(image: Omit<CapturedImage, 'id'>): Promise<number>;
  getUnsavedImages(): Promise<CapturedImage[]>;
  getImagesByNoteId(noteId: string): Promise<CapturedImage[]>;
  markImageAsSaved(imageId: number, noteId: string): Promise<void>;
  deleteImage(imageId: number): Promise<void>;
  saveAudio(audio: Omit<AudioRecording, 'id'>): Promise<number>;
  getUnsavedAudio(): Promise<AudioRecording[]>;
  getAudioByNoteId(noteId: string): Promise<AudioRecording[]>;
  markAudioAsSaved(audioId: number, noteId: string): Promise<void>;
  deleteAudio(audioId: number): Promise<void>;
  saveNote(note: Note): Promise<void>;
  getNote(noteId: string): Promise<Note | null>;
  getAllNotes(): Promise<Note[]>;
  deleteNote(noteId: string): Promise<void>;
  cleanupOldUnsavedItems(daysOld?: number): Promise<void>;
}

