import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatarAndSettings1789290300000
  implements MigrationInterface
{
  name = 'AddUserAvatarAndSettings1789290300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "avatarFileId" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD "settings" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "settings"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarFileId"`);
  }
}
