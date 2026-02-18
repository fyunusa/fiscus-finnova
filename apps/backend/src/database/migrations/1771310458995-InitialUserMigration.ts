import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialUserMigration1771310458995 implements MigrationInterface {
    name = 'InitialUserMigration1771310458995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum" AS ENUM('individual', 'corporate')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`CREATE TYPE "public"."users_signupstep_enum" AS ENUM('created', 'info_verified', 'credentials_set', 'kyc_done', 'identity_verified', 'bank_added', 'documents_uploaded', 'terms_accepted', 'completed')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(255), "lastName" character varying(255), "email" character varying(255) NOT NULL, "password" character varying(255), "phoneNumber" character varying(20), "userType" "public"."users_usertype_enum" NOT NULL DEFAULT 'individual', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "emailVerified" boolean NOT NULL DEFAULT false, "phoneVerified" boolean NOT NULL DEFAULT false, "signupStep" "public"."users_signupstep_enum" NOT NULL DEFAULT 'created', "lastLoginAt" TIMESTAMP, "residentNumber" text, "city" character varying(255), "district" character varying(255), "address" character varying(255), "postcode" character varying(20), "buildingName" character varying(255), "accountNumber" character varying(255), "bankCode" character varying(10), "accountHolder" character varying(255), "businessName" character varying(255), "businessRegistrationNumber" character varying(20), "businessCity" character varying(255), "businessDistrict" character varying(255), "businessAddress" character varying(255), "businessLicenseUrl" character varying(255), "sealCertificateUrl" character varying(255), "representativeIdUrl" character varying(255), "acceptedTerms" boolean NOT NULL DEFAULT false, "acceptedPrivacy" boolean NOT NULL DEFAULT false, "acceptedMarketing" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_signupstep_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
    }

}
