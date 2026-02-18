import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchemaForInvestments1771397926503 implements MigrationInterface {
    name = 'CreateSchemaForInvestments1771397926503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."investments_type_enum" AS ENUM('apartment', 'credit-card', 'business-loan')`);
        await queryRunner.query(`CREATE TYPE "public"."investments_status_enum" AS ENUM('recruiting', 'funding', 'ending-soon', 'closed')`);
        await queryRunner.query(`CREATE TABLE "investments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "type" "public"."investments_type_enum" NOT NULL, "rate" numeric(5,2) NOT NULL, "period" integer NOT NULL, "fundingGoal" bigint NOT NULL, "fundingCurrent" bigint NOT NULL DEFAULT '0', "minInvestment" bigint NOT NULL, "borrowerType" character varying NOT NULL, "status" "public"."investments_status_enum" NOT NULL, "badge" character varying, "description" text, "propertyAddress" character varying, "propertySize" character varying, "buildYear" integer, "kbValuation" bigint, "currentLien" bigint, "ltv" numeric(5,2), "merchantName" character varying, "merchantCategory" character varying, "outstandingAmount" bigint, "businessName" character varying, "businessCategory" character varying, "annualRevenue" bigint, "investorCount" integer NOT NULL DEFAULT '0', "fundingStartDate" TIMESTAMP, "fundingEndDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a1263853f1a4fb8b849c1c9aff4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_investments_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "user_investments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "investmentId" uuid NOT NULL, "investmentAmount" bigint NOT NULL, "investmentCount" integer NOT NULL, "status" "public"."user_investments_status_enum" NOT NULL DEFAULT 'pending', "expectedRate" numeric(5,2) NOT NULL, "investmentPeriodMonths" integer NOT NULL, "expectedMaturityDate" TIMESTAMP, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "confirmedAt" TIMESTAMP, "completedAt" TIMESTAMP, CONSTRAINT "PK_3827bd757fa273dcbb69aab20a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1186866ca2fd883d4a8028d63d" ON "user_investments" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_baf7655cb47e5be292e1e82cdd" ON "user_investments" ("userId", "investmentId") `);
        await queryRunner.query(`ALTER TABLE "user_investments" ADD CONSTRAINT "FK_c0f255a09fcbb19bc6e8f3bbba4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_investments" ADD CONSTRAINT "FK_59e7975b2d4c1b4d97018332dfc" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_investments" DROP CONSTRAINT "FK_59e7975b2d4c1b4d97018332dfc"`);
        await queryRunner.query(`ALTER TABLE "user_investments" DROP CONSTRAINT "FK_c0f255a09fcbb19bc6e8f3bbba4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_baf7655cb47e5be292e1e82cdd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1186866ca2fd883d4a8028d63d"`);
        await queryRunner.query(`DROP TABLE "user_investments"`);
        await queryRunner.query(`DROP TYPE "public"."user_investments_status_enum"`);
        await queryRunner.query(`DROP TABLE "investments"`);
        await queryRunner.query(`DROP TYPE "public"."investments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."investments_type_enum"`);
    }

}
