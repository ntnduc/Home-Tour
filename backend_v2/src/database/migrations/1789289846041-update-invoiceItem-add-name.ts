import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInvoiceItemAddName1789289846041 implements MigrationInterface {
    name = 'UpdateInvoiceItemAddName1789289846041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD "name" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN "name"`);
    }

}
