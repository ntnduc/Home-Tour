import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';

const makeUser = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  fullName: 'Old Name',
  phone: '0900000000',
  email: null,
  avatarFileId: null,
  settings: null,
  ...over,
});

describe('ProfileService', () => {
  let user: ReturnType<typeof makeUser>;
  let userRepository: { findOne: jest.Mock; save: jest.Mock };
  let uploadFileService: { uploadFile: jest.Mock; deleteFileEntry: jest.Mock };
  let service: ProfileService;

  beforeEach(() => {
    user = makeUser();
    userRepository = {
      findOne: jest.fn().mockResolvedValue(user),
      save: jest.fn().mockImplementation(async (u) => u),
    };
    uploadFileService = {
      uploadFile: jest.fn().mockResolvedValue({ id: 'f-new' }),
      deleteFileEntry: jest.fn().mockResolvedValue(undefined),
    };
    service = new ProfileService(
      userRepository as any,
      { getCurrentUserId: () => 'u1' } as any,
      uploadFileService as any,
    );
  });

  it('returns default settings when none are stored', async () => {
    const profile = await service.getProfile();
    expect(profile.settings).toEqual({
      invoiceReminder: true,
      contractExpiryReminder: true,
      paymentReceived: true,
    });
    expect(profile.avatarFileId).toBeNull();
  });

  it('throws NotFound when the user is missing', async () => {
    userRepository.findOne.mockResolvedValue(null);
    await expect(service.getProfile()).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates fullName and lowercases email', async () => {
    const result = await service.updateProfile({
      fullName: 'New Name',
      email: 'A@Example.com',
    });
    expect(result.fullName).toBe('New Name');
    expect(result.email).toBe('a@example.com');
  });

  it('rejects an email owned by another user', async () => {
    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce({ id: 'other' });
    await expect(
      service.updateProfile({ email: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('clears the email when null is sent', async () => {
    user.email = 'x@example.com' as any;
    const result = await service.updateProfile({ email: null });
    expect(result.email).toBeNull();
  });

  it('stores the new avatar and removes the previous one', async () => {
    user.avatarFileId = 'f-old' as any;
    const result = await service.updateAvatar({
      originalname: 'me.png',
    } as Express.Multer.File);
    expect(uploadFileService.uploadFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        category: 'avatar',
        originalName: 'me.png',
        relatedEntityId: 'u1',
      }),
    );
    expect(result.avatarFileId).toBe('f-new');
    expect(uploadFileService.deleteFileEntry).toHaveBeenCalledWith('f-old');
  });

  it('does not touch the user when the upload is rejected', async () => {
    uploadFileService.uploadFile.mockRejectedValue(new Error('bad file'));
    await expect(
      service.updateAvatar({ originalname: 'x.exe' } as Express.Multer.File),
    ).rejects.toThrow('bad file');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('still succeeds when old avatar cleanup fails', async () => {
    user.avatarFileId = 'f-old' as any;
    uploadFileService.deleteFileEntry.mockRejectedValue(new Error('x'));
    const result = await service.updateAvatar({
      originalname: 'me.png',
    } as Express.Multer.File);
    expect(result.avatarFileId).toBe('f-new');
  });

  it('removes the avatar', async () => {
    user.avatarFileId = 'f-old' as any;
    const result = await service.removeAvatar();
    expect(result.avatarFileId).toBeNull();
    expect(uploadFileService.deleteFileEntry).toHaveBeenCalledWith('f-old');
  });

  it('merges partial settings updates', async () => {
    const result = await service.updateSettings({ invoiceReminder: false });
    expect(result).toEqual({
      invoiceReminder: false,
      contractExpiryReminder: true,
      paymentReceived: true,
    });
    expect(user.settings).toEqual(result);
  });
});
