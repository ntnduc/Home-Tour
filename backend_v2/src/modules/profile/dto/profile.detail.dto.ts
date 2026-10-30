import { ApiProperty } from '@nestjs/swagger';
import { User, UserSettings } from '../../users/entities/user.entity';

export class ProfileDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  // FileEntry id; the client builds the URL from GET api/upload-file/:id
  @ApiProperty({ nullable: true })
  avatarFileId: string | null;

  @ApiProperty()
  settings: UserSettings;
}
