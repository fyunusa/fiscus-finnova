import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVirtualAccountRequest1771501182825 implements MigrationInterface {
    name = 'CreateVirtualAccountRequest1771501182825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."virtual_account_requests_status_enum" AS ENUM('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "virtual_account_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "paymentKey" character varying(100) NOT NULL, "orderId" character varying(50) NOT NULL, "checkoutUrl" text NOT NULL, "status" "public"."virtual_account_requests_status_enum" NOT NULL DEFAULT 'PENDING', "amount" bigint NOT NULL, "expireDays" bigint NOT NULL DEFAULT '365', "virtualAccountId" uuid, "apiResponse" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, CONSTRAINT "REL_fbd2733327a0dae9d574d16a53" UNIQUE ("userId"), CONSTRAINT "REL_6a2bc36bb93d482d34bd71d4f1" UNIQUE ("virtualAccountId"), CONSTRAINT "PK_3c8bf845b0c43ddae89de4bf1c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_03a233d04aed353db3b4c50e14" ON "virtual_account_requests" ("paymentKey") `);
        await queryRunner.query(`CREATE INDEX "IDX_fbd2733327a0dae9d574d16a53" ON "virtual_account_requests" ("userId") `);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "FK_fbd2733327a0dae9d574d16a533" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "FK_6a2bc36bb93d482d34bd71d4f12" FOREIGN KEY ("virtualAccountId") REFERENCES "virtual_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "FK_6a2bc36bb93d482d34bd71d4f12"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "FK_fbd2733327a0dae9d574d16a533"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbd2733327a0dae9d574d16a53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_03a233d04aed353db3b4c50e14"`);
        await queryRunner.query(`DROP TABLE "virtual_account_requests"`);
        await queryRunner.query(`DROP TYPE "public"."virtual_account_requests_status_enum"`);
    }

}
