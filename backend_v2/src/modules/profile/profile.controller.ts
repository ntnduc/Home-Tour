import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileSettingsUpdateDto } from './dto/profile-settings.update.dto';
import { ProfileUpdateDto } from './dto/profile.update.dto';
import { ProfileService } from './profile.service';

// Acts on the authenticated user only; no id is accepted from the client.
@ApiTags('Profile')
@ApiBearerAuth()
@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile() {
    return this.profileService.getProfile();
  }

  @Put()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Body() dto: ProfileUpdateDto) {
    return this.profileService.updateProfile(dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload / replace avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  updateAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.profileService.updateAvatar(file);
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove avatar' })
  removeAvatar() {
    return this.profileService.removeAvatar();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get current user settings' })
  getSettings() {
    return this.profileService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update current user settings' })
  updateSettings(@Body() dto: ProfileSettingsUpdateDto) {
    return this.profileService.updateSettings(dto);
  }
}
