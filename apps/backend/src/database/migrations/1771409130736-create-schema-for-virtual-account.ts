import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchemaForVirtualAccount1771409130736 implements MigrationInterface {
    name = 'CreateSchemaForVirtualAccount1771409130736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."virtual_account_transactions_type_enum" AS ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'interest', 'fee')`);
        await queryRunner.query(`CREATE TYPE "public"."virtual_account_transactions_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "virtual_account_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "virtualAccountId" uuid NOT NULL, "type" "public"."virtual_account_transactions_type_enum" NOT NULL, "amount" bigint NOT NULL, "status" "public"."virtual_account_transactions_status_enum" NOT NULL DEFAULT 'pending', "balanceBefore" bigint NOT NULL, "balanceAfter" bigint NOT NULL, "description" character varying(500), "referenceNumber" character varying(100), "relatedParty" character varying(255), "bankCode" character varying(50), "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, "failedAt" TIMESTAMP, "failureReason" character varying(500), CONSTRAINT "PK_e2c8ad82dc62e147a662665ffb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_18141d23ceb69424d5e3cafef2" ON "virtual_account_transactions" ("virtualAccountId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_4097fd794daa7b171404b7c5bd" ON "virtual_account_transactions" ("virtualAccountId", "createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."virtual_accounts_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`CREATE TABLE "virtual_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "accountNumber" character varying(20) NOT NULL, "accountName" character varying(100) NOT NULL DEFAULT 'Fiscus Investment Account', "status" "public"."virtual_accounts_status_enum" NOT NULL DEFAULT 'active', "availableBalance" bigint NOT NULL DEFAULT '0', "totalDeposited" bigint NOT NULL DEFAULT '0', "totalWithdrawn" bigint NOT NULL DEFAULT '0', "frozenBalance" bigint NOT NULL DEFAULT '0', "bankCode" character varying(255), "bankName" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastTransactionAt" TIMESTAMP, CONSTRAINT "UQ_72dae0e0239c333dece43e4feba" UNIQUE ("accountNumber"), CONSTRAINT "REL_07dc2370a92290eff490df15e2" UNIQUE ("userId"), CONSTRAINT "PK_cf97c457f495033bd0cdcb70949" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_07dc2370a92290eff490df15e2" ON "virtual_accounts" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."investments_risklevel_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "riskLevel" "public"."investments_risklevel_enum" NOT NULL DEFAULT 'medium'`);
        await queryRunner.query(`ALTER TABLE "virtual_account_transactions" ADD CONSTRAINT "FK_f33d72fdc8e49c5e781725d9ec1" FOREIGN KEY ("virtualAccountId") REFERENCES "virtual_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ADD CONSTRAINT "FK_07dc2370a92290eff490df15e23" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_accounts" DROP CONSTRAINT "FK_07dc2370a92290eff490df15e23"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_transactions" DROP CONSTRAINT "FK_f33d72fdc8e49c5e781725d9ec1"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "riskLevel"`);
        await queryRunner.query(`DROP TYPE "public"."investments_risklevel_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_07dc2370a92290eff490df15e2"`);
        await queryRunner.query(`DROP TABLE "virtual_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."virtual_accounts_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4097fd794daa7b171404b7c5bd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_18141d23ceb69424d5e3cafef2"`);
        await queryRunner.query(`DROP TABLE "virtual_account_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."virtual_account_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."virtual_account_transactions_type_enum"`);
    }

}
