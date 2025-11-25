import { useState, useRef } from 'react';
import { Modal, View, StyleSheet, Pressable, Platform } from 'react-native';
import { ThemedText } from './themed-text';

interface WebCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export function WebCamera({ visible, onClose, onCapture }: WebCameraProps) {
  // This component only works on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use the Gallery button instead.');
      onClose();
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      stopCamera();
      onCapture(dataUrl);
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onShow={startCamera}>
      <View style={styles.container}>
        <video
          ref={videoRef as any}
          style={{
            width: '100%',
            height: '80%',
            objectFit: 'cover',
            backgroundColor: '#000',
          }}
        />
        
        <View style={styles.controls}>
          <Pressable style={styles.captureButton} onPress={captureImage}>
            <ThemedText style={styles.captureText}>Capture</ThemedText>
          </Pressable>
          
          <Pressable style={styles.cancelButton} onPress={handleClose}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1F2937',
  },
  captureButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  captureText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

