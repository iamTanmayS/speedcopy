import * as DocumentPicker from 'expo-document-picker';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

interface FileUploadDropzoneProps {
  onFileSelect: (file: { uri: string; name: string; type?: string; size?: number }) => void;
  selectedFile?: { name: string; size?: number } | null;
  isUploading?: boolean;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({ 
  onFileSelect, 
  selectedFile,
  isUploading 
}) => {
  const { theme } = useTheme();

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        onFileSelect({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        });
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f3f4f6', borderColor: selectedFile ? theme.colors.accent.default : '#9ca3af' }]}>
      {isUploading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.accent.default} />
          <Text style={[styles.title, { marginTop: 12 }]}>Uploading...</Text>
        </View>
      ) : selectedFile ? (
        <View style={styles.center}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.accent.default + '20' }]}>
            <Ionicons name="document-attach-outline" size={24} color={theme.colors.accent.default} />
          </View>
          <Text style={styles.title} numberOfLines={1}>{selectedFile.name}</Text>
          {selectedFile.size && (
            <Text style={[styles.subtitle, { color: theme.colors.fg.muted }]}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          )}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.status.error }]} 
            onPress={handlePickFile}
          >
            <Text style={styles.buttonText}>Change File</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-upload-outline" size={24} color="#000" />
          </View>
          <Text style={styles.title}>Select Files</Text>
          <Text style={[styles.subtitle, { color: theme.colors.fg.muted }]}>
            Tap to browse PDF or image from the{'\n'}device
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handlePickFile}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Choose File</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
