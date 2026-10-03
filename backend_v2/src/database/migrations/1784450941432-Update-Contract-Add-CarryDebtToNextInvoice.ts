import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateContractAddCarryDebtToNextInvoice1784450941432 implements MigrationInterface {
    name = 'UpdateContractAddCarryDebtToNextInvoice1784450941432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contracts" ADD "carryDebtToNextInvoice" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contracts" DROP COLUMN "carryDebtToNextInvoice"`);
    }

}
