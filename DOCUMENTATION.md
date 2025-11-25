# Notes Documentation App - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Code Structure](#code-structure)
5. [Database Schema](#database-schema)
6. [Key Components](#key-components)
7. [Data Flow](#data-flow)
8. [Platform-Specific Implementations](#platform-specific-implementations)
9. [How to Use](#how-to-use)
10. [Development Guide](#development-guide)

---

## Overview

A modern note-taking application built with React Native and Expo that allows users to capture photos, record audio, and organize notes with rich media content. The app uses SQLite for persistent storage and works seamlessly across web, iOS, and Android platforms.

### Tech Stack
- **Framework**: React Native with Expo
- **Database**: SQLite (expo-sqlite)
- **Navigation**: Expo Router
- **Language**: TypeScript
- **Media**: expo-camera, expo-av, expo-image-picker
- **Styling**: React Native StyleSheet

---

## Features

### Core Functionality
1. **Note Creation & Management**
   - Create notes with title and description
   - Edit existing notes
   - View all notes in a beautiful gallery

2. **Media Capture**
   - 📷 **Camera**: Take photos directly (native camera on mobile, WebRTC on web)
   - 🖼️ **Gallery**: Upload multiple images from device
   - 🎤 **Audio**: Record audio with duration tracking
   - 👁️ **Preview**: Review all captures before saving

3. **Media Viewing**
   - Full-screen image viewer with zoom
   - Audio playback with visual indicators
   - Thumbnail previews for quick navigation

4. **Content Management**
   - Add media to existing notes
   - Delete images and audio recordings
   - Edit note details anytime

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (Index, Capture, Note Detail, Review Pages)            │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Custom Hooks Layer                          │
│  (useNotes, useNote, useDatabase)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│            Service Layer                                 │
│  (Database Service, Media Helpers)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│          Platform-Specific Layer                         │
│  (SQLite Native/Web, File System Native/Web)           │
└──────────────────────────────────────────────────────────┘
```

### Design Patterns Used
- **Custom Hooks**: Encapsulate data fetching and state management
- **Context API**: Global database state management
- **Platform-Specific Code**: Separate implementations for native and web
- **Repository Pattern**: Database service acts as data access layer

---

## Code Structure

```
notes-documentation/
├── app/                          # Application screens (Expo Router)
│   ├── _layout.tsx              # Root layout with database provider
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home screen (notes list)
│   │   ├── capture.tsx         # Capture/Edit screen
│   │   └── explore.tsx         # Library screen (hidden)
│   ├── note/
│   │   └── [id].tsx            # Note detail view (dynamic route)
│   └── review.tsx              # Review unsaved captures
│
├── components/                   # Reusable UI components
│   ├── themed-text.tsx          # Text with theme support
│   ├── themed-view.tsx          # View with theme support
│   ├── WebCamera.tsx            # Web-specific camera component
│   └── ui/                      # UI primitives
│
├── contexts/                     # React Context providers
│   └── DatabaseContext.tsx      # Database initialization context
│
├── hooks/                        # Custom React hooks
│   ├── useNotes.ts              # Fetch all notes with media
│   ├── useNote.ts               # Fetch single note
│   ├── use-color-scheme.ts      # Theme management
│   └── use-theme-color.ts       # Dynamic theme colors
│
├── services/                     # Business logic layer
│   ├── database.ts              # Main database exports
│   ├── database.types.ts        # TypeScript interfaces
│   ├── database.native.ts       # SQLite implementation (iOS/Android)
│   └── database.web.ts          # In-memory implementation (Web)
│
├── utils/                        # Utility functions
│   ├── mediaHelpers.ts          # Platform-agnostic exports
│   ├── mediaHelpers.native.ts   # Native file operations
│   └── mediaHelpers.web.ts      # Web file operations
│
├── constants/                    # Static data and configuration
│   ├── theme.ts                 # Color schemes
│   └── notes.ts                 # Sample data (legacy)
│
└── assets/                       # Images and static files
```

---

## Database Schema

### Tables

#### **notes**
Stores note metadata
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,              -- UUID-like identifier
  title TEXT NOT NULL,               -- Note title
  description TEXT,                  -- Note content/description
  createdAt TEXT NOT NULL,          -- ISO 8601 timestamp
  updatedAt TEXT NOT NULL           -- ISO 8601 timestamp
);
```

#### **images**
Stores captured images as base64
```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  noteId TEXT,                      -- Foreign key to notes
  imageData TEXT NOT NULL,          -- Base64 encoded full image
  thumbnailData TEXT NOT NULL,      -- Base64 encoded thumbnail
  fileName TEXT NOT NULL,           -- Generated filename
  mimeType TEXT NOT NULL,           -- 'image/jpeg'
  width INTEGER NOT NULL,           -- Image width in pixels
  height INTEGER NOT NULL,          -- Image height in pixels
  createdAt TEXT NOT NULL,          -- ISO 8601 timestamp
  saved INTEGER DEFAULT 0,          -- 0=unsaved, 1=saved
  FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_noteId ON images(noteId);
CREATE INDEX idx_images_saved ON images(saved);
```

#### **audio**
Stores audio recordings as base64
```sql
CREATE TABLE audio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  noteId TEXT,                      -- Foreign key to notes
  audioData TEXT NOT NULL,          -- Base64 encoded audio
  fileName TEXT NOT NULL,           -- Generated filename
  mimeType TEXT NOT NULL,           -- 'audio/m4a'
  duration REAL NOT NULL,           -- Duration in seconds
  createdAt TEXT NOT NULL,          -- ISO 8601 timestamp
  saved INTEGER DEFAULT 0,          -- 0=unsaved, 1=saved
  FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX idx_audio_noteId ON audio(noteId);
CREATE INDEX idx_audio_saved ON audio(saved);
```

### Data Relationships
```
notes (1) ──────────── (many) images
notes (1) ──────────── (many) audio
```

---

## Key Components

### 1. **DatabaseService** (`services/database.ts`)
Central data access layer for all CRUD operations.

**Key Methods:**
```typescript
// Note operations
saveNote(note: Note): Promise<void>
getNote(noteId: string): Promise<Note | null>
getAllNotes(): Promise<Note[]>
deleteNote(noteId: string): Promise<void>

// Image operations
saveImage(image: Omit<CapturedImage, 'id'>): Promise<number>
getUnsavedImages(): Promise<CapturedImage[]>
getImagesByNoteId(noteId: string): Promise<CapturedImage[]>
markImageAsSaved(imageId: number, noteId: string): Promise<void>
deleteImage(imageId: number): Promise<void>

// Audio operations
saveAudio(audio: Omit<AudioRecording, 'id'>): Promise<number>
getUnsavedAudio(): Promise<AudioRecording[]>
getAudioByNoteId(noteId: string): Promise<AudioRecording[]>
markAudioAsSaved(audioId: number, noteId: string): Promise<void>
deleteAudio(audioId: number): Promise<void>
```

### 2. **CaptureScreen** (`app/(tabs)/capture.tsx`)
Main screen for creating and editing notes.

**Features:**
- Title and description inputs
- Camera button (opens native camera or WebRTC modal)
- Gallery button (select multiple images)
- Audio recording button (with duration counter)
- Image previews with delete functionality
- Audio list with delete functionality
- Save/Update button

**Modes:**
- **Create Mode**: New note creation
- **Edit Mode**: Activated when `noteId` query param is present

### 3. **NoteDetailScreen** (`app/note/[id].tsx`)
Displays a single note with all its media.

**Features:**
- Cover image (first captured image)
- Photo gallery carousel
- Audio recordings with playback
- Full-screen image viewer modal
- Edit button to modify note
- Note metadata display

### 4. **IndexScreen** (`app/(tabs)/index.tsx`)
Home screen showing all notes.

**Features:**
- Pull-to-refresh
- Loading states
- Empty state for new users
- Recent note spotlight
- All notes list with cards
- Quick actions (add photo, share)

### 5. **ReviewScreen** (`app/review.tsx`)
Preview unsaved captures before associating with a note.

**Features:**
- Grid view of unsaved images
- Audio recordings list
- Full-screen image preview
- Audio playback
- Empty state

### 6. **WebCamera** (`components/WebCamera.tsx`)
Web-only component for camera access.

**Features:**
- WebRTC camera stream
- Live preview
- Capture button
- Cancel button
- Error handling for permissions

---

## Data Flow

### Creating a New Note

```
1. User opens Capture page
   ↓
2. User captures/uploads media
   → Images saved to SQLite with saved=0, noteId=null
   → Audio saved to SQLite with saved=0, noteId=null
   ↓
3. User enters title and description
   ↓
4. User clicks "Save Note"
   → Creates new note in notes table
   → Updates all images: saved=1, noteId=<new_id>
   → Updates all audio: saved=1, noteId=<new_id>
   ↓
5. User navigates back
   → Home screen refreshes
   → New note appears in list
```

### Editing an Existing Note

```
1. User clicks note from home screen
   ↓
2. Note detail page loads
   → Fetches note from database
   → Loads associated images and audio
   ↓
3. User clicks "Edit / Add Content"
   → Opens Capture page with noteId param
   → Loads existing note data
   ↓
4. User adds new media or edits text
   → New media immediately linked to note (saved=1)
   → Changes to text held in state
   ↓
5. User clicks "Update Note"
   → Updates note record
   → Returns to note detail page
```

### Viewing Unsaved Captures

```
1. User captures media without saving
   ↓
2. Media stored with saved=0
   ↓
3. User clicks review icon
   → Loads all items where saved=0
   → Displays in grid/list format
   ↓
4. User can:
   → View full images
   → Play audio
   → Navigate to Capture page to save
```

---

## Platform-Specific Implementations

### Database Layer

**Native (iOS/Android):**
- Uses `expo-sqlite` with native SQLite database
- Persistent storage across app restarts
- Full SQL query support
- File: `services/database.native.ts`

**Web:**
- In-memory JavaScript objects
- Data lost on page refresh
- Same API as native for consistency
- File: `services/database.web.ts`

### Media Helpers

**Native (iOS/Android):**
```typescript
// Uses expo-file-system
fileToBase64(uri: string): Promise<string>
// Uses expo-image-manipulator
createThumbnail(uri: string): Promise<string>
```

**Web:**
```typescript
// Uses FileReader API
fileToBase64(uri: string): Promise<string>
// Uses Canvas API
createThumbnail(uri: string): Promise<string>
```

### Camera Access

**Native (iOS/Android):**
- Uses `expo-camera` and `expo-image-picker`
- Opens native camera app
- Returns image URI
- Full resolution images

**Web:**
- Uses `WebCamera` component
- WebRTC `getUserMedia` API
- In-browser camera preview
- Canvas-based capture

### Audio Recording

**Native (iOS/Android):**
- Uses `expo-av` Audio.Recording
- Native recording UI
- High-quality audio (44.1kHz)

**Web:**
- Uses `expo-av` with MediaRecorder API
- Browser-based recording
- Codec support varies by browser

---

## How to Use

### For End Users

#### Creating Your First Note
1. Open the app → you'll see the home screen
2. Click **"Capture + note"** button
3. Add a title and description
4. Click **Camera** to take photos
5. Click **Audio** to record voice notes
6. Click **Gallery** to upload images
7. Review your captures in the preview area
8. Click **"Save Note"** when done

#### Editing an Existing Note
1. From home screen, tap any note card
2. View your note details
3. Click **"Edit / Add Content"**
4. Add more photos or audio
5. Edit title/description
6. Delete unwanted media (confirmation required)
7. Click **"Update Note"** to save changes

#### Viewing Notes
- **Home Screen**: Scroll to see all notes
- **Tap a Note**: See full details
- **Tap an Image**: View full-screen (pinch to zoom)
- **Tap Audio**: Play/pause recording

### For Developers

#### Running the App

**Web (Development):**
```bash
npm start
# Press 'w' for web
# Opens at http://localhost:8081
```

**iOS:**
```bash
npm run ios
# Opens iOS simulator
```

**Android:**
```bash
npm run android
# Opens Android emulator or connected device
```

**Physical Device (Expo Go):**
```bash
npm start
# Scan QR code with Expo Go app
```

---

## Development Guide

### Adding a New Feature

1. **Database Changes:**
   - Update `services/database.types.ts` with new interfaces
   - Modify `database.native.ts` to add tables/queries
   - Update `database.web.ts` with matching implementation

2. **UI Components:**
   - Create new component in `components/`
   - Use `ThemedText` and `ThemedView` for consistency
   - Follow existing StyleSheet patterns

3. **New Screen:**
   - Add file in `app/` directory
   - Update `app/_layout.tsx` if adding to navigation
   - Use `useLocalSearchParams()` for route params

4. **Data Fetching:**
   - Create custom hook in `hooks/`
   - Use `useDatabase()` to check ready state
   - Handle loading and error states

### Code Style Guidelines

**TypeScript:**
- Use strict typing
- Define interfaces for all data structures
- Use `Omit` for creation DTOs

**Components:**
- Functional components with hooks
- Extract complex logic to custom hooks
- Keep components under 300 lines

**Styling:**
- Use StyleSheet.create()
- Group related styles together
- Support dark mode with theme colors

**Error Handling:**
- Always try-catch async operations
- Use Alert.alert for user-facing errors
- console.error for debugging

### Testing Checklist

**Before Committing:**
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Tested on web
- [ ] Tested on iOS simulator (if available)
- [ ] Tested on Android emulator (if available)
- [ ] Camera functionality works
- [ ] Audio recording works
- [ ] Database operations succeed
- [ ] Dark mode looks good
- [ ] Loading states display
- [ ] Error states handled

### Common Issues & Solutions

**Issue: Camera not working on web**
- Solution: Ensure HTTPS or localhost, browser needs camera permission

**Issue: SQLite errors on web**
- Solution: Web uses in-memory storage, data lost on refresh is expected

**Issue: Images not displaying**
- Solution: Check base64 format includes data URI prefix

**Issue: Audio playback fails**
- Solution: Verify mimeType matches platform codec support

---

## Performance Considerations

### Image Storage
- Images stored as base64 in SQLite
- Thumbnails generated for previews (200px wide)
- Full images used only in detail view
- Consider file size limits (base64 is ~33% larger)

### Database Optimization
- Indexes on frequently queried columns
- Batch operations where possible
- Lazy loading of images (only fetch when needed)
- Cleanup old unsaved items periodically

### Memory Management
- Audio playback cleanup on component unmount
- Camera stream cleanup when modal closes
- Large image arrays may impact performance on low-end devices

---

## Future Enhancements

### Potential Features
- [ ] Search functionality
- [ ] Tags and categories
- [ ] Cloud sync
- [ ] Note sharing/export
- [ ] Rich text editing
- [ ] Drawing/annotation on images
- [ ] Location tagging
- [ ] Offline mode indicator
- [ ] Backup/restore functionality
- [ ] Multiple photo albums per note

### Technical Improvements
- [ ] Implement proper image compression
- [ ] Add image caching layer
- [ ] Use virtualized lists for better performance
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Implement proper error boundaries
- [ ] Add analytics
- [ ] Performance monitoring

---

## License & Credits

This application demonstrates modern React Native development practices with cross-platform support and persistent storage.

**Built with:**
- React Native
- Expo SDK
- TypeScript
- SQLite

---

**Last Updated:** November 2025
**Version:** 1.0.0

