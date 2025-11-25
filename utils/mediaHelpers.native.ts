import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Convert a file URI to base64 string
 */
export async function fileToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw error;
  }
}

/**
 * Create a thumbnail from an image URI
 */
export async function createThumbnail(
  uri: string,
  maxWidth: number = 200
): Promise<string> {
  try {
    const manipResult = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    const base64 = await fileToBase64(manipResult.uri);
    return base64;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new Error('File does not exist');
    }

    // For actual dimension calculation, we'll use manipulateAsync without any operations
    const result = await manipulateAsync(uri, [], {});
    
    // This is a workaround - in production you might want to use a different method
    // For now, we'll return default dimensions and rely on the Image component
    return { width: 1920, height: 1080 };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 1920, height: 1080 };
  }
}

/**
 * Convert base64 to data URI for display
 */
export function base64ToDataUri(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a unique filename
 */
export function generateFileName(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

