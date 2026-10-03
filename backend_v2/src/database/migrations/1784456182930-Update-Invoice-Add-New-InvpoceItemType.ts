import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInvoiceAddNewInvpoceItemType1784456182930 implements MigrationInterface {
    name = 'UpdateInvoiceAddNewInvpoceItemType1784456182930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."invoice_items_type_enum" RENAME TO "invoice_items_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_items_type_enum" AS ENUM('ROOM_RENT', 'DESPOSIT_CONTRACT', 'SERVICE_FEE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ALTER COLUMN "type" TYPE "public"."invoice_items_type_enum" USING "type"::"text"::"public"."invoice_items_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_items_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invoice_items_type_enum_old" AS ENUM('ROOM_RENT', 'SERVICE_FEE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ALTER COLUMN "type" TYPE "public"."invoice_items_type_enum_old" USING "type"::"text"::"public"."invoice_items_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_items_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."invoice_items_type_enum_old" RENAME TO "invoice_items_type_enum"`);
    }

}
