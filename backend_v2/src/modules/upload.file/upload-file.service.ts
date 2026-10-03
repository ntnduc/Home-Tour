import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { UploadCategory } from 'src/common/enums/upload.enum';
import { getCurrentDate } from 'src/common/utils';
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '../../common/base/crud/base.service';
import { IBaseService } from '../../common/base/crud/IService';
import { Rooms } from '../property/entities/rooms.entity';
import { UploadFileConfig } from './config/upload-file.config';
import { FileCollectionCreateDto } from './dto/file-collection.create.dto';
import { FileCollectionDetailDto } from './dto/file-collection.detail.dto';
import { FileCollectionListDto } from './dto/file-collection.list.dto';
import { FileCollectionUpdateDto } from './dto/file-collection.update.dto';
import { FileEntryDetailDto } from './dto/file-entry.detail.dto';
import { FileUploadDto } from './dto/file-upload.dto';
import { FileCollection } from './entities/file-collection.entity';
import { FileEntry } from './entities/file-entry.entity';
import { FileCollectionRepository } from './repositories/file-collection.repository';
import { FileEntryRepository } from './repositories/file-entry.repository';

@Injectable()
export class UploadFileService
  extends BaseService<
    FileCollection,
    FileCollectionDetailDto,
    FileCollectionListDto,
    FileCollectionCreateDto,
    FileCollectionUpdateDto
  >
  implements
    IBaseService<
      FileCollection,
      FileCollectionDetailDto,
      FileCollectionListDto,
      FileCollectionCreateDto,
      FileCollectionUpdateDto
    >
{
  private readonly logger = new Logger(UploadFileService.name);
  private readonly config: UploadFileConfig;

  constructor(
    private readonly fileCollectionRepository: FileCollectionRepository,
    private readonly fileEntryRepository: FileEntryRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    super(
      fileCollectionRepository,
      FileCollectionDetailDto,
      FileCollectionListDto,
      FileCollectionCreateDto,
      FileCollectionUpdateDto,
    );
    const config = this.configService.get<UploadFileConfig>('uploadFile');
    if (!config) {
      throw new Error('UploadFile config is not defined');
    }
    this.config = config;
  }

  async specQuery(): Promise<SelectQueryBuilder<FileCollection>> {
    const query = this.fileCollectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.files', 'files')
      .where('collection.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('files.isDeleted = :fileDeleted', { fileDeleted: false });
    return query;
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    dto: FileUploadDto,
  ): Promise<FileEntryDetailDto> {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    // Validate file
    this.validateFile(file, dto.category);
    file.originalname = dto.originalName ?? '';

    // Save file to disk
    const fileEntry = await this.saveFileToDisk(file, 1, dto);

    const detailDto = new FileEntryDetailDto();
    detailDto.fromEntity(fileEntry);
    return detailDto;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    dto: FileUploadDto,
  ): Promise<FileCollectionDetailDto> {
    const querryRunner = this.dataSource.createQueryRunner();

    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      const manager = querryRunner.manager;
      if (!files || files.length === 0) {
        throw new BadRequestException('Files không được để trống');
      }

      if (files.length > this.config.maxFilesPerRequest) {
        throw new BadRequestException(
          `Chỉ được upload tối đa ${this.config.maxFilesPerRequest} files`,
        );
      }

      // Validate all files
      files.forEach((file) => {
        this.validateFile(file, dto.category);
      });

      const updateEntity = this._getRepositoryEntityByCategory(dto.category);
      dto.relatedEntityType = updateEntity.name;
      let collection: FileCollection;
      let totalFileEnitryChild = 0;

      if (dto.collectionId) {
        const findCollection = await manager.findOne(FileCollection, {
          where: { id: dto.collectionId },
          relations: ['files'],
        });
        if (!findCollection) {
          throw new NotFoundException('Không tìm thấy collection');
        }
        collection = findCollection;
        totalFileEnitryChild = findCollection.files?.length || 0;
      } else {
        // Create file collection
        const collectionDto = new FileCollectionCreateDto();
        collectionDto.name = dto.name;
        collectionDto.category = dto.category;
        collectionDto.description = dto.description;
        collectionDto.relatedEntityType = updateEntity.name;
        collectionDto.relatedEntityId = dto.relatedEntityId;
        collectionDto.isPublic = dto.isPublic === 'true' ? true : false;
        collectionDto.propertyId = dto.propertyId;

        collection = await manager.save(FileCollection, collectionDto);
      }

      // Save all files to disk
      const fileEntries = await Promise.all(
        files.map((file, index) =>
          this.saveFileToDisk(
            file,
            index + 1 + totalFileEnitryChild,
            dto,
            collection.id,
            manager,
          ),
        ),
      );

      const collectionWithFiles = await manager.findOne(FileCollection, {
        where: { id: collection.id },
        relations: ['files'],
      });

      if (!collectionWithFiles) {
        throw new NotFoundException('Không tìm thấy collection sau khi tạo');
      }

      const detailDto = new FileCollectionDetailDto();
      detailDto.fromEntity(collectionWithFiles);
      await this._uploadCategoryEntity(
        dto.category,
        dto.relatedEntityId,
        collection.id,
        manager,
      );
      await querryRunner.commitTransaction();
      return detailDto;
    } catch (error) {
      await querryRunner.rollbackTransaction();
      throw new BadGatewayException(error);
    } finally {
      await querryRunner.release();
    }
  }

  /**
   * Get file collection by ID with files
   */
  async getCollectionWithFiles(id: string): Promise<FileCollectionDetailDto> {
    const collection = await this.fileCollectionRepository.findOne({
      where: { id },
      relations: ['files'],
    });

    if (!collection) {
      throw new NotFoundException('Không tìm thấy collection');
    }

    const detailDto = new FileCollectionDetailDto();
    detailDto.fromEntity(collection);
    return detailDto;
  }

  /**
   * Get files by related entity
   */
  async getFilesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<FileCollectionDetailDto[]> {
    const collections = await this.fileCollectionRepository.find({
      where: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
        isDeleted: false,
      },
      relations: ['files'],
    });

    return collections.map((collection) => {
      const detailDto = new FileCollectionDetailDto();
      detailDto.fromEntity(collection);
      return detailDto;
    });
  }

  async getFileById(id: string): Promise<FileEntryDetailDto> {
    const fileEntry = await this.fileEntryRepository.findOne({
      where: { id },
    });

    if (!fileEntry) {
      throw new NotFoundException('Không tìm thấy file entry');
    }

    const detailDto = new FileEntryDetailDto();
    detailDto.fromEntity(fileEntry);
    return detailDto;
  }

  /**
   * Generate URL from filePath
   */
  getFileUrl(filePath: string): string {
    return `${this.config.publicUrlPrefix}/${filePath}`;
  }

  /**
   * Get upload path
   */
  getUploadPath(): string {
    return this.config.uploadPath;
  }

  /**
   * Validate file
   */
  private validateFile(file: Express.Multer.File, category?: string): void {
    // Check file size
    const maxSize =
      category && this.config.categoryConfig[category]?.maxSize
        ? this.config.categoryConfig[category].maxSize
        : this.config.maxFileSize;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File vượt quá kích thước cho phép: ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Check MIME type
    const allowedTypes =
      category && this.config.categoryConfig[category]?.allowedTypes
        ? this.config.categoryConfig[category].allowedTypes
        : this.config.allowedMimeTypes;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Loại file không được phép. Chỉ chấp nhận: ${allowedTypes.join(', ')}`,
      );
    }

    // Check extension
    const extension = this.getFileExtension(file.originalname);
    const allowedExtensions =
      category && this.config.categoryConfig[category]?.allowedExtensions
        ? this.config.categoryConfig[category].allowedExtensions
        : this.config.allowedExtensions;

    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `Extension không được phép. Chỉ chấp nhận: ${allowedExtensions.join(', ')}`,
      );
    }
  }

  /**
   * Save file to disk and create FileEntry
   */
  private async saveFileToDisk(
    file: Express.Multer.File,
    order: number,
    dto: FileUploadDto,
    collectionId?: string,
    manager?: EntityManager,
  ): Promise<FileEntry> {
    // Generate file name with UUID
    const extension = this.getFileExtension(file.originalname);
    const fileName = `${uuidv4()}${extension}`;

    // Create date-based directory structure: YYYY/MM/DD
    const now = getCurrentDate();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePath = `${year}/${month}/${day}`;

    // Full path
    const uploadPath = this.config.uploadPath;
    const fullDirPath = join(uploadPath, datePath);
    const filePath = `${datePath}/${fileName}`;
    const fullFilePath = join(fullDirPath, fileName);

    // Create directory if not exists
    if (!existsSync(fullDirPath)) {
      mkdirSync(fullDirPath, { recursive: true });
    }

    // Write file to disk
    writeFileSync(fullFilePath, file.buffer);

    // Create FileEntry
    const fileEntry = new FileEntry();
    fileEntry.originalName = file.originalname;
    fileEntry.fileName = fileName;
    fileEntry.mimeType = file.mimetype;
    fileEntry.fileSize = file.size;
    fileEntry.extension = extension;
    fileEntry.filePath = filePath;
    fileEntry.collectionId = collectionId ?? undefined;
    fileEntry.order = order;
    fileEntry.category = dto.category;
    fileEntry.relatedEntityType = dto.relatedEntityType;
    fileEntry.relatedEntityId = dto.relatedEntityId;
    fileEntry.propertyId = dto.propertyId;
    if (manager) {
      return await manager.save(FileEntry, fileEntry);
    }

    // Save to database
    return await this.fileEntryRepository.save(fileEntry);
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      throw new BadRequestException('File không có extension');
    }
    return filename.substring(lastDotIndex).toLowerCase();
  }

  /**
   * Soft delete collection
   */
  async deleteCollection(id: string): Promise<void> {
    const collection = await this.fileCollectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Không tìm thấy collection');
    }

    collection.isDeleted = true;
    collection.deletedAt = getCurrentDate();
    await this.fileCollectionRepository.save(collection);
  }

  /**
   * Soft delete file entry
   */
  async deleteFileEntry(id: string): Promise<void> {
    try {
      this.logger.debug(`Attempting to delete file entry with id: ${id}`);

      // Check if file entry exists
      const fileEntry = await this.fileEntryRepository.findOne({
        where: { id },
      });

      if (!fileEntry) {
        this.logger.warn(`File entry not found with id: ${id}`);
        throw new NotFoundException(`Không tìm thấy file entry với id: ${id}`);
      }

      // Perform soft delete
      const result = await this.fileEntryRepository.softDelete(id);

      if (result.affected === 0) {
        this.logger.warn(`Soft delete did not affect any rows for id: ${id}`);
        throw new NotFoundException(`Không thể xóa file entry với id: ${id}`);
      }

      this.logger.log(`Successfully deleted file entry with id: ${id}`);
    } catch (error) {
      // Log error with full context
      this.logger.error(
        `Failed to delete file entry with id: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Wrap unknown errors
      throw new BadRequestException(
        `Lỗi khi xóa file entry: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async _uploadCategoryEntity(
    category: UploadCategory,
    entityId: string,
    collectionId: string,
    manager: EntityManager,
  ): Promise<void> {
    const updateEntity = this._getRepositoryEntityByCategory(category);
    const entity = await manager.findOne(updateEntity, {
      where: { id: entityId },
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    (entity as any).imageCollectionId = collectionId;
    await manager.save(updateEntity, entity);
  }

  private _getRepositoryEntityByCategory(category: UploadCategory) {
    switch (category) {
      // case UploadCategory.PROPERTY:
      //   return this.propertiesRepository;
      case UploadCategory.ROOM:
        return Rooms;
      default:
        throw new BadRequestException('Category không hợp lệ');
    }
  }
}
