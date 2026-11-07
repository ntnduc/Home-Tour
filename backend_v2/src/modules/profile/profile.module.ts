import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../current.user/current.user.module';
import { UploadFileModule } from '../upload.file/upload-file.module';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [UsersModule, CurrentUserModule, UploadFileModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
