import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchemaForBankKycAndPin1771324787798 implements MigrationInterface {
    name = 'CreateSchemaForBankKycAndPin1771324787798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bank_accounts_status_enum" AS ENUM('pending', 'verified', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "bankCode" character varying(10) NOT NULL, "accountNumber" character varying(255) NOT NULL, "accountHolder" character varying(255) NOT NULL, "status" "public"."bank_accounts_status_enum" NOT NULL DEFAULT 'pending', "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d5a6010cfdd00820828655c82a" ON "bank_accounts" ("userId", "isDefault") `);
        await queryRunner.query(`CREATE INDEX "IDX_45ef3ca170943e2c70e8073a7c" ON "bank_accounts" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."kyc_documents_status_enum" AS ENUM('pending', 'approved', 'rejected', 'supplement')`);
        await queryRunner.query(`CREATE TABLE "kyc_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "documentType" character varying(50) NOT NULL, "documentUrl" text NOT NULL, "status" "public"."kyc_documents_status_enum" NOT NULL DEFAULT 'pending', "rejectionReason" text, "adminReviewedBy" character varying(255), "adminReviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02e49877f1578e6285f84e57ab6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0a3afb0117f604ede21112e939" ON "kyc_documents" ("userId", "documentType") `);
        await queryRunner.query(`CREATE INDEX "IDX_5582c3140c9cdbc6e5f61e0577" ON "kyc_documents" ("userId") `);
        await queryRunner.query(`CREATE TABLE "transaction_pins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "pinHash" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "failedAttempts" integer NOT NULL DEFAULT '0', "lockedUntil" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_d468cbede28f436e2f198f3df8" UNIQUE ("userId"), CONSTRAINT "PK_97966c64da667902b16c2d38eff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d468cbede28f436e2f198f3df8" ON "transaction_pins" ("userId") `);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ADD CONSTRAINT "FK_45ef3ca170943e2c70e8073a7c5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kyc_documents" ADD CONSTRAINT "FK_5582c3140c9cdbc6e5f61e05773" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction_pins" ADD CONSTRAINT "FK_d468cbede28f436e2f198f3df83" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_pins" DROP CONSTRAINT "FK_d468cbede28f436e2f198f3df83"`);
        await queryRunner.query(`ALTER TABLE "kyc_documents" DROP CONSTRAINT "FK_5582c3140c9cdbc6e5f61e05773"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" DROP CONSTRAINT "FK_45ef3ca170943e2c70e8073a7c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d468cbede28f436e2f198f3df8"`);
        await queryRunner.query(`DROP TABLE "transaction_pins"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5582c3140c9cdbc6e5f61e0577"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0a3afb0117f604ede21112e939"`);
        await queryRunner.query(`DROP TABLE "kyc_documents"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_documents_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45ef3ca170943e2c70e8073a7c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5a6010cfdd00820828655c82a"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."bank_accounts_status_enum"`);
    }

}
