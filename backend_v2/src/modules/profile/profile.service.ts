import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UploadCategory } from 'src/common/enums/upload.enum';
import { CurrentUserService } from '../current.user/current.user.service';
import { FileUploadDto } from '../upload.file/dto/file-upload.dto';
import { UploadFileService } from '../upload.file/upload-file.service';
import {
  DEFAULT_USER_SETTINGS,
  User,
  UserSettings,
} from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { ProfileDetailDto } from './dto/profile.detail.dto';
import { ProfileSettingsUpdateDto } from './dto/profile-settings.update.dto';
import { ProfileUpdateDto } from './dto/profile.update.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly currentUserService: CurrentUserService,
    private readonly uploadFileService: UploadFileService,
  ) {}

  async getProfile(): Promise<ProfileDetailDto> {
    return this.toDetail(await this.loadCurrentUser());
  }

  async updateProfile(dto: ProfileUpdateDto): Promise<ProfileDetailDto> {
    const user = await this.loadCurrentUser();

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    if (dto.email !== undefined) {
      const email = dto.email ? dto.email.toLowerCase() : null;
      if (email) {
        const existing = await this.userRepository.findOne({ where: { email } });
        if (existing && existing.id !== user.id) {
          throw new ConflictException('Email đã được sử dụng!');
        }
      }
      user.email = email as string;
    }

    return this.toDetail(await this.userRepository.save(user));
  }

  async updateAvatar(file: Express.Multer.File): Promise<ProfileDetailDto> {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }
    const user = await this.loadCurrentUser();

    const uploadDto = new FileUploadDto();
    uploadDto.category = UploadCategory.AVATAR;
    uploadDto.originalName = file.originalname;
    uploadDto.relatedEntityType = User.name;
    uploadDto.relatedEntityId = user.id;
    uploadDto.isPublic = 'true';

    // Validates size/mime/extension against the `avatar` category config
    const entry = await this.uploadFileService.uploadFile(file, uploadDto);

    const previousId = user.avatarFileId;
    user.avatarFileId = entry.id;
    const saved = await this.userRepository.save(user);

    await this.removeFileQuietly(previousId);
    return this.toDetail(saved);
  }

  async removeAvatar(): Promise<ProfileDetailDto> {
    const user = await this.loadCurrentUser();
    const previousId = user.avatarFileId;
    user.avatarFileId = null;
    const saved = await this.userRepository.save(user);
    await this.removeFileQuietly(previousId);
    return this.toDetail(saved);
  }

  async getSettings(): Promise<UserSettings> {
    return this.mergeSettings((await this.loadCurrentUser()).settings);
  }

  async updateSettings(dto: ProfileSettingsUpdateDto): Promise<UserSettings> {
    const user = await this.loadCurrentUser();
    const next = this.mergeSettings(user.settings);
    (Object.keys(next) as (keyof UserSettings)[]).forEach((key) => {
      if (dto[key] !== undefined) {
        next[key] = dto[key] as boolean;
      }
    });
    user.settings = next;
    await this.userRepository.save(user);
    return next;
  }

  private async loadCurrentUser(): Promise<User> {
    const userId = this.currentUserService.getCurrentUserId();
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  private mergeSettings(settings?: Partial<UserSettings> | null): UserSettings {
    return { ...DEFAULT_USER_SETTINGS, ...(settings ?? {}) };
  }

  // Old avatar cleanup must never fail the request
  private async removeFileQuietly(fileId?: string | null): Promise<void> {
    if (!fileId) return;
    try {
      await this.uploadFileService.deleteFileEntry(fileId);
    } catch (error) {
      this.logger.warn(`Could not remove old avatar ${fileId}`);
    }
  }

  private toDetail(user: User): ProfileDetailDto {
    const dto = new ProfileDetailDto();
    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.phone = user.phone;
    dto.email = user.email ?? null;
    dto.avatarFileId = user.avatarFileId ?? null;
    dto.settings = this.mergeSettings(user.settings);
    return dto;
  }
}
