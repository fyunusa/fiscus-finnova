import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLoanTables1771422654602 implements MigrationInterface {
    name = 'CreateLoanTables1771422654602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."loan_products_producttype_enum" AS ENUM('apartment', 'building', 'credit', 'business-loan', 'unsecured')`);
        await queryRunner.query(`CREATE TYPE "public"."loan_products_repaymentmethod_enum" AS ENUM('equal-principal-interest', 'equal-principal', 'bullet')`);
        await queryRunner.query(`CREATE TABLE "loan_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "productType" "public"."loan_products_producttype_enum" NOT NULL, "maxLTV" double precision NOT NULL DEFAULT '70', "minInterestRate" double precision NOT NULL, "maxInterestRate" double precision NOT NULL, "minLoanAmount" bigint NOT NULL, "maxLoanAmount" bigint NOT NULL, "minLoanPeriod" integer NOT NULL, "maxLoanPeriod" integer NOT NULL, "repaymentMethod" "public"."loan_products_repaymentmethod_enum" NOT NULL DEFAULT 'equal-principal-interest', "isActive" boolean NOT NULL DEFAULT true, "requiredDocuments" json, "terms" text, "conditions" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3524994d77fb59b9a76e589e7ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."loan_application_documents_documenttype_enum" AS ENUM('id_copy', 'property_deed', 'financial_statement', 'employment_letter', 'tax_return', 'mortgage_document', 'bank_statement')`);
        await queryRunner.query(`CREATE TABLE "loan_application_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "loanApplicationId" uuid NOT NULL, "documentType" "public"."loan_application_documents_documenttype_enum" NOT NULL, "fileName" character varying(255) NOT NULL, "fileUrl" character varying(500) NOT NULL, "fileSize" character varying(100), "mimeType" character varying(50), "notes" text, "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_35250078f4d54cee8e8f2925898" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6e25e0aea2f78f297f845c1c92" ON "loan_application_documents" ("loanApplicationId") `);
        await queryRunner.query(`CREATE TYPE "public"."loan_applications_collateraltype_enum" AS ENUM('apartment', 'building', 'land', 'vehicle', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."loan_applications_status_enum" AS ENUM('pending', 'submitted', 'reviewing', 'approved', 'rejected', 'active', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "loan_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationNo" character varying(50) NOT NULL, "userId" uuid NOT NULL, "loanProductId" uuid NOT NULL, "requestedLoanAmount" bigint NOT NULL, "approvedLoanAmount" bigint, "approvedInterestRate" double precision, "approvedLoanPeriod" integer, "collateralType" "public"."loan_applications_collateraltype_enum" NOT NULL, "collateralValue" bigint NOT NULL, "collateralAddress" character varying(500) NOT NULL, "collateralDetails" text, "status" "public"."loan_applications_status_enum" NOT NULL DEFAULT 'pending', "statusHistory" json, "rejectionReason" text, "applicantNotes" text, "reviewerNotes" text, "reviewedBy" uuid, "submittedAt" TIMESTAMP, "approvedAt" TIMESTAMP, "rejectedAt" TIMESTAMP, "disbursedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_49146ecff2f19ba7aed628a2544" UNIQUE ("applicationNo"), CONSTRAINT "PK_a40270ea2f2b1fbc185b0f5684a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_49146ecff2f19ba7aed628a254" ON "loan_applications" ("applicationNo") `);
        await queryRunner.query(`CREATE INDEX "IDX_6b27a7a458d012bede19920359" ON "loan_applications" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_50d35c121ce7f61cbed1b6134c" ON "loan_applications" ("loanProductId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cb764a2462ec43648fcccd72d" ON "loan_applications" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."loan_repayment_schedules_paymentstatus_enum" AS ENUM('unpaid', 'paid', 'partial', 'overdue', 'waived')`);
        await queryRunner.query(`CREATE TABLE "loan_repayment_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "loanAccountId" uuid NOT NULL, "month" integer NOT NULL, "scheduledPaymentDate" TIMESTAMP NOT NULL, "principalPayment" bigint NOT NULL, "interestPayment" bigint NOT NULL, "totalPaymentAmount" bigint NOT NULL, "paymentStatus" "public"."loan_repayment_schedules_paymentstatus_enum" NOT NULL DEFAULT 'unpaid', "actualPaymentDate" TIMESTAMP, "actualPaidAmount" bigint, "remainingPrincipal" bigint NOT NULL DEFAULT '0', "dayOverdue" integer NOT NULL DEFAULT '0', "lateFee" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e0accb85b90c917ac852b94f5bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1a820a670660879cc725fb3ce6" ON "loan_repayment_schedules" ("scheduledPaymentDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_850e5bf42844cd34dbc94d7f94" ON "loan_repayment_schedules" ("month") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2206f6bbbec35da55d6fa61ee" ON "loan_repayment_schedules" ("loanAccountId") `);
        await queryRunner.query(`CREATE TYPE "public"."loan_accounts_repaymentmethod_enum" AS ENUM('equal-principal-interest', 'equal-principal', 'bullet')`);
        await queryRunner.query(`CREATE TYPE "public"."loan_accounts_status_enum" AS ENUM('active', 'suspended', 'closed', 'defaulted')`);
        await queryRunner.query(`CREATE TABLE "loan_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountNumber" character varying(100) NOT NULL, "userId" uuid NOT NULL, "loanApplicationId" uuid, "principalAmount" bigint NOT NULL, "interestRate" double precision NOT NULL, "loanPeriod" integer NOT NULL, "repaymentMethod" "public"."loan_accounts_repaymentmethod_enum" NOT NULL, "principalBalance" bigint NOT NULL, "totalInterestAccrued" bigint NOT NULL DEFAULT '0', "totalPaid" bigint NOT NULL DEFAULT '0', "remainingPeriod" integer NOT NULL, "nextPaymentAmount" bigint NOT NULL, "nextPaymentDate" TIMESTAMP NOT NULL, "status" "public"."loan_accounts_status_enum" NOT NULL DEFAULT 'active', "overdueMonths" integer NOT NULL DEFAULT '0', "overdueAmount" bigint NOT NULL DEFAULT '0', "startDate" TIMESTAMP NOT NULL, "targetEndDate" TIMESTAMP NOT NULL, "closedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ef3a46f92b614b1bb6cb5da6573" UNIQUE ("accountNumber"), CONSTRAINT "PK_1ddb3a7fc4a8e9ed847465f1b5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ef3a46f92b614b1bb6cb5da657" ON "loan_accounts" ("accountNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_68e2d253ba317af6d3f8937873" ON "loan_accounts" ("loanApplicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_766875e20170f6c74c6c6d9205" ON "loan_accounts" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."loan_repayment_transactions_paymentmethod_enum" AS ENUM('bank_transfer', 'auto_debit', 'virtual_account', 'manual')`);
        await queryRunner.query(`CREATE TYPE "public"."loan_repayment_transactions_status_enum" AS ENUM('success', 'failed', 'pending', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "loan_repayment_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionNo" character varying(100) NOT NULL, "loanAccountId" uuid NOT NULL, "scheduleId" uuid, "paymentAmount" bigint NOT NULL, "paymentDate" TIMESTAMP NOT NULL, "paymentMethod" "public"."loan_repayment_transactions_paymentmethod_enum" NOT NULL, "principalApplied" bigint NOT NULL DEFAULT '0', "interestApplied" bigint NOT NULL DEFAULT '0', "penaltyApplied" bigint NOT NULL DEFAULT '0', "feesApplied" bigint NOT NULL DEFAULT '0', "status" "public"."loan_repayment_transactions_status_enum" NOT NULL, "bankReference" character varying(255), "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a6f4aec25f1fad94892047cf1a2" UNIQUE ("transactionNo"), CONSTRAINT "PK_bd543961a67572c1f8dd10d5754" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f998202e93a0c3b3fa735c773b" ON "loan_repayment_transactions" ("paymentDate") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a6f4aec25f1fad94892047cf1a" ON "loan_repayment_transactions" ("transactionNo") `);
        await queryRunner.query(`CREATE INDEX "IDX_8040c6fc50afa5d29745e7327e" ON "loan_repayment_transactions" ("scheduleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cc996e8c4ee79196173a3d1bce" ON "loan_repayment_transactions" ("loanAccountId") `);
        await queryRunner.query(`CREATE TYPE "public"."loan_consultations_status_enum" AS ENUM('new', 'contacted', 'in_progress', 'completed', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "loan_consultations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(100) NOT NULL, "loanType" character varying(100), "requestedAmount" bigint, "propertyType" character varying(100), "purpose" character varying(255), "message" text, "status" "public"."loan_consultations_status_enum" NOT NULL DEFAULT 'new', "assignedOffer" uuid, "contactedAt" TIMESTAMP, "responseNote" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1dff7b4155d2c93126b6e761f35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_45cf7fe8aff28fa2ade344885b" ON "loan_consultations" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_c38fc68d25ef4bf458d3ddc1cf" ON "loan_consultations" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_2a2847715e8914cdb5378b7daa" ON "loan_consultations" ("email") `);
        await queryRunner.query(`ALTER TABLE "loan_application_documents" ADD CONSTRAINT "FK_6e25e0aea2f78f297f845c1c92c" FOREIGN KEY ("loanApplicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD CONSTRAINT "FK_2cb764a2462ec43648fcccd72de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD CONSTRAINT "FK_50d35c121ce7f61cbed1b6134c1" FOREIGN KEY ("loanProductId") REFERENCES "loan_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_repayment_schedules" ADD CONSTRAINT "FK_f2206f6bbbec35da55d6fa61eee" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_accounts" ADD CONSTRAINT "FK_766875e20170f6c74c6c6d92059" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_accounts" ADD CONSTRAINT "FK_68e2d253ba317af6d3f89378737" FOREIGN KEY ("loanApplicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_repayment_transactions" ADD CONSTRAINT "FK_cc996e8c4ee79196173a3d1bce5" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_repayment_transactions" ADD CONSTRAINT "FK_8040c6fc50afa5d29745e7327ea" FOREIGN KEY ("scheduleId") REFERENCES "loan_repayment_schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_consultations" ADD CONSTRAINT "FK_1d6e252a7012e7fadae73285590" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan_consultations" DROP CONSTRAINT "FK_1d6e252a7012e7fadae73285590"`);
        await queryRunner.query(`ALTER TABLE "loan_repayment_transactions" DROP CONSTRAINT "FK_8040c6fc50afa5d29745e7327ea"`);
        await queryRunner.query(`ALTER TABLE "loan_repayment_transactions" DROP CONSTRAINT "FK_cc996e8c4ee79196173a3d1bce5"`);
        await queryRunner.query(`ALTER TABLE "loan_accounts" DROP CONSTRAINT "FK_68e2d253ba317af6d3f89378737"`);
        await queryRunner.query(`ALTER TABLE "loan_accounts" DROP CONSTRAINT "FK_766875e20170f6c74c6c6d92059"`);
        await queryRunner.query(`ALTER TABLE "loan_repayment_schedules" DROP CONSTRAINT "FK_f2206f6bbbec35da55d6fa61eee"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP CONSTRAINT "FK_50d35c121ce7f61cbed1b6134c1"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP CONSTRAINT "FK_2cb764a2462ec43648fcccd72de"`);
        await queryRunner.query(`ALTER TABLE "loan_application_documents" DROP CONSTRAINT "FK_6e25e0aea2f78f297f845c1c92c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a2847715e8914cdb5378b7daa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c38fc68d25ef4bf458d3ddc1cf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45cf7fe8aff28fa2ade344885b"`);
        await queryRunner.query(`DROP TABLE "loan_consultations"`);
        await queryRunner.query(`DROP TYPE "public"."loan_consultations_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc996e8c4ee79196173a3d1bce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8040c6fc50afa5d29745e7327e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6f4aec25f1fad94892047cf1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f998202e93a0c3b3fa735c773b"`);
        await queryRunner.query(`DROP TABLE "loan_repayment_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."loan_repayment_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."loan_repayment_transactions_paymentmethod_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_766875e20170f6c74c6c6d9205"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_68e2d253ba317af6d3f8937873"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef3a46f92b614b1bb6cb5da657"`);
        await queryRunner.query(`DROP TABLE "loan_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."loan_accounts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."loan_accounts_repaymentmethod_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2206f6bbbec35da55d6fa61ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_850e5bf42844cd34dbc94d7f94"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a820a670660879cc725fb3ce6"`);
        await queryRunner.query(`DROP TABLE "loan_repayment_schedules"`);
        await queryRunner.query(`DROP TYPE "public"."loan_repayment_schedules_paymentstatus_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cb764a2462ec43648fcccd72d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_50d35c121ce7f61cbed1b6134c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b27a7a458d012bede19920359"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49146ecff2f19ba7aed628a254"`);
        await queryRunner.query(`DROP TABLE "loan_applications"`);
        await queryRunner.query(`DROP TYPE "public"."loan_applications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."loan_applications_collateraltype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e25e0aea2f78f297f845c1c92"`);
        await queryRunner.query(`DROP TABLE "loan_application_documents"`);
        await queryRunner.query(`DROP TYPE "public"."loan_application_documents_documenttype_enum"`);
        await queryRunner.query(`DROP TABLE "loan_products"`);
        await queryRunner.query(`DROP TYPE "public"."loan_products_repaymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."loan_products_producttype_enum"`);
    }

}
