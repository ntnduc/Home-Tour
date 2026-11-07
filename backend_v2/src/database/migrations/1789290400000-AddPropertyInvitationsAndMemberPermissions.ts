import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyInvitationsAndMemberPermissions1789290400000
  implements MigrationInterface
{
  name = 'AddPropertyInvitationsAndMemberPermissions1789290400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "property_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propertyId" uuid NOT NULL, "inviteeUserId" uuid NOT NULL, "invitedById" uuid NOT NULL, "roleId" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "respondedAt" TIMESTAMP, CONSTRAINT "PK_property_invitations_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_property_invitations_pending" ON "property_invitations" ("propertyId", "inviteeUserId") WHERE "status" = 'PENDING'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_property_invitations_invitee" ON "property_invitations" ("inviteeUserId", "status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" ADD CONSTRAINT "FK_property_invitations_property" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" ADD CONSTRAINT "FK_property_invitations_invitee" FOREIGN KEY ("inviteeUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" ADD CONSTRAINT "FK_property_invitations_inviter" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" ADD CONSTRAINT "FK_property_invitations_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "property_member_permissions" ("userId" uuid NOT NULL, "propertyId" uuid NOT NULL, "permission" character varying(100) NOT NULL, "granted" boolean NOT NULL, CONSTRAINT "PK_property_member_permissions" PRIMARY KEY ("userId", "propertyId", "permission"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_member_permissions" ADD CONSTRAINT "FK_pmp_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_member_permissions" ADD CONSTRAINT "FK_pmp_property" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_member_permissions" DROP CONSTRAINT "FK_pmp_property"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_member_permissions" DROP CONSTRAINT "FK_pmp_user"`,
    );
    await queryRunner.query(`DROP TABLE "property_member_permissions"`);
    await queryRunner.query(
      `ALTER TABLE "property_invitations" DROP CONSTRAINT "FK_property_invitations_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" DROP CONSTRAINT "FK_property_invitations_inviter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" DROP CONSTRAINT "FK_property_invitations_invitee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_invitations" DROP CONSTRAINT "FK_property_invitations_property"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_property_invitations_invitee"`);
    await queryRunner.query(`DROP INDEX "UQ_property_invitations_pending"`);
    await queryRunner.query(`DROP TABLE "property_invitations"`);
  }
}
