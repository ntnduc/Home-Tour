import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInvoiceAddCode1783869807381 implements MigrationInterface {
    name = 'UpdateInvoiceAddCode1783869807381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ADD "code" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "code"`);
    }

}
