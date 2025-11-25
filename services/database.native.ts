import * as SQLite from 'expo-sqlite';

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

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('notesCapture.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Create notes table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Create images table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        noteId TEXT,
        imageData TEXT NOT NULL,
        thumbnailData TEXT NOT NULL,
        fileName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        saved INTEGER DEFAULT 0,
        FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
      );
    `);

    // Create audio table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS audio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        noteId TEXT,
        audioData TEXT NOT NULL,
        fileName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        duration REAL NOT NULL,
        createdAt TEXT NOT NULL,
        saved INTEGER DEFAULT 0,
        FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for better query performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_images_noteId ON images(noteId);
      CREATE INDEX IF NOT EXISTS idx_images_saved ON images(saved);
      CREATE INDEX IF NOT EXISTS idx_audio_noteId ON audio(noteId);
      CREATE INDEX IF NOT EXISTS idx_audio_saved ON audio(saved);
    `);
  }

  // Image operations
  async saveImage(image: Omit<CapturedImage, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO images (noteId, imageData, thumbnailData, fileName, mimeType, width, height, createdAt, saved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        image.noteId,
        image.imageData,
        image.thumbnailData,
        image.fileName,
        image.mimeType,
        image.width,
        image.height,
        image.createdAt,
        image.saved,
      ]
    );

    return result.lastInsertRowId;
  }

  async getUnsavedImages(): Promise<CapturedImage[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<CapturedImage>(
      'SELECT * FROM images WHERE saved = 0 ORDER BY createdAt DESC'
    );

    return result;
  }

  async getImagesByNoteId(noteId: string): Promise<CapturedImage[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<CapturedImage>(
      'SELECT * FROM images WHERE noteId = ? ORDER BY createdAt ASC',
      [noteId]
    );

    return result;
  }

  async markImageAsSaved(imageId: number, noteId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE images SET saved = 1, noteId = ? WHERE id = ?',
      [noteId, imageId]
    );
  }

  async deleteImage(imageId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM images WHERE id = ?', [imageId]);
  }

  // Audio operations
  async saveAudio(audio: Omit<AudioRecording, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO audio (noteId, audioData, fileName, mimeType, duration, createdAt, saved) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        audio.noteId,
        audio.audioData,
        audio.fileName,
        audio.mimeType,
        audio.duration,
        audio.createdAt,
        audio.saved,
      ]
    );

    return result.lastInsertRowId;
  }

  async getUnsavedAudio(): Promise<AudioRecording[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<AudioRecording>(
      'SELECT * FROM audio WHERE saved = 0 ORDER BY createdAt DESC'
    );

    return result;
  }

  async getAudioByNoteId(noteId: string): Promise<AudioRecording[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<AudioRecording>(
      'SELECT * FROM audio WHERE noteId = ? ORDER BY createdAt ASC',
      [noteId]
    );

    return result;
  }

  async markAudioAsSaved(audioId: number, noteId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE audio SET saved = 1, noteId = ? WHERE id = ?',
      [noteId, audioId]
    );
  }

  async deleteAudio(audioId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM audio WHERE id = ?', [audioId]);
  }

  // Note operations
  async saveNote(note: Note): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO notes (id, title, description, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [note.id, note.title, note.description, note.createdAt, note.updatedAt]
    );
  }

  async getNote(noteId: string): Promise<Note | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Note>(
      'SELECT * FROM notes WHERE id = ?',
      [noteId]
    );

    return result || null;
  }

  async getAllNotes(): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Note>(
      'SELECT * FROM notes ORDER BY updatedAt DESC'
    );

    return result;
  }

  async deleteNote(noteId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM notes WHERE id = ?', [noteId]);
  }

  // Cleanup unsaved items older than X days
  async cleanupOldUnsavedItems(daysOld: number = 7): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffString = cutoffDate.toISOString();

    await this.db.runAsync(
      'DELETE FROM images WHERE saved = 0 AND createdAt < ?',
      [cutoffString]
    );

    await this.db.runAsync(
      'DELETE FROM audio WHERE saved = 0 AND createdAt < ?',
      [cutoffString]
    );
  }
}

export const databaseService = new DatabaseService();

