import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceCarriedOverAmount1789290200000
  implements MigrationInterface
{
  name = 'AddInvoiceCarriedOverAmount1789290200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "carriedOverAmount" numeric(15,2) NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "carriedOverAmount"`,
    );
  }
}
