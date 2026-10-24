import { QueryRunner, MigrationInterface } from 'typeorm';
import { CreateRoomActionSignalsView1789290000000 } from './1789290000000-CreateRoomActionSignalsView';

/**
 * Rebuilds vw_room_action_signals:
 * - overdueInvoiceCount no longer counts DRAFT invoices
 * - awaitingPaymentContractId / awaitingPaymentInvoiceId: contract waiting for payment confirmation
 * - hasAvailableSlot: room is rentable and no reserving contract is open-ended (endDate NULL)
 */
export class UpdateRoomActionSignalsView1789290100000
  implements MigrationInterface
{
  name = 'UpdateRoomActionSignalsView1789290100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "vw_room_action_signals"`);
    await queryRunner.query(`
      CREATE VIEW "vw_room_action_signals" AS
      SELECT
        r."id" AS "roomId",
        r."status"::text AS "roomStatus",
        active_contract."id" AS "activeContractId",
        active_contract."startDate" AS "activeContractStartDate",
        active_contract."paymentDueDay" AS "activePaymentDueDay",
        pending_contract."id" AS "pendingContractId",
        awaiting_deposit_contract."id" AS "awaitingDepositContractId",
        expired_contract."id" AS "expiredContractId",
        EXISTS (
          SELECT 1
          FROM "contracts" c
          WHERE c."roomId" = r."id"
            AND c."status" = 'ACTIVE'
            AND c."endDate" IS NULL
            AND c."startDate" <= CURRENT_DATE
        ) AS "hasIndefiniteActiveContract",
        actionable_invoice."id" AS "actionableInvoiceId",
        actionable_invoice."status"::text AS "actionableInvoiceStatus",
        (
          SELECT COUNT(*)::int
          FROM "invoices" i
          WHERE i."roomId" = r."id"
            AND i."status" NOT IN ('PAID', 'CANCELLED', 'DRAFT')
            AND i."dueDate" < CURRENT_DATE
        ) AS "overdueInvoiceCount",
        EXISTS (
          SELECT 1
          FROM "invoices" i
          WHERE i."roomId" = r."id"
            AND i."status" <> 'CANCELLED'
            AND i."billingPeriodStart" <= (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date
            AND i."billingPeriodEnd" >= date_trunc('month', CURRENT_DATE)::date
        ) AS "currentPeriodInvoiceExists",
        waiting_payment_contract."id" AS "awaitingPaymentContractId",
        waiting_payment_invoice."id" AS "awaitingPaymentInvoiceId",
        (
          r."status"::text IN ('AVAILABLE', 'OCCUPIED', 'PENDING_DEPOSIT')
          AND NOT EXISTS (
            SELECT 1
            FROM "contracts" c
            WHERE c."roomId" = r."id"
              AND c."status" IN ('DRAFT', 'PENDING_START', 'WAITING_PAYMENT_INVOICE', 'ACTIVE')
              AND c."endDate" IS NULL
          )
        ) AS "hasAvailableSlot"
      FROM "rooms" r
      LEFT JOIN LATERAL (
        SELECT c.*
        FROM "contracts" c
        WHERE c."roomId" = r."id"
          AND c."status" = 'ACTIVE'
        ORDER BY c."startDate" DESC, c."createdAt" DESC
        LIMIT 1
      ) active_contract ON true
      LEFT JOIN LATERAL (
        SELECT c.*
        FROM "contracts" c
        WHERE c."roomId" = r."id"
          AND c."status" IN ('DRAFT', 'PENDING_START', 'WAITING_PAYMENT_INVOICE')
        ORDER BY c."startDate" DESC, c."createdAt" DESC
        LIMIT 1
      ) pending_contract ON true
      LEFT JOIN LATERAL (
        SELECT c.*
        FROM "contracts" c
        WHERE c."roomId" = r."id"
          AND c."status" = 'WAITING_PAYMENT_INVOICE'
          AND c."depositAmountPaid" > 0
        ORDER BY c."startDate" DESC, c."createdAt" DESC
        LIMIT 1
      ) awaiting_deposit_contract ON true
      LEFT JOIN LATERAL (
        SELECT c.*
        FROM "contracts" c
        WHERE c."roomId" = r."id"
          AND c."status" = 'EXPIRED'
        ORDER BY c."endDate" DESC NULLS LAST, c."createdAt" DESC
        LIMIT 1
      ) expired_contract ON true
      LEFT JOIN LATERAL (
        SELECT i.*
        FROM "invoices" i
        WHERE i."roomId" = r."id"
          AND i."status" IN ('OVERDUE', 'PARTIALLY_PAID', 'PENDING', 'DRAFT')
        ORDER BY
          CASE i."status"
            WHEN 'OVERDUE' THEN 1
            WHEN 'PARTIALLY_PAID' THEN 2
            WHEN 'PENDING' THEN 3
            WHEN 'DRAFT' THEN 4
            ELSE 5
          END,
          i."dueDate" DESC,
          i."createdAt" DESC
        LIMIT 1
      ) actionable_invoice ON true
      LEFT JOIN LATERAL (
        SELECT c.*
        FROM "contracts" c
        WHERE c."roomId" = r."id"
          AND c."status" = 'WAITING_PAYMENT_INVOICE'
        ORDER BY c."startDate" DESC, c."createdAt" DESC
        LIMIT 1
      ) waiting_payment_contract ON true
      LEFT JOIN LATERAL (
        SELECT i.*
        FROM "invoices" i
        WHERE i."contractId" = waiting_payment_contract."id"
          AND i."status" IN ('DRAFT', 'PENDING', 'PARTIALLY_PAID', 'OVERDUE')
        ORDER BY i."createdAt" ASC
        LIMIT 1
      ) waiting_payment_invoice ON true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "vw_room_action_signals"`);
    await new CreateRoomActionSignalsView1789290000000().up(queryRunner);
  }
}
