import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceAddTriggerGenCode1783871118805
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS gen_code_invoice()`);
    await queryRunner.query(`
CREATE OR REPLACE FUNCTION gen_code_invoice()
RETURNS trigger AS $$
BEGIN
  NEW.code := gen_code('INVOICE', NEW."propertyId"::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gen_code_invoice
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION gen_code_invoice();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
