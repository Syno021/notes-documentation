/**
 * Convert a file URI to base64 string (Web version)
 */
export async function fileToBase64(uri: string): Promise<string> {
  try {
    // For web, if it's already a data URI, extract the base64 part
    if (uri.startsWith('data:')) {
      const base64 = uri.split(',')[1];
      return base64 || '';
    }

    // If it's a blob URL, fetch and convert
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw error;
  }
}

/**
 * Create a thumbnail from an image URI (Web version)
 */
export async function createThumbnail(
  uri: string,
  maxWidth: number = 200
): Promise<string> {
  try {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        // Draw resized image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = uri;
    });
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    // Return the original as base64 if thumbnail creation fails
    return fileToBase64(uri);
  }
}

/**
 * Get image dimensions (Web version)
 */
export async function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 1920, height: 1080 });
    };
    img.src = uri;
  });
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

