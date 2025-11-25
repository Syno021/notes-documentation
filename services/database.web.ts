// Web fallback - uses in-memory storage
// Note: This is a simplified implementation for web compatibility
// The app is designed for mobile use with native SQLite

export interface CapturedImage {
  id?: number;
  noteId: string | null;
  imageData: string;
  thumbnailData: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
  saved: number;
}

export interface AudioRecording {
  id?: number;
  noteId: string | null;
  audioData: string;
  fileName: string;
  mimeType: string;
  duration: number;
  createdAt: string;
  saved: number;
}

export interface Note {
  id?: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private images: CapturedImage[] = [];
  private audio: AudioRecording[] = [];
  private notes: Note[] = [];
  private imageIdCounter = 1;
  private audioIdCounter = 1;

  async init() {
    console.log('Web storage initialized (in-memory only)');
    console.warn('⚠️ This app is designed for mobile. Web storage is temporary and will be lost on refresh.');
  }

  // Image operations
  async saveImage(image: Omit<CapturedImage, 'id'>): Promise<number> {
    const id = this.imageIdCounter++;
    this.images.push({ ...image, id });
    return id;
  }

  async getUnsavedImages(): Promise<CapturedImage[]> {
    return this.images.filter(img => img.saved === 0);
  }

  async getImagesByNoteId(noteId: string): Promise<CapturedImage[]> {
    return this.images.filter(img => img.noteId === noteId);
  }

  async markImageAsSaved(imageId: number, noteId: string): Promise<void> {
    const image = this.images.find(img => img.id === imageId);
    if (image) {
      image.saved = 1;
      image.noteId = noteId;
    }
  }

  async deleteImage(imageId: number): Promise<void> {
    this.images = this.images.filter(img => img.id !== imageId);
  }

  // Audio operations
  async saveAudio(audio: Omit<AudioRecording, 'id'>): Promise<number> {
    const id = this.audioIdCounter++;
    this.audio.push({ ...audio, id });
    return id;
  }

  async getUnsavedAudio(): Promise<AudioRecording[]> {
    return this.audio.filter(a => a.saved === 0);
  }

  async getAudioByNoteId(noteId: string): Promise<AudioRecording[]> {
    return this.audio.filter(a => a.noteId === noteId);
  }

  async markAudioAsSaved(audioId: number, noteId: string): Promise<void> {
    const audioItem = this.audio.find(a => a.id === audioId);
    if (audioItem) {
      audioItem.saved = 1;
      audioItem.noteId = noteId;
    }
  }

  async deleteAudio(audioId: number): Promise<void> {
    this.audio = this.audio.filter(a => a.id !== audioId);
  }

  // Note operations
  async saveNote(note: Note): Promise<void> {
    const existingIndex = this.notes.findIndex(n => n.id === note.id);
    if (existingIndex >= 0) {
      this.notes[existingIndex] = note;
    } else {
      this.notes.push(note);
    }
  }

  async getNote(noteId: string): Promise<Note | null> {
    return this.notes.find(n => n.id === noteId) || null;
  }

  async getAllNotes(): Promise<Note[]> {
    return [...this.notes].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async deleteNote(noteId: string): Promise<void> {
    this.notes = this.notes.filter(n => n.id !== noteId);
    // Also delete associated media
    this.images = this.images.filter(img => img.noteId !== noteId);
    this.audio = this.audio.filter(a => a.noteId !== noteId);
  }

  async cleanupOldUnsavedItems(daysOld: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTime = cutoffDate.getTime();

    this.images = this.images.filter(img => 
      img.saved === 1 || new Date(img.createdAt).getTime() > cutoffTime
    );

    this.audio = this.audio.filter(a => 
      a.saved === 1 || new Date(a.createdAt).getTime() > cutoffTime
    );
  }
}

export const databaseService = new DatabaseService();

