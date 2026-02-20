import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVirtualAccountRequestTable1771499947695 implements MigrationInterface {
    name = 'CreateVirtualAccountRequestTable1771499947695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for virtual account request status
        await queryRunner.query(`CREATE TYPE "public"."virtual_account_requests_status_enum" AS ENUM('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED')`);
        
        // Create the virtual_account_requests table
        await queryRunner.query(`
            CREATE TABLE "virtual_account_requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "paymentKey" character varying(100) NOT NULL UNIQUE,
                "orderId" character varying(50) NOT NULL,
                "checkoutUrl" text NOT NULL,
                "status" "public"."virtual_account_requests_status_enum" NOT NULL DEFAULT 'PENDING',
                "amount" bigint NOT NULL,
                "expireDays" bigint NOT NULL DEFAULT 365,
                "virtualAccountId" uuid,
                "apiResponse" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "completedAt" TIMESTAMP,
                CONSTRAINT "PK_virtual_account_requests_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_virtual_account_requests_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_virtual_account_requests_virtualAccountId" FOREIGN KEY ("virtualAccountId") REFERENCES "virtual_accounts"("id") ON DELETE SET NULL
            )
        `);
        
        // Create indexes for better query performance
        await queryRunner.query(`CREATE INDEX "IDX_virtual_account_requests_userId" ON "virtual_account_requests" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_virtual_account_requests_paymentKey" ON "virtual_account_requests" ("paymentKey")`);
        await queryRunner.query(`CREATE INDEX "IDX_virtual_account_requests_status" ON "virtual_account_requests" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_virtual_account_requests_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_virtual_account_requests_paymentKey"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_virtual_account_requests_userId"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "virtual_account_requests"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "public"."virtual_account_requests_status_enum"`);
    }

}
