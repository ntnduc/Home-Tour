import Card from '@/components/Card';
import Chip from '@/components/Chip';
import { FieldError } from '@/components/FormField';
import IconButton from '@/components/IconButton';
import NoticeBanner from '@/components/NoticeBanner';
import PressableScale from '@/components/PressableScale';
import { tokens, uiColors, uiRadius, uiType, uiWeight } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import ImageView from 'react-native-image-viewing';
import LabelForm from '../LabelForm';
import {
  UploadedFile,
  UploadFileBaseProps
} from './types';
import {
  deleteFile,
  getFilesCollection,
  getFileUrl,
  uploadFileCollection,
} from './uploadfile.api';
import { validateFile } from './util';

export interface UploadMultiFileProps extends UploadFileBaseProps {
  value?: UploadedFile[] | UploadedFile | string[] | string | null;
  // onChange?: (
  //   files: UploadedFile[] | FileEntryDetailResponse[] | null,
  //   status: UploadStatus,
  //   progressEvent?: AxiosProgressEvent,
  // ) => void;
  minFiles?: number;
  maxFiles?: number;
}

const normalizeUploadResponse = (payload: any): UploadedFile[] => {
  const data = payload?.data ?? payload;
  const files = Array.isArray(data) ? data : Array.isArray(data?.files) ? data.files : [];

  return files.map((item: any) => ({
    id: item?.id,
    name: item?.fileName || item?.name || `file_${Date.now()}`,
    uri: item?.filePath || item?.uri || '',
    size: item?.fileSize || item?.size,
    mimeType: item?.mimeType || item?.type,
    type: 'image',
  }));
};

const UploadMultiFile: React.FC<UploadMultiFileProps> = ({
  label,
  value,
  onChange,
  error,
  postData,
  required = false,
  disabled = false,
  maxSize = 10,
  minFiles = 3,
  maxFiles = 10,
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
  onUploadStart,
  onUploadEnd,
  onError,
}) => {

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const canAddMore = files.length < maxFiles;

  const imageSources = useMemo(
    () =>
      files.map((file: any) => ({
        uri: file?.id ? getFileUrl(file.id) : file.uri,
      })),
    [files],
  );

  useEffect(() => {
    if (value && typeof value === 'string') {
      setIsLoading(true);
      getFilesCollection(value).then((fileCollection) => {
        setFiles(fileCollection.files as unknown as UploadedFile[] ?? []);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [value]);

  const handlePickImages = async () => {
    if (disabled || isLoading || !canAddMore) return;

    try {
      setIsLoading(true);
      onUploadStart?.();
      onChange?.(files, 'prepare');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Cần quyền truy cập thư viện ảnh để chọn hình ảnh.';
        Alert.alert('Quyền truy cập', msg);
        onError?.(msg);
        onChange?.(files, 'error');
        return;
      }

      const selectionLimit = Math.max(maxFiles - files.length, 1);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit,
        quality: 0.8,
      });

      if (result.canceled) return;

      const newFiles: UploadedFile[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: 'image',
        size: asset.fileSize,
        mimeType: asset.mimeType || 'image/jpeg',
      }));

      for (const file of newFiles) {
        const fileError = validateFile(file, maxSize ?? 10, acceptedTypes ?? []);
        if (fileError) {
          Alert.alert('Lỗi', fileError);
          onError?.(fileError);
          onChange?.(files, 'error');
          return;
        }
      }

      onChange?.(files, 'loading');

      const response = await uploadFileCollection(
        newFiles,
        postData,
        (status, progressEvent) => {
          onChange?.(files, status, progressEvent);
        },
      );
      const uploadedFiles = normalizeUploadResponse(response);
      const merged = [...uploadedFiles].slice(0, maxFiles);

      setFiles(merged);
      onChange?.(merged, 'success');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải ảnh';
      Alert.alert('Lỗi', message);
      onError?.(message);
      onChange?.(files, 'error');
    } finally {
      setIsLoading(false);
      onUploadEnd?.();
    }
  };

  const handleRemove = async (index: number) => {
    if (disabled || isLoading) return;

    const target = files[index];
    if (!target) return;

    try {
      setIsLoading(true);

      if (target.id) {
        await deleteFile(target.id);
      }

      const next = files.filter((_, i) => i !== index);
      setFiles(next);
      onChange?.(next.length ? next : null, 'success');

      if (previewIndex >= next.length) {
        setPreviewIndex(Math.max(next.length - 1, 0));
      }

      if (!next.length) {
        setPreviewVisible(false);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể xóa ảnh';
      Alert.alert('Lỗi', message);
      onError?.(message);
      onChange?.(files, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card style={ui.card}>
        <View style={ui.headerRow}>
          <View style={ui.flex}>
            {label ? (
              <LabelForm {...(typeof label === 'object' ? label : { label, required })} />
            ) : (
              <Text style={uiType.section}>Ảnh thực tế</Text>
            )}
            <Text style={uiType.caption}>Tải lên ít nhất {minFiles} ảnh</Text>
          </View>
          <Chip variant="primary" label={`${files.length}/${maxFiles}`} />
        </View>

        <View style={ui.grid}>
          {files.map((file, index) => {
            const uri = file?.id ? getFileUrl(file.id) : file.uri;
            return (
              <View key={file.id || `${file.uri}_${index}`} style={ui.cell}>
                <View style={ui.thumb}>
                  <PressableScale
                    style={ui.fill}
                    scaleTo={0.97}
                    onPress={() => {
                      setPreviewIndex(index);
                      setPreviewVisible(true);
                    }}
                    disabled={disabled}
                    accessibilityLabel={`Xem ảnh ${index + 1}`}
                  >
                    <Image source={{ uri }} style={ui.fill} resizeMode="cover" />
                  </PressableScale>
                  {!disabled && (
                    <IconButton
                      icon="close"
                      tone="error"
                      size="sm"
                      onPress={() => handleRemove(index)}
                      accessibilityLabel={`Xoá ảnh ${index + 1}`}
                      style={ui.remove}
                    />
                  )}
                </View>
              </View>
            );
          })}

          {canAddMore && (
            <View style={ui.cell}>
              <PressableScale
                onPress={handlePickImages}
                disabled={disabled || isLoading}
                scaleTo={0.95}
                accessibilityLabel="Thêm ảnh"
                style={[ui.thumb, ui.addTile]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={tokens.colors.primary} />
                ) : (
                  <>
                    <Ionicons name="add" size={24} color={tokens.colors.primary} />
                    <Text style={ui.addText}>Thêm ảnh</Text>
                  </>
                )}
              </PressableScale>
            </View>
          )}
        </View>

        {files.length < minFiles && (
          <NoticeBanner tone="warning" message={`Bạn cần tải tối thiểu ${minFiles} ảnh.`} />
        )}
        <FieldError message={error} />
      </Card>

      <ImageView
        images={imageSources}
        imageIndex={previewIndex}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      />
    </>
  );
};

export default UploadMultiFile;

const ui = StyleSheet.create({
  card: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  cell: {
    width: '33.333%',
    padding: 4,
  },
  thumb: {
    aspectRatio: 1,
    borderRadius: uiRadius.icon,
    overflow: 'hidden',
    backgroundColor: uiColors.canvas,
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryMuted,
  },
  addText: {
    fontSize: 12,
    fontWeight: uiWeight.semibold,
    color: tokens.colors.primary,
  },
});
