import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateContractStatusAddWaitingPaymentInvoice1786897764801 implements MigrationInterface {
    name = 'UpdateContractStatusAddWaitingPaymentInvoice1786897764801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."contracts_status_enum" RENAME TO "contracts_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."contracts_status_enum" AS ENUM('PENDING_START', 'WAITING_PAYMENT_INVOICE', 'ACTIVE', 'ENDED', 'TERMINATED_EARLY', 'EXPIRED', 'DRAFT')`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "status" TYPE "public"."contracts_status_enum" USING "status"::"text"::"public"."contracts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'PENDING_START'`);
        await queryRunner.query(`DROP TYPE "public"."contracts_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."contracts_status_enum_old" AS ENUM('PENDING_START', 'ACTIVE', 'ENDED', 'TERMINATED_EARLY', 'EXPIRED', 'DRAFT')`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "status" TYPE "public"."contracts_status_enum_old" USING "status"::"text"::"public"."contracts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'PENDING_START'`);
        await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."contracts_status_enum_old" RENAME TO "contracts_status_enum"`);
    }

}
