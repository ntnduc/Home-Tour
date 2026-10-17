import { FieldError, fieldStyles } from '@/components/FormField';
import IconButton from '@/components/IconButton';
import IconSquircle from '@/components/IconSquircle';
import PressableScale from '@/components/PressableScale';
import { tokens, uiWeight } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import ImageView from 'react-native-image-viewing';
import LabelForm from '../LabelForm';
import SliderLoading from './SliderLoading';
import { UploadedFile, UploadFileBaseProps, UploadStatus } from './types';
import { deleteFile, getFileUrl, uploadFile } from './uploadfile.api';
import { validateFile } from './util';

export interface UploadFileProps extends UploadFileBaseProps {
  value?: UploadedFile | null;
  // onChange?: (files: UploadedFile | null, status: UploadStatus) => void;
  multiple?: boolean;
}

const UploadFile: React.FC<UploadFileProps> = ({
  label,
  value,
  onChange,
  postData,
  typeFile = 'image',
  error,
  required = false,
  disabled = false,
  multiple = false,
  maxSize = 10,
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg',
    'image/ico',
    'image/bmp',
    'image/tiff',
    'image/tif',
    'image/heic',
    'image/heif',
    'image/heif-sequence',
    'image/heic-sequence',
  ],
  placeholder,
  containerStyles,
  onUploadStart,
  onUploadEnd,
  onError,
  icon = 'cloud-upload-outline',
  iconProps,
  showPreview = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [processStatus, setProcessStatus] = useState<UploadStatus>('prepare');
  const [files, setFiles] = useState<UploadedFile | null | undefined>(value);

  const uploadAsync = async (fileToUpload: UploadedFile) => {
    try {
      setIsLoading(true);
      setProcessStatus('loading');
      onChange?.(fileToUpload, processStatus);
      onUploadStart?.();

      const response = await uploadFile(fileToUpload, postData, (status, progessEvent) => {
        if (progessEvent?.loaded != null && progessEvent?.total != null) {
          const progress = (progessEvent.loaded / (progessEvent.total ?? 1)) * 100;
          setProgress(progress);
        }
        onChange?.(fileToUpload, processStatus);

      }).catch((error: any) => {
        setProcessStatus('error');
        onChange?.(null, processStatus);
        onError?.(error.message);
        setIsLoading(false);
      }).finally(() => {
        setProcessStatus('success');
        onUploadEnd?.();
      });

      const firstFile = response?.data;
      const finalFiles = {
        id: firstFile?.id,
        name: firstFile?.fileName,
        uri: firstFile?.filePath,
        size: firstFile?.fileSize,
        mimeType: firstFile?.mimeType,
      };

      setFiles(finalFiles);
      onChange?.(finalFiles, processStatus);
      setProgress(0);


    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi upload file';
      onError?.(errorMessage);
      onChange?.(null, 'error');
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      onUploadStart?.();

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần quyền truy cập thư viện ảnh để chọn hình ảnh.',
        );
        onError?.('Không có quyền truy cập thư viện ảnh');
        return;
      }


      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: false,
        cameraType: ImagePicker.CameraType.back,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.canceled) {
        onUploadEnd?.();
        setIsLoading(false);
        return;
      }

      const newFiles: UploadedFile[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type || 'image',
        size: asset.fileSize,
        mimeType: asset.mimeType || 'image/jpeg',
      }));

      // Validate files
      for (const file of newFiles) {
        const error = validateFile(file, maxSize ?? 10, acceptedTypes ?? []);
        if (error) {
          Alert.alert('Lỗi', error);
          onError?.(error);
          onUploadEnd?.();
          setIsLoading(false);
          return;
        }
      }

      const newFile = newFiles[0];
      await uploadAsync(newFile);
      onUploadEnd?.();
      setIsLoading(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi chọn hình ảnh';
      Alert.alert('Lỗi', errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const handlePickFile = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      onUploadStart?.();

      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes?.length ? acceptedTypes : '*/*',
        multiple: multiple,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        onUploadEnd?.();
        return;
      }

      const newFiles: UploadedFile[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        name: asset.name,
        type: 'file',
        size: asset.size,
        mimeType: asset.mimeType || 'application/octet-stream',
      }));

      // Validate files
      for (const file of newFiles) {
        const error = validateFile(file, maxSize ?? 10, acceptedTypes ?? []);
        if (error) {
          Alert.alert('Lỗi', error);
          onError?.(error);
          onUploadEnd?.();
          return;
        }
      }

      // Merge với files hiện tại và upload
      const newFile = newFiles[0];
      await uploadAsync(newFile);

      onUploadEnd?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi chọn file';
      Alert.alert('Lỗi', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      onUploadEnd?.();
    }
  };

  const handlePick = () => {
    if (typeFile === 'image') {
      handlePickImage();
    } else if (typeFile === 'file') {
      handlePickFile();
    } else {
      Alert.alert(
        'Chọn loại file',
        'Bạn muốn chọn hình ảnh hay file?',
        [
          {
            text: 'Hình ảnh',
            onPress: handlePickImage,
          },
          {
            text: 'File',
            onPress: handlePickFile,
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ],
      );
    }
  };

  const handleRemove = async () => {
    if (disabled) return;
    if (files == null || files.id == null) return;

    setIsLoading(true);
    await deleteFile(files.id)
      .then(() => {
        onChange?.(null, 'success');
      })
      .catch((error: any) => {
        //DO NOTHING
      })
      .finally(() => {
        setFiles(null);
        setIsLoading(false);
      });
  };

  const renderFileItem = (file: UploadedFile) => (
    <View style={ui.fileRow}>
      <IconSquircle icon={typeFile === 'file' ? 'document-outline' : 'image-outline'} size="sm" />
      <Text style={[fieldStyles.text, ui.flex]} numberOfLines={1}>
        {file.name}
      </Text>
      {!disabled && (
        <IconButton
          icon="close"
          tone="error"
          size="sm"
          onPress={handleRemove}
          accessibilityLabel="Xoá tệp"
        />
      )}
    </View>
  );

  return (
    <>
      <View>
        {label && <LabelForm {...(typeof label === 'object' ? label : { label, required })} />}
        <View
          style={[
            fieldStyles.box,
            ui.box,
            !!error && fieldStyles.boxError,
            disabled && fieldStyles.boxDisabled,
          ]}
        >
          {processStatus === 'loading' && (
            <View style={ui.progress}>
              <SliderLoading value={progress} height={12} animateFromCenter={false} showShimmer />
            </View>
          )}
          {files ? (
            <PressableScale
              style={ui.flex}
              scaleTo={0.98}
              onPress={() => setIsVisible(true)}
              accessibilityLabel="Xem tệp"
            >
              {renderFileItem(files)}
            </PressableScale>
          ) : (
            <PressableScale
              style={ui.pick}
              onPress={handlePick}
              disabled={disabled || isLoading}
              scaleTo={0.98}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={tokens.colors.primary} />
              ) : (
                <>
                  <Ionicons name={icon} size={22} color={tokens.colors.primary} {...iconProps} />
                  <Text style={ui.pickText}>
                    {placeholder ||
                      (typeFile === 'image'
                        ? 'Chọn hình ảnh'
                        : typeFile === 'file'
                          ? 'Chọn file'
                          : 'Chọn hình ảnh hoặc file')}
                  </Text>
                </>
              )}
            </PressableScale>
          )}
        </View>
        <FieldError message={error} />
      </View>
      <ImageView
        images={[{ uri: getFileUrl(files?.id || '') }]}
        imageIndex={0}
        visible={isVisible}
        onRequestClose={() => { setIsVisible(false); }}
      />
    </>
  );
};

export default UploadFile;

const ui = StyleSheet.create({
  box: {
    minHeight: 60,
    paddingVertical: 6,
  },
  flex: {
    flex: 1,
  },
  progress: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
  },
  pickText: {
    fontSize: 15,
    fontWeight: uiWeight.semibold,
    color: tokens.colors.primary,
  },
});
