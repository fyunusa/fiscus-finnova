import { MigrationInterface, QueryRunner } from "typeorm";

export class FixVirtualAccountRequestOrderIdLength1771501653724 implements MigrationInterface {
    name = 'FixVirtualAccountRequestOrderIdLength1771501653724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "FK_virtual_account_requests_userId"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "FK_virtual_account_requests_virtualAccountId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_virtual_account_requests_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_virtual_account_requests_paymentKey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_virtual_account_requests_status"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "UQ_fbd2733327a0dae9d574d16a533" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "virtual_account_requests_paymentKey_key"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP COLUMN "orderId"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD "orderId" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "UQ_6a2bc36bb93d482d34bd71d4f12" UNIQUE ("virtualAccountId")`);
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
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "UQ_6a2bc36bb93d482d34bd71d4f12"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP COLUMN "orderId"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD "orderId" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "virtual_account_requests_paymentKey_key" UNIQUE ("paymentKey")`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" DROP CONSTRAINT "UQ_fbd2733327a0dae9d574d16a533"`);
        await queryRunner.query(`CREATE INDEX "IDX_virtual_account_requests_status" ON "virtual_account_requests" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_virtual_account_requests_paymentKey" ON "virtual_account_requests" ("paymentKey") `);
        await queryRunner.query(`CREATE INDEX "IDX_virtual_account_requests_userId" ON "virtual_account_requests" ("userId") `);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "FK_virtual_account_requests_virtualAccountId" FOREIGN KEY ("virtualAccountId") REFERENCES "virtual_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "virtual_account_requests" ADD CONSTRAINT "FK_virtual_account_requests_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
